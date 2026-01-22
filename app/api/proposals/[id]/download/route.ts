
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { SERVICES } from '@/app/lib/services';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { generateInstallmentRows, getCurrentDateExtenso } from '@/app/lib/dates';
import { calculateComplexPrice, formatCurrency } from '@/app/lib/pricing';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const proposalId = params.id;

        // 1. Fetch Proposal Data
        const { data: proposal, error: propError } = await supabase
            .from('proposals')
            .select('*, client:clients(*)')
            .eq('id', proposalId)
            .single();

        if (propError || !proposal) {
            return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
        }

        // 2. Determine Template
        const serviceDef = SERVICES[proposal.service_type as keyof typeof SERVICES];
        if (!serviceDef) {
            return NextResponse.json({ error: 'Invalid Service Type' }, { status: 400 });
        }

        // Logic for SubTypes (e.g. AUD/NBC800)
        let templateName = serviceDef.defaultTemplate;
        const inputData = proposal.input_data || {};

        if (proposal.service_type === 'AUD' && inputData.subType) {
            const sub = serviceDef.subTypes?.find(s => s.id === inputData.subType);
            if (sub && sub.templateFile) templateName = sub.templateFile;
        }

        // 3. Download Template from Storage
        const { data: fileData, error: fileError } = await supabase
            .storage
            .from('templates')
            .download(templateName);

        if (fileError) {
            // Fallback or specific error if template missing
            console.error("Template download error:", fileError);
            return NextResponse.json({ error: `Template ${templateName} not found in storage.` }, { status: 500 });
        }

        // 4. Prepare Data for Merge
        // We need to match the tags in the DOCX: {client_name}, {cnpj}, {code}, {date}, etc.
        // And for tables: {#installments} ... {/installments}

        const client = proposal.client;
        const totalValue = proposal.total_value || 0;

        // Installments
        const installments = generateInstallmentRows(totalValue, 10).map(row => ({
            ...row,
            value: formatCurrency(row.value),
            valuePix: formatCurrency(row.valuePix)
        }));

        // Dates
        const duration = proposal.duration_months || 0;
        const startDate = proposal.start_date ? new Date(proposal.start_date).toLocaleDateString('pt-BR') : 'A Definir';
        const endDate = proposal.end_date ? new Date(proposal.end_date).toLocaleDateString('pt-BR') : 'A Definir';

        const mergeData = {
            client_name: client.name,
            cnpj: client.cnpj || "_______________",
            address: client.address || "",
            code: proposal.code,
            date_extenso: getCurrentDateExtenso(), // "21 de janeiro de 2026"

            // Scope/Pricing
            duration_months: duration,
            start_date: startDate,
            end_date: endDate,
            duration_text: `Período de ${duration} meses, de ${startDate} a ${endDate}.`,

            total_value: formatCurrency(totalValue),

            // Dynamic Fields
            ...inputData, // pages, folders, scope_details

            // Table Loop
            installments: installments
        };

        // 5. Generate DOCX
        const arrayBuffer = await fileData.arrayBuffer();
        const zip = new PizZip(arrayBuffer);

        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });

        doc.render(mergeData);

        const buf = doc.getZip().generate({
            type: "nodebuffer",
            compression: "DEFLATE",
        });

        // 6. Return File
        const filename = `${proposal.code}_${client.name.substring(0, 20).replace(/\s/g, '_')}.docx`;

        return new NextResponse(buf, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition': `attachment; filename="${filename}"`
            }
        });

    } catch (error: any) {
        console.error("Generation Error:", error);
        return NextResponse.json({ error: 'Internal Server Error: ' + error.message }, { status: 500 });
    }
}
