"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { formatCurrency } from "@/app/lib/pricing";
import { FileDown, ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";

interface ProposalDetail {
  id: string;
  code: string;
  service_type: string;
  status: string;
  total_value: number;
  base_value: number;
  start_date: string;
  end_date: string;
  input_data: any;
  created_at: string;
  clients: { name: string; cnpj: string; address: string };
}

export default function ProposalViewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [proposal, setProposal] = useState<ProposalDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProposal();
  }, [params.id]);

  async function loadProposal() {
    const { data, error } = await supabase
      .from('proposals')
      .select('*, clients(*)')
      .eq('id', params.id)
      .single();
    
    if (data) setProposal(data);
    setLoading(false);
  }

  async function generateHTML() {
    const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Proposta ${proposal?.code} - VORCON</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 900px; margin: 0 auto; padding: 40px; color: #334155; line-height: 1.6; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #1e40af; padding-bottom: 20px; margin-bottom: 40px; }
        .logo { font-size: 28px; font-weight: 800; color: #1e40af; }
        .proposal-info { text-align: right; }
        .section { margin-bottom: 35px; }
        .section-title { font-size: 14px; font-weight: bold; color: #1e40af; text-transform: uppercase; letter-spacing: 1px; border-left: 4px solid #1e40af; padding-left: 10px; margin-bottom: 15px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        td { padding: 12px; border: 1px solid #e2e8f0; vertical-align: top; }
        .label { font-weight: bold; background: #f8fafc; width: 30%; }
        .scope-box { background: #f1f5f9; padding: 20px; border-radius: 8px; white-space: pre-line; }
        .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; }
        .price-total { font-size: 24px; font-weight: bold; color: #1e40af; margin-top: 10px; text-align: right; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">VORCON PRO</div>
        <div class="proposal-info">
            <h1 style="margin:0; font-size: 20px;">PROPOSTA COMERCIAL</h1>
            <p style="margin:5px 0 0; color: #64748b;">Nº ${proposal?.code}</p>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Informações do Cliente</div>
        <table>
            <tr><td class="label">Razão Social</td><td>${proposal?.clients.name}</td></tr>
            <tr><td class="label">CNPJ</td><td>${proposal?.clients.cnpj || 'N/A'}</td></tr>
            <tr><td class="label">Endereço</td><td>${proposal?.clients.address || 'N/A'}</td></tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">Escopo do Serviço</div>
        <div class="scope-box">
            <strong>Serviço:</strong> ${proposal?.service_type}<br><br>
            <strong>Período da Auditoria:</strong> ${proposal?.start_date} a ${proposal?.end_date}<br><br>
            ${proposal?.input_data?.scope_details || 'Detalhes do escopo conforme acordado em reunião.'}
        </div>
    </div>

    <div class="section">
        <div class="section-title">Investimento</div>
        <table>
            <tr><td class="label">Honorários Totais</td><td style="text-align: right; font-weight: bold;">R$ ${(proposal?.total_value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>
        </table>
        <div class="price-total">VALOR TOTAL: R$ ${(proposal?.total_value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
    </div>

    <div class="footer">
        Este documento é uma proposta comercial válida por 15 dias.<br>
        VORCON Auditores e Consultores Independentes
    </div>
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proposta_${proposal?.code}.html`;
    a.click();
  }

  if (loading) return <div className="flex-1 flex items-center justify-center h-full"><p className="text-slate-500">Carregando...</p></div>;
  if (!proposal) return <div className="flex-1 flex items-center justify-center h-full"><p className="text-slate-500">Proposta não encontrada.</p></div>;

  return (
    <div className="flex-1 overflow-auto p-8 h-full">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/proposals" className="text-slate-600 hover:text-slate-900"><ArrowLeft size={24} /></Link>
          <div>
            <h3 className="text-2xl font-bold text-slate-900">Proposta {proposal.code}</h3>
            <p className="text-slate-500">Detalhes e geração de documento</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/proposals/${proposal.id}/edit`} className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2">
            <Edit size={18} />Editar
          </Link>
          <button onClick={generateHTML} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2">
            <FileDown size={18} />Baixar HTML
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 space-y-8">
        <div>
          <h4 className="text-lg font-bold text-slate-800 mb-4">Cliente</h4>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm text-slate-500">Nome</label><p className="font-medium">{proposal.clients.name}</p></div>
            <div><label className="text-sm text-slate-500">CNPJ</label><p className="font-medium">{proposal.clients.cnpj}</p></div>
            <div className="col-span-2"><label className="text-sm text-slate-500">Endereço</label><p className="font-medium">{proposal.clients.address}</p></div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-8">
          <h4 className="text-lg font-bold text-slate-800 mb-4">Serviço</h4>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm text-slate-500">Tipo</label><p className="font-medium">{proposal.service_type}</p></div>
            <div><label className="text-sm text-slate-500">Status</label><p className="font-medium">{proposal.status}</p></div>
            <div><label className="text-sm text-slate-500">Data Início</label><p className="font-medium">{proposal.start_date || 'N/A'}</p></div>
            <div><label className="text-sm text-slate-500">Data Fim</label><p className="font-medium">{proposal.end_date || 'N/A'}</p></div>
            {proposal.input_data?.scope_details && <div className="col-span-2"><label className="text-sm text-slate-500">Observações</label><p className="font-medium">{proposal.input_data.scope_details}</p></div>}
          </div>
        </div>

        <div className="border-t border-slate-200 pt-8">
          <h4 className="text-lg font-bold text-slate-800 mb-4">Valores</h4>
          <div className="bg-blue-50 p-6 rounded-lg">
            <div className="flex justify-between mb-2"><span className="text-slate-600">Valor Base</span><span className="font-medium">{formatCurrency(proposal.base_value)}</span></div>
            <div className="flex justify-between pt-4 border-t border-blue-200"><span className="text-lg font-bold">Valor Total</span><span className="text-2xl font-bold text-blue-600">{formatCurrency(proposal.total_value)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
