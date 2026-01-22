
import Image from "next/image";
import { ArrowRight, FileText, Globe, Key, ShieldCheck, Database } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">
              Vorcon Propostas
            </span>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">v2.0 Beta</span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-blue-700 transition-colors">Funcionalidades</a>
            <a href="#fluxo" className="hover:text-blue-700 transition-colors">Como Funciona</a>
          </nav>
          <button className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg hover:shadow-blue-200">
            Acessar Sistema
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 space-y-8 text-center lg:text-left">
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
            Automação de <br />
            <span className="text-blue-700">Contratos & Propostas</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            Abandone o preenchimento manual. O <strong>Vorcon Engine</strong> gera propostas comerciais (HTML) e contratos jurídicos (DOCX) completos em segundos, com cálculo de preços e descontos automáticos.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <button className="w-full sm:w-auto px-8 py-4 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-xl hover:shadow-blue-500/20 transition-all">
              <Database className="w-5 h-5" />
              Começar Agora
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all">
              <FileText className="w-5 h-5" />
              Ver Demo
            </button>
          </div>
        </div>

        {/* Right Illustration */}
        <div className="flex-1 relative w-full aspect-square max-w-lg lg:max-w-none">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-indigo-50 rounded-full blur-3xl opacity-50 animate-pulse"></div>
          <div className="relative bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-500">
            <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Proposta Aprovada</h3>
                <p className="text-sm text-slate-500">Residencial Havana • Código #2026AC83</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-4 bg-slate-100 rounded w-3/4"></div>
              <div className="h-4 bg-slate-100 rounded w-1/2"></div>
              <div className="h-32 bg-slate-50 rounded border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-sm">
                Visualização do Contrato (DOCX/PDF)
              </div>
              <div className="flex justify-between items-center pt-2">
                <div className="text-xs text-slate-400">Gerado em 21/01/2026</div>
                <div className="text-blue-700 font-bold">R$ 4.679,80</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Poderoso & Simples</h2>
            <p className="text-slate-600">Tudo o que você precisa para acelerar o fechamento de contratos.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: FileText, title: "HTML Premium", desc: "Propostas interativas com cálculos de ROI e tabelas de desconto dinâmicas." },
              { icon: ShieldCheck, title: "Contratos Jurídicos", desc: "Geração automática de DOCX com cláusulas, datas e valores preenchidos." },
              { icon: Globe, title: "Acesso em Nuvem", desc: "Gerencie históricos e gere documentos de qualquer lugar, sem planilhas locais." },
            ].map((feature, idx) => (
              <div key={idx} className="p-8 rounded-2xl bg-slate-50 hover:bg-white border border-slate-100 hover:border-blue-100 hover:shadow-xl transition-all group">
                <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-blue-700" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>© 2026 Vorcon Auditoria & Consultoria. Todos os direitos reservados.</p>
          <p className="text-sm mt-2">Sistema Interno de Geração de Propostas v2.0</p>
        </div>
      </footer>
    </div>
  );
}
