
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { formatCurrency } from "@/app/lib/pricing";
import { Printer, Download, ArrowLeft, FileText, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function ProposalDetailsPage() {
    const params = useParams();
    const [proposal, setProposal] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProposal() {
            const { data, error } = await supabase
                .from('proposals')
                .select('*, client:clients(*)')
                .eq('id', params.id)
                .single();

            if (data) setProposal(data);
            setLoading(false);
        }
        fetchProposal();
    }, [params.id]);

    if (loading) return <div className="p-8 text-center">Carregando proposta...</div>;
    if (!proposal) return <div className="p-8 text-center text-red-500">Proposta não encontrada.</div>;

    const { client, input_data } = proposal;
    const isAC = proposal.service_type === 'AC';

    return (
        <div className="min-h-screen bg-slate-100 font-sans print:bg-white">
            {/* Navbar (Hidden in Print) */}
            <nav className="bg-slate-900 text-white p-4 print:hidden sticky top-0 z-50">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <Link href="/dashboard" className="flex items-center gap-2 text-slate-300 hover:text-white">
                        <ArrowLeft size={18} /> Voltar
                    </Link>
                    <div className="flex gap-4">
                        <button
                            onClick={() => window.print()}
                            className="flex items-center gap-2 bg-white text-slate-900 px-4 py-2 rounded-lg font-bold hover:bg-slate-200 transition-colors"
                        >
                            <Printer size={18} /> Imprimir / PDF
                        </button>
                        <a
                            href={`/api/proposals/${proposal.id}/download`}
                            target="_blank"
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                        >
                            <Download size={18} /> Baixar Contrato (DOCX)
                        </a>
                    </div>
                </div>
            </nav>

            {/* Proposal Content (HTML View) */}
            <div className="max-w-4xl mx-auto bg-white shadow-2xl my-8 print:shadow-none print:my-0 min-h-[29.7cm]">

                {/* Header */}
                <header className="bg-blue-900 text-white p-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-4xl font-extrabold tracking-tight mb-2">Proposta Comercial</h1>
                                <p className="text-blue-200 text-lg">Código: <span className="font-mono bg-blue-800 px-2 py-1 rounded">{proposal.code}</span></p>
                            </div>
                            <div className="text-right">
                                <h2 className="text-xl font-bold">Vorcon Auditoria</h2>
                                <p className="text-sm text-blue-300">Excelência e Transparência</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-12 space-y-12">

                    {/* Client Info */}
                    <section className="flex justify-between items-end border-b border-slate-200 pb-8">
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Cliente</h3>
                            <p className="text-2xl font-bold text-slate-900">{client.name}</p>
                            <p className="text-slate-600">{client.cnpj}</p>
                            <p className="text-slate-500 text-sm mt-1 max-w-md">{client.address}</p>
                        </div>
                        <div className="text-right">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Data</h3>
                            <p className="text-lg font-medium text-slate-900">
                                {new Date(proposal.created_at).toLocaleDateString('pt-BR')}
                            </p>
                        </div>
                    </section>

                    {/* Scope / Service */}
                    <section>
                        <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                            <CheckCircle size={20} /> Escopo dos Serviços
                        </h3>
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                            <h4 className="font-bold text-slate-800 text-lg mb-2">
                                {proposal.service_type === 'AC' ? 'Auditoria Condominial Premium' :
                                    proposal.service_type === 'AUD' ? 'Auditoria Contábil (NBC TA)' :
                                        'Consultoria Especializada'}
                            </h4>

                            {proposal.service_type === 'AC' ? (
                                <p className="text-slate-600 leading-relaxed">
                                    Auditoria completa das pastas de prestação de contas, verificando despesas, receitas, inadimplência e conformidade legal.
                                    Volume estimado: <strong>{input_data.pages} páginas/mês</strong> em <strong>{input_data.folders} pastas</strong>.
                                </p>
                            ) : (
                                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                                    {input_data.scope_details || "Serviços de auditoria e consultoria conforme demandas especificadas em reunião preliminar."}
                                </p>
                            )}
                        </div>
                    </section>

                    {/* Pricing */}
                    <section>
                        <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-xl">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold">Investimento</h3>
                                {isAC && <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold uppercase">Preço Promocional 2026</span>}
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <p className="text-slate-400 text-sm mb-1">Valor Mensal</p>
                                    <p className="text-3xl font-bold">{formatCurrency(proposal.base_value)}</p>
                                    {isAC && <p className="text-sm text-slate-400 mt-1">Duração: {input_data.duration || 12} meses</p>}
                                </div>
                                <div className="text-right border-l border-slate-700 pl-8">
                                    <p className="text-slate-400 text-sm mb-1">Valor Total do Contrato</p>
                                    <p className="text-4xl font-extrabold text-blue-400">{formatCurrency(proposal.total_value)}</p>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-800 text-sm text-slate-400 flex justify-between">
                                <span>Forma de Pagamento: Boleto Bancário</span>
                                <span>Validade da Proposta: 15 dias</span>
                            </div>
                        </div>
                    </section>

                    {/* Footer */}
                    <footer className="text-center pt-12 text-slate-400 text-sm">
                        <p>Vorcon Auditoria & Consultoria • CNPJ 12.345.678/0001-90</p>
                        <p>Salvador, Bahia • (71) 99999-9999</p>
                    </footer>

                </div>
            </div>
        </div>
    );
}
