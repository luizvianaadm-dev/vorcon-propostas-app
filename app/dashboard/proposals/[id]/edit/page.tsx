"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { SERVICES, ServiceCode } from "@/app/lib/services";
import { calculateComplexPrice, formatCurrency } from "@/app/lib/pricing";
import { getMonthsDiff } from "@/app/lib/dates";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

export default function EditProposalPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [clientName, setClientName] = useState("");
  const [serviceType, setServiceType] = useState<ServiceCode | "">("");
  const [inputData, setInputData] = useState<any>({});
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    loadProposal();
  }, [params.id]);

  async function loadProposal() {
    const { data, error } = await supabase
      .from('proposals')
      .select('*, clients(name)')
      .eq('id', params.id)
      .single();
    
    if (data) {
      setClientName(data.clients.name);
      setServiceType(data.service_type);
      setInputData(data.input_data || {});
      setTotalValue(data.total_value);
    }
    setLoading(false);
  }

  // Recalculate Price if AC
  useEffect(() => {
    if (serviceType === 'AC' && inputData.pages > 0 && inputData.start_date && inputData.end_date) {
      const duration = getMonthsDiff(inputData.start_date, inputData.end_date);
      const result = calculateComplexPrice(Number(inputData.pages), Number(inputData.folders), duration);
      setTotalValue(result.totalValue);
    }
  }, [inputData, serviceType]);

  async function handleSave() {
    setSaving(true);
    const { error } = await supabase
      .from('proposals')
      .update({
        input_data: inputData,
        start_date: inputData.start_date || null,
        end_date: inputData.end_date || null,
        total_value: totalValue
      })
      .eq('id', params.id);

    setSaving(false);
    if (!error) {
      router.push(`/dashboard/proposals/${params.id}`);
    } else {
      alert("Erro ao salvar: " + error.message);
    }
  }

  if (loading) return <div className="flex-1 flex items-center justify-center h-full"><p className="text-slate-500">Carregando...</p></div>;

  return (
    <div className="flex-1 overflow-auto p-8 h-full bg-slate-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/proposals/${params.id}`} className="text-slate-600 hover:text-slate-900"><ArrowLeft size={24} /></Link>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Editar Proposta</h3>
              <p className="text-slate-500">Cliente: {clientName}</p>
            </div>
          </div>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-green-200 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            Salvar Alterações
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data Início</label>
              <input 
                type="date" 
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                value={inputData.start_date || ""} 
                onChange={e => setInputData({ ...inputData, start_date: e.target.value })} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data Fim</label>
              <input 
                type="date" 
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                value={inputData.end_date || ""} 
                onChange={e => setInputData({ ...inputData, end_date: e.target.value })} 
              />
            </div>
          </div>

          {serviceType === 'AC' && (
            <div className="grid grid-cols-2 gap-6 p-6 bg-blue-50 rounded-xl border border-blue-100">
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-1">Média de Páginas</label>
                <input 
                  type="number" 
                  className="w-full p-3 border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                  value={inputData.pages || 0} 
                  onChange={e => setInputData({ ...inputData, pages: Number(e.target.value) })} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-1">Qtd. Pastas</label>
                <input 
                  type="number" 
                  className="w-full p-3 border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                  value={inputData.folders || 0} 
                  onChange={e => setInputData({ ...inputData, folders: Number(e.target.value) })} 
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Detalhes do Escopo</label>
            <textarea 
              rows={6}
              className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" 
              value={inputData.scope_details || ""} 
              onChange={e => setInputData({ ...inputData, scope_details: e.target.value })}
            />
          </div>

          <div className="pt-6 border-t border-slate-100">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-medium">Valor Total da Proposta</span>
              <div className="flex items-center gap-3">
                <span className="text-slate-400 text-sm">R$</span>
                <input 
                  type="number"
                  className="text-2xl font-bold text-blue-600 w-40 text-right bg-transparent border-b-2 border-blue-200 focus:border-blue-500 outline-none"
                  value={totalValue}
                  onChange={e => setTotalValue(Number(e.target.value))}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
