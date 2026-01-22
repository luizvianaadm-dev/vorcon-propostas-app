"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { formatCurrency } from "@/app/lib/pricing";
import { FileDown, ArrowLeft } from "lucide-react";
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
    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Proposta ${proposal?.code}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
    .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; }
    .section { margin: 30px 0; }
    .section-title { font-size: 18px; font-weight: bold; color: #1e40af; margin-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    td { padding: 8px; border: 1px solid #e5e7eb; }
    .total { font-size: 20px; font-weight: bold; text-align: right; color: #2563eb; }
  </style>
</head>
<body>
  <div class="header">
    <h1>VORCON PRO</h1>
    <h2>Proposta Comercial</h2>
    <p><strong>Código:</strong> ${proposal?.code}</p>
  </div>
  <div class="section">
    <div class="section-title">CLIENTE</div>
    <table>
      <tr><td><strong>Nome:</strong></td><td>${proposal?.clients.name}</td></tr>
      <tr><td><strong>CNPJ:</strong></td><td>${proposal?.clients.cnpj}</td></tr>
      <tr><td><strong>Endereço:</strong></td><td>${proposal?.clients.address}</td></tr>
    </table>
  </div>
  <div class="section">
    <div class="section-title">DETALHES DO SERVIÇO</div>
    <table>
      <tr><td><strong>Tipo:</strong></td><td>${proposal?.service_type}</td></tr>
      <tr><td><strong>Período:</strong></td><td>${proposal?.start_date || 'N/A'} a ${proposal?.end_date || 'N/A'}</td></tr>
      <tr><td><strong>Observações:</strong></td><td>${proposal?.input_data?.scope_details || 'N/A'}</td></tr>
    </table>
  </div>
  <div class="section">
    <div class="section-title">VALOR</div>
    <p class="total">Total: R$ ${(proposal?.total_value || 0).toFixed(2).replace('.', ',')}</p>
  </div>
</body>
</html>
    `;
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
        <button onClick={generateHTML} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2">
          <FileDown size={18} />Baixar HTML
        </button>
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
