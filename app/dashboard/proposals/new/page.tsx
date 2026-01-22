
"use client";

import { useState, useEffect } from "react";
import { ArrowRight, ArrowLeft, Check, FileText, Calculator, Building, AlertCircle } from "lucide-react";
import { supabase } from "@/app/lib/supabase";
import { SERVICES, ServiceCode, EvaluatedFramework } from "@/app/lib/services";
import { calculateComplexPrice, formatCurrency } from "@/app/lib/pricing";
import { getMonthsDiff } from "@/app/lib/dates";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NewProposalWizard() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Data State
    const [clients, setClients] = useState<any[]>([]);
    const [selectedClient, setSelectedClient] = useState<string>("");

    const [selectedService, setSelectedService] = useState<ServiceCode | "">("");
    const [selectedSubType, setSelectedSubType] = useState<string>("");

    // Dynamic Inputs
    const [inputData, setInputData] = useState({
        start_date: "",
        end_date: "",
        pages: 0,
        folders: 0,
        scope_details: "",
        manual_price: 0
    });

    // Calculated Price (for AC)
    const [priceResult, setPriceResult] = useState<any>(null);

    // Code State
    const [generatedCode, setGeneratedCode] = useState("");

    // Load Clients on mount
    useEffect(() => {
        supabase.from('clients').select('id, name, cnpj').then(({ data }) => {
            if (data) setClients(data);
        });

        // Suggest next code
        generateSuggestion();
    }, []);

    // Also update suggestion when service changes (if not manually edited ideally, but simplistic here)
    useEffect(() => {
        if (selectedService) generateSuggestion();
    }, [selectedService]);

    async function generateSuggestion() {
        // 1. Get Count
        const { count } = await supabase.from('proposals').select('*', { count: 'exact', head: true });
        const nextNum = (count || 0) + 1 + 83; // +83 legacy

        // 2. Format: YYYYMM + TYPE + ID
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const type = selectedService || 'AC';

        setGeneratedCode(`${year}${month}${type}${nextNum}`);
    }

    // Recalculate Price for AC
    useEffect(() => {
        if (selectedService === 'AC' && inputData.pages > 0 && inputData.start_date && inputData.end_date) {
            const duration = getMonthsDiff(inputData.start_date, inputData.end_date);
            const result = calculateComplexPrice(Number(inputData.pages), Number(inputData.folders), duration);
            setPriceResult({ ...result, duration });
        } else {
            setPriceResult(null);
        }
    }, [inputData, selectedService]);

    async function handleFinish() {
        setLoading(true);

        // Determine final value
        const finalValue = priceResult ? priceResult.totalValue : inputData.manual_price;

        const { data, error } = await supabase.from('proposals').insert([{
            client_id: selectedClient,
            code: generatedCode, // Use editable code
            service_type: selectedService,
            status: 'GENERATED',
            input_data: { ...inputData, subType: selectedSubType },
            start_date: inputData.start_date || null,
            end_date: inputData.end_date || null,
            total_value: finalValue,
            base_value: priceResult ? priceResult.baseMonthlyRaw : finalValue
        }]).select();

        setLoading(false);
        if (!error && data) {
            // Redirect to View Page
            router.push(`/dashboard/proposals/${data[0].id}`);
        } else {
            alert("Erro ao criar proposta: " + (error?.message || "Erro desconhecido"));
        }
    }

    // --- Step Components ---

    const StepClient = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-bold text-slate-800">1. Selecione o Cliente</h2>
            <div className="grid gap-4">
                <select
                    className="w-full p-4 border border-slate-300 rounded-xl text-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={selectedClient}
                    onChange={e => setSelectedClient(e.target.value)}
                >
                    <option value="">-- Escolha um cliente --</option>
                    {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.name} {c.cnpj ? `(${c.cnpj})` : ''}</option>
                    ))}
                </select>

                <div className="pt-4 border-t border-slate-100">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Código da Proposta (Sugerido)</label>
                    <input
                        type="text"
                        className="w-full font-mono text-lg tracking-wide p-2 border border-slate-300 rounded-lg bg-slate-50"
                        value={generatedCode}
                        onChange={(e) => setGeneratedCode(e.target.value)}
                    />
                    <p className="text-xs text-slate-500 mt-1">Formato: ANO + MÊS + TIPO + SEQUENCIAL (Editável)</p>
                </div>

                <div className="text-center">
                    <span className="text-slate-500">Ou </span>
                    <Link href="/dashboard/clients/new" className="text-blue-600 font-semibold hover:underline">Cadastre um novo cliente</Link>
                </div>
            </div>
        </div>
    );

    const StepService = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-bold text-slate-800">2. Tipo de Serviço</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(SERVICES).map(([code, def]) => {
                    const Icon = def.icon;
                    const isSelected = selectedService === code;
                    return (
                        <button
                            key={code}
                            onClick={() => { setSelectedService(code as ServiceCode); setSelectedSubType(""); }}
                            className={`p-6 rounded-xl border text-left transition-all flex items-start gap-4
                            ${isSelected ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}
                        `}
                        >
                            <div className={`p-3 rounded-lg ${isSelected ? 'bg-blue-500 text-white' : 'bg-white border border-slate-200 text-slate-500'}`}>
                                <Icon size={24} />
                            </div>
                            <div>
                                <h3 className={`font-bold ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>{def.name}</h3>
                                <p className="text-sm text-slate-500 mt-1 leading-relaxed">{def.description}</p>
                            </div>
                        </button>
                    )
                })}
            </div>

            {/* SubType Selection for AUD */}
            {selectedService && SERVICES[selectedService].subTypes && (
                <div className="mt-6 p-6 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Especifique o Modelo</h3>
                    <div className="space-y-3">
                        {SERVICES[selectedService].subTypes?.map((sub) => (
                            <label key={sub.id} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-blue-300">
                                <input
                                    type="radio"
                                    name="subtype"
                                    checked={selectedSubType === sub.id}
                                    onChange={() => setSelectedSubType(sub.id)}
                                    className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-slate-700 font-medium">{sub.label}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    const StepDetails = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-bold text-slate-800">3. Detalhes & Precificação</h2>

            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Data Início</label>
                    <input type="date" className="input-field" value={inputData.start_date} onChange={e => setInputData({ ...inputData, start_date: e.target.value })} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Data Fim</label>
                    <input type="date" className="input-field" value={inputData.end_date} onChange={e => setInputData({ ...inputData, end_date: e.target.value })} />
                </div>
            </div>

            {/* AC Specific Inputs */}
            {selectedService === 'AC' && (
                <div className="p-6 bg-blue-50/50 rounded-xl border border-blue-100 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-blue-900 mb-1">Média de Páginas</label>
                            <input type="number" className="input-field" value={inputData.pages} onChange={e => setInputData({ ...inputData, pages: Number(e.target.value) })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-blue-900 mb-1">Qtd. Pastas</label>
                            <input type="number" className="input-field" value={inputData.folders} onChange={e => setInputData({ ...inputData, folders: Number(e.target.value) })} />
                        </div>
                    </div>

                    {/* Price Preview */}
                    {priceResult && (
                        <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-slate-500 text-sm">Duração</span>
                                <span className="font-semibold">{priceResult.duration} meses</span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-slate-500 text-sm">Mensalidade (Base)</span>
                                <span className="font-semibold">{formatCurrency(priceResult.baseMonthlyRaw)}</span>
                            </div>
                            <div className="flex justify-between items-center border-t border-slate-100 pt-2 mt-2">
                                <span className="text-slate-900 font-bold">Valor Total do Contrato</span>
                                <span className="text-blue-600 font-bold text-lg">{formatCurrency(priceResult.totalValue)}</span>
                            </div>
                            <p className="text-xs text-green-600 mt-1 text-right">
                                Economia de {formatCurrency(priceResult.savings)} ({Math.round(priceResult.discountRate * 100)}%)
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Generic Inputs */}
            {selectedService !== 'AC' && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Detalhes do Escopo / Observações</label>
                        <textarea
                            rows={3}
                            className="input-field resize-none"
                            placeholder="Descreva particularidades do serviço..."
                            value={inputData.scope_details}
                            onChange={e => setInputData({ ...inputData, scope_details: e.target.value })}
                        ></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Valor Total (Manual)</label>
                        <input
                            type="number"
                            className="input-field font-mono"
                            placeholder="0.00"
                            value={inputData.manual_price || ''}
                            onChange={e => setInputData({ ...inputData, manual_price: Number(e.target.value) })}
                        />
                    </div>
                </div>
            )}
        </div>
    );

    // --- Main Render ---
    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Header */}
            <header className="px-8 py-6 bg-white border-b border-slate-200">
                <h1 className="text-2xl font-bold text-slate-900">Nova Proposta</h1>

                {/* Progress Bar */}
                <div className="flex items-center gap-2 mt-4 text-sm font-medium text-slate-500">
                    <span className={step >= 1 ? "text-blue-600" : ""}>Cliente</span>
                    <ArrowRight size={14} />
                    <span className={step >= 2 ? "text-blue-600" : ""}>Serviço</span>
                    <ArrowRight size={14} />
                    <span className={step >= 3 ? "text-blue-600" : ""}>Detalhes</span>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-auto p-8">
                <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200 min-h-[500px] flex flex-col">

                    <div className="flex-1">
                        {step === 1 && <StepClient />}
                        {step === 2 && <StepService />}
                        {step === 3 && <StepDetails />}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between mt-8 pt-8 border-t border-slate-100">
                        <button
                            onClick={() => setStep(s => Math.max(1, s - 1))}
                            disabled={step === 1}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-all"
                        >
                            <ArrowLeft size={18} /> Voltar
                        </button>

                        {step < 3 ? (
                            <button
                                onClick={() => setStep(s => s + 1)}
                                disabled={
                                    (step === 1 && !selectedClient) ||
                                    (step === 2 && !selectedService) ||
                                    (step === 2 && selectedService === 'AUD' && !selectedSubType)
                                }
                                className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 disabled:opacity-50 disabled:shadow-none transition-all"
                            >
                                Próximo <ArrowRight size={18} />
                            </button>
                        ) : (
                            <button
                                onClick={handleFinish}
                                disabled={loading || (selectedService === 'AC' && !priceResult)}
                                className="flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-200 disabled:opacity-50 disabled:shadow-none transition-all"
                            >
                                {loading ? <div className="animate-spin w-5 h-5 border-2 border-white rounded-full border-t-transparent" /> : <Check size={18} />}
                                Gerar Proposta
                            </button>
                        )}
                    </div>

                </div>
            </div>

            <style jsx global>{`
        .input-field {
            width: 100%;
            padding: 0.75rem 1rem;
            border: 1px solid #e2e8f0;
            border-radius: 0.75rem;
            outline: none;
            transition: all 0.2s;
        }
        .input-field:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
      `}</style>
        </div>
    );
}
