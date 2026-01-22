"use client";

import { useEffect, useState } from "react";
import { Plus, FileText, Eye, Edit3 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";
import { formatCurrency } from "@/app/lib/pricing";

interface Proposal {
  id: string;
  code: string;
  client_id: string;
  service_type: string;
  status: string;
  total_value: number;
  created_at: string;
  clients: { name: string };
}

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProposals();
  }, []);

  async function loadProposals() {
    const { data, error } = await supabase
      .from('proposals')
      .select('*, clients(name)')
      .order('created_at', { ascending: false });
    
    if (data) setProposals(data);
    setLoading(false);
  }

  const getStatusBadge = (status: string) => {
    const styles: any = {
      'GENERATED': 'bg-green-100 text-green-700',
      'DRAFT': 'bg-slate-100 text-slate-600',
      'SENT': 'bg-blue-100 text-blue-700',
      'APPROVED': 'bg-emerald-100 text-emerald-700',
      'REJECTED': 'bg-red-100 text-red-700'
    };
    return styles[status] || 'bg-slate-100 text-slate-600';
  };

  const getServiceLabel = (type: string) => {
    const labels: any = {
      'AC': 'Assessoria Contábil',
      'AUD': 'Auditoria',
      'PPA': 'PPA',
      'CON': 'Consultoria'
    };
    return labels[type] || type;
  };

  return (
    <div className="flex-1 overflow-auto p-8 h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">Propostas</h3>
          <p className="text-slate-500">Gerencie suas propostas comerciais</p>
        </div>
        <Link 
          href="/dashboard/proposals/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-all"
        >
          <Plus size={18} />
          Nova Proposta
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium">
            <tr>
              <th className="px-6 py-3">Código</th>
              <th className="px-6 py-3">Cliente</th>
              <th className="px-6 py-3">Tipo</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Valor</th>
              <th className="px-6 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                  Carregando...
                </td>
              </tr>
            ) : proposals.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                  Nenhuma proposta encontrada. Crie sua primeira proposta!
                </td>
              </tr>
            ) : (
              proposals.map((prop) => (
                <tr key={prop.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 font-mono text-slate-600">{prop.code}</td>
                  <td className="px-6 py-3 font-medium text-slate-900">
                    {prop.clients?.name || 'Cliente não encontrado'}
                  </td>
                  <td className="px-6 py-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                      {getServiceLabel(prop.service_type)}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadge(prop.status)}`}>
                      {prop.status}
                    </span>
                  </td>
                  <td className="px-6 py-3">{formatCurrency(prop.total_value)}</td>
                  <td className="px-6 py-3">
                    <div className="flex gap-2 justify-end">
                      <Link
                        href={`/dashboard/proposals/${prop.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium text-xs flex items-center gap-1"
                      >
                        <Eye size={14} />
                        Abrir
                      </Link>
                      <Link
                        href={`/dashboard/proposals/${prop.id}/edit`}
                        className="text-slate-600 hover:text-slate-800 font-medium text-xs flex items-center gap-1"
                      >
                        <Edit3 size={14} />
                        Editar
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
