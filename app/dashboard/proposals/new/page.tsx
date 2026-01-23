"use client";
import { useState, useEffect } from "react";
import { ArrowRight, ArrowLeft, Check, FileText, Calculator, Building, AlertCircle, Upload, Wand2, Loader2 } from "lucide-react";
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
  const [aiLoading, setAiLoading] = useState(false);
  
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

  // Errors State
  const [dateError, setDateError] = useState("");

  // Calculated Price
  const [priceResult, setPriceResult] = useState<any>(null);
  const [generatedCode, setGeneratedCode] = useState("");

  useEffect(() => {
    supabase.from('clients').select('id, name, cnpj').then(({ data }) => {
      if (data) setClients(data);
    });
    generateSuggestion();
  }, []);

  useEffect(() => {
    if (selectedService) generateSuggestion();
  }, [selectedService]);

  async function generateSuggestion() {
    const { count } = await supabase.from('proposals').select('*', { count: 'exact', head: true });
    const nextNum = (count || 0) + 1 + 83;
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const type = selectedService || 'AC';
    setGeneratedCode(`${year}${month}${type}${nextNum}`);
  }

  // Validate Dates and Calculate Price
  useEffect(() => {
    if (inputData.start_date && inputData.end_date) {
      if (new Date(inputData.end_date) < new Date(inputData.start_date)) {
        setDateError("A data final não pode ser anterior à data inicial.");
        setPriceResult(null);
      } else {
        setDateError("");
        if (selectedService === 'AC' && inputData.pages > 0) {
          const duration = getMonthsDiff(inputData.start_date, inputData.end_date);
          const result = calculateComplexPrice(Number(inputData.pages), Number(inputData.folders), duration);
          setPriceResult({ ...result, duration });
        }
      }
    }
  }, [inputData, selectedService]);

  const generateAIScope = async () => {
    setAiLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    const serviceName = SERVICES[selectedService as ServiceCode]?.name || "Serviço";
    const generatedText = `O escopo deste serviço de ${serviceName} contempla a execução integral das rotinas mensais, incluindo análise técnica e relatórios gerenciais personalizados. 

Considerações Específicas:
- Atendimento prioritário.
- Adequação às normas vigentes (NBC).
- Revisão periódica de dados.`;
    setInputData(prev => ({ ...prev, scope_details: generatedText }));
    setAiLoading(false);
  };

  async function handleFinish() {
    if (dateError) return;
    setLoading(true);
    const finalValue = priceResult ? priceResult.totalValue : inputData.manual_price;
    const { data, error } = await supabase.from('proposals').insert([{
      client_id: selectedClient,
      code: generatedCode,
      service_type: selectedService,
      status: 'GENERATED',
      input_data: { ...inputData, subType: selectedSubType },
      start_date: inputData.start_date || null,
      end_date: inputData.end_date || null,
      total_value: finalValue,
      base_value: priceResult ? priceResult.baseMonthlyRaw : finalValue
    }]).select();

    if (!error && data) {
      router.push(`/dashboard/proposals/${data[0].id}`);
    } else {
      setLoading(false);
      alert("Erro ao criar proposta: " + (error?.message || "Erro desconhecido"));
    }
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <header className="px-8 py-6 bg-white border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">Nova Proposta</h1>
        <div className="flex gap-8 mt-4">
          <div className={`text-sm font-bold pb-2 border-b-2 ${step >= 1 ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}>1. Cliente</div>
          <div className={`text-sm font-bold pb-2 border-b-2 ${step >= 2 ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}>2. Serviço</div>
          <div className={`text-sm font-bold pb-2 border-b-2 ${step >= 3 ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}>3. Detalhes</div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-800">Selecione o Cliente</h2>
              <select 
                className="w-full p-4 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={selectedClient}
                onChange={e => setSelectedClient(e.target.value)}
              >
                <option value="">-- Escolha um cliente --</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <div className="pt-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Código Sugerido</label>
                <input 
                  type="text" 
                  className="w-full p-3 border border-slate-300 rounded-lg font-mono" 
                  value={generatedCode} 
                  onChange={e => setGeneratedCode(e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-800">Tipo de Serviço</h2>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(SERVICES).map(([code, def]) => (
                  <button 
                    key={code}
                    onClick={() => { setSelectedService(code as ServiceCode); setSelectedSubType(""); }}
                    className={`p-6 rounded-xl border text-left flex gap-4 transition-all ${selectedService === code ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-slate-200 hover:bg-slate-50'}`}
                  >
                    <def.icon size={24} className={selectedService === code ? 'text-blue-600' : 'text-slate-400'} />
                    <div>
                      <h3 className="font-bold">{def.name}</h3>
                      <p className="text-xs text-slate-500">{def.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-800">Detalhes & Período</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data Início</label>
                  <input type="date" className="w-full p-3 border border-slate-300 rounded-lg" value={inputData.start_date} onChange={e => setInputData({ ...inputData, start_date: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data Fim</label>
                  <input type="date" className={`w-full p-3 border rounded-lg ${dateError ? 'border-red-500 ring-1 ring-red-200' : 'border-slate-300'}`} value={inputData.end_date} onChange={e => setInputData({ ...inputData, end_date: e.target.value })} />
                  {dateError && <p className="text-xs text-red-500 mt-1">{dateError}</p>}
                </div>
              </div>

              {selectedService === 'AC' && (
                <div className="p-6 bg-blue-50 rounded-xl border border-blue-100 grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-blue-900">Páginas</label>
                    <input type="number" className="w-full p-3 border border-blue-200 rounded-lg" value={inputData.pages} onChange={e => setInputData({ ...inputData, pages: Number(e.target.value) })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-900">Pastas</label>
                    <input type="number" className="w-full p-3 border border-blue-200 rounded-lg" value={inputData.folders} onChange={e => setInputData({ ...inputData, folders: Number(e.target.value) })} />
                  </div>
                </div>
              )}

              <div className="pt-4">
                <div className="flex justify-between mb-1">
                  <label className="text-sm font-medium text-slate-700">Escopo</label>
                  <button onClick={generateAIScope} className="text-xs text-purple-600 flex items-center gap-1 font-bold">
                    {aiLoading ? <Loader2 className="animate-spin" size={12} /> : <Wand2 size={12} />} Gerar com IA
                  </button>
                </div>
                <textarea rows={4} className="w-full p-4 border border-slate-300 rounded-lg" value={inputData.scope_details} onChange={e => setInputData({ ...inputData, scope_details: e.target.value })} />
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="p-6 bg-white border-t border-slate-200 flex justify-between">
        <button 
          onClick={() => setStep(s => s - 1)} 
          disabled={step === 1}
          className="px-6 py-2 rounded-lg font-bold text-slate-500 disabled:opacity-30"
        >
          Voltar
        </button>
        {step < 3 ? (
          <button 
            onClick={() => setStep(s => s + 1)} 
            disabled={!selectedClient || (step === 2 && !selectedService)}
            className="px-8 py-2 bg-blue-600 text-white rounded-lg font-bold shadow-lg shadow-blue-200"
          >
            Próximo
          </button>
        ) : (
          <button 
            onClick={handleFinish} 
            disabled={loading || !!dateError}
            className="px-8 py-2 bg-green-600 text-white rounded-lg font-bold flex items-center gap-2"
          >
            {loading && <Loader2 className="animate-spin" size={18} />}
            Finalizar Proposta
          </button>
        )}
      </footer>
    </div>
  );
}
