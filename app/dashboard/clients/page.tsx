
"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Building2, MapPin, Phone, MoreHorizontal, Loader2 } from "lucide-react";
import { supabase } from "@/app/lib/supabase";
import Link from "next/link";

export default function ClientsPage() {
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchClients();
    }, []);

    async function fetchClients() {
        setLoading(true);
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setClients(data);
        setLoading(false);
    }

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.cnpj?.includes(searchTerm)
    );

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Header */}
            <header className="px-8 py-6 bg-white border-b border-slate-200 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
                    <p className="text-slate-500 text-sm">Gerencie sua base de contatos e empresas.</p>
                </div>
                <Link href="/dashboard/clients/new" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-all">
                    <Plus size={18} />
                    Novo Cliente
                </Link>
            </header>

            {/* Toolbar */}
            <div className="px-8 py-4 flex gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou CNPJ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2.5 w-full border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto px-8 pb-8">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="animate-spin text-blue-600" size={32} />
                    </div>
                ) : filteredClients.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
                        <Building2 className="mx-auto text-slate-300 mb-4" size={48} />
                        <h3 className="text-lg font-medium text-slate-900">Nenhum cliente encontrado</h3>
                        <p className="text-slate-500 mb-6">Cadastre seu primeiro cliente para começar.</p>
                        <Link href="/dashboard/clients/new" className="text-blue-600 font-semibold hover:underline">Cadastrar Cliente</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredClients.map((client) => (
                            <div key={client.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xl uppercase">
                                        {client.name.substring(0, 2)}
                                    </div>
                                    <button className="text-slate-400 hover:text-slate-600">
                                        <MoreHorizontal size={20} />
                                    </button>
                                </div>
                                <h3 className="font-bold text-slate-900 truncate" title={client.name}>{client.name}</h3>
                                <p className="text-sm text-slate-500 font-mono mb-4">{client.cnpj || 'Sem CNPJ'}</p>

                                <div className="space-y-2 text-sm text-slate-600">
                                    {client.address && (
                                        <div className="flex items-start gap-2">
                                            <MapPin size={16} className="mt-0.5 text-slate-400 shrink-0" />
                                            <span className="truncate">{client.address}</span>
                                        </div>
                                    )}
                                    {client.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone size={16} className="text-slate-400" />
                                            <span>{client.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
