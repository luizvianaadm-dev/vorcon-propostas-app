
"use client";

import { useState } from "react";
import { ArrowLeft, Search, Loader2, Save, Building, MapPin, User, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";

export default function NewClientPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [searchingCnpj, setSearchingCnpj] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        cnpj: "",
        contact_name: "",
        email: "",
        phone: "",
        address: ""
    });

    async function handleSearchCNPJ() {
        if (!formData.cnpj || formData.cnpj.length < 14) return;

        setSearchingCnpj(true);
        try {
            // Remove symbols
            const cleanCNPJ = formData.cnpj.replace(/\D/g, '');
            const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCNPJ}`);

            if (!res.ok) throw new Error("CNPJ não encontrado");

            const data = await res.json();

            // Auto-fill form
            setFormData(prev => ({
                ...prev,
                name: data.razao_social,
                address: `${data.logradouro}, ${data.numero} - ${data.bairro}, ${data.municipio} - ${data.uf}, ${data.cep}`,
                phone: data.ddd_telefone_1 || data.ddd_telefone_2 || "",
                // Ideally map QSA (partners) to a contact or notes, but for now we keep it simple
                contact_name: data.qsa && data.qsa.length > 0 ? data.qsa[0].nome_socio : ""
            }));

        } catch (err) {
            alert("Erro ao buscar CNPJ. Verifique o número e tente novamente.");
        } finally {
            setSearchingCnpj(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.from('clients').insert([{
            ...formData
        }]);

        setLoading(false);

        if (error) {
            alert("Erro ao salvar cliente: " + error.message);
        } else {
            router.push('/dashboard/clients');
        }
    }

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Header */}
            <header className="px-8 py-6 bg-white border-b border-slate-200 flex items-center gap-4">
                <Link href="/dashboard/clients" className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Novo Cliente</h1>
                    <p className="text-slate-500 text-sm">Cadastre manualmente ou importe via CNPJ.</p>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-auto p-8">
                <div className="max-w-3xl mx-auto">
                    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

                        {/* Section: Company Data */}
                        <div className="p-6 border-b border-slate-100">
                            <h3 className="flex items-center gap-2 font-semibold text-slate-800 mb-6">
                                <Building size={18} className="text-blue-500" />
                                Dados da Empresa
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">CNPJ</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            required
                                            placeholder="00.000.000/0000-00"
                                            value={formData.cnpj}
                                            onChange={e => setFormData({ ...formData, cnpj: e.target.value })}
                                            className="w-full pl-4 pr-12 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleSearchCNPJ}
                                            disabled={searchingCnpj}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors disabled:opacity-50"
                                            title="Buscar na Receita Federal"
                                        >
                                            {searchingCnpj ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">Busca automática via BrasilAPI.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Razão Social / Nome</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Endereço Completo</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
                                        <textarea
                                            rows={2}
                                            value={formData.address}
                                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section: Contact Data */}
                        <div className="p-6 bg-slate-50/50">
                            <h3 className="flex items-center gap-2 font-semibold text-slate-800 mb-6">
                                <User size={18} className="text-blue-500" />
                                Contato Principal
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Contato</label>
                                    <input
                                        type="text"
                                        value={formData.contact_name}
                                        onChange={e => setFormData({ ...formData, contact_name: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Telefone / WhatsApp</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            type="text"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                            <Link href="/dashboard/clients" className="px-5 py-2.5 text-slate-600 hover:bg-white hover:border text-sm font-medium rounded-lg transition-all">
                                Cancelar
                            </Link>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-md flex items-center gap-2 transition-all disabled:opacity-70"
                            >
                                {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                Salvar Cliente
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}
