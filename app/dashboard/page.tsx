
"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/app/lib/pricing";

export default function Dashboard() {
    return (
        <div className="flex-1 overflow-auto p-8 h-full">

            {/* Action Bar */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-2xl font-bold text-slate-900">Visão Geral</h3>
                    <p className="text-slate-500">Bem-vindo ao Vorcon Pro.</p>
                </div>
                <Link href="/dashboard/proposals/new" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-all">
                    <Plus size={18} />
                    Nova Proposta
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-slate-500 text-sm font-medium mb-1">Propostas Ativas</div>
                    <div className="text-3xl font-bold text-slate-900">12</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-slate-500 text-sm font-medium mb-1">Aprovadas (Mês)</div>
                    <div className="text-3xl font-bold text-green-600">4</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-slate-500 text-sm font-medium mb-1">Receita Estimada</div>
                    <div className="text-3xl font-bold text-blue-600">R$ 48k</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-slate-500 text-sm font-medium mb-1">Clientes na Base</div>
                    <div className="text-3xl font-bold text-slate-900">83</div>
                </div>
            </div>

            {/* Recent Table */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                    <h4 className="font-semibold text-slate-800">Últimas Propostas Geradas</h4>
                    <span className="text-blue-600 text-xs font-semibold cursor-pointer hover:underline">Ver todas</span>
                </div>
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium">
                        <tr>
                            <th className="px-6 py-3">Código</th>
                            <th className="px-6 py-3">Cliente</th>
                            <th className="px-6 py-3">Tipo</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Valor</th>
                            <th className="px-6 py-3 text-right">Ação</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        <tr className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-3 font-mono text-slate-600">2026AC83</td>
                            <td className="px-6 py-3 font-medium text-slate-900">Residencial Havana</td>
                            <td className="px-6 py-3"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">Auditoria</span></td>
                            <td className="px-6 py-3"><span className="flex items-center gap-1 text-green-600 text-xs font-bold"><div className="w-2 h-2 rounded-full bg-green-500"></div>Gerada</span></td>
                            <td className="px-6 py-3">R$ 4.679,80</td>
                            <td className="px-6 py-3 text-right text-blue-600 hover:underline cursor-pointer">Abrir</td>
                        </tr>
                        {/* Placeholder rows */}
                        <tr className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-3 font-mono text-slate-600">2026AC82</td>
                            <td className="px-6 py-3 font-medium text-slate-900">Guarajuba Summer Flat</td>
                            <td className="px-6 py-3"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">Auditoria</span></td>
                            <td className="px-6 py-3"><span className="flex items-center gap-1 text-slate-500 text-xs font-bold">Rascunho</span></td>
                            <td className="px-6 py-3">-</td>
                            <td className="px-6 py-3 text-right text-blue-600 hover:underline cursor-pointer">Editar</td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>
    );
}
