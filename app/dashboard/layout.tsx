"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";
import { LayoutDashboard, Users, FileText, Settings, LogOut, Search, Loader2 } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    const ALLOWED_EMAILS = ['luizviana@vorcon.com.br', 'comercial@vorcon.com.br'];

    useEffect(() => {
        async function checkAuth() {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                router.push('/login');
                return;
            }

            if (!ALLOWED_EMAILS.includes(session.user.email || '')) {
                await supabase.auth.signOut();
                router.push('/login?error=unauthorized');
                return;
            }

            setUser(session.user);
            setLoading(false);
        }

        checkAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) router.push('/login');
        });

        return () => subscription.unsubscribe();
    }, [router]);

    async function handleSignOut() {
        await supabase.auth.signOut();
        router.push('/login');
    }

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-blue-600" size={48} />
                    <p className="text-slate-500 font-medium">Verificando credenciais...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col">
                <div className="p-6 border-b border-slate-800">
                    <h1 className="text-xl font-bold text-white tracking-tight">Vorcon <span className="text-blue-500">Pro</span></h1>
                    <p className="text-xs text-slate-500 mt-1">Gestão de Propostas</p>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <Link href="/dashboard" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/dashboard' ? 'bg-blue-600/10 text-blue-400 border border-blue-900/50' : 'hover:bg-slate-800'}`}>
                        <LayoutDashboard size={18} />
                        Visão Geral
                    </Link>
                    <Link href="/dashboard/clients" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname.startsWith('/dashboard/clients') ? 'bg-blue-600/10 text-blue-400 border border-blue-900/50' : 'hover:bg-slate-800'}`}>
                        <Users size={18} />
                        Clientes
                    </Link>
                    <Link href="/dashboard/proposals/new" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname.startsWith('/dashboard/proposals') ? 'bg-blue-600/10 text-blue-400 border border-blue-900/50' : 'hover:bg-slate-800'}`}>
                        <FileText size={18} />
                        Propostas
                    </Link>
                    <Link href="/dashboard/templates" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname.startsWith('/dashboard/templates') ? 'bg-blue-600/10 text-blue-400 border border-blue-900/50' : 'hover:bg-slate-800'}`}>
                        <Settings size={18} />
                        Templates
                    </Link>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="px-3 pb-4">
                        <p className="text-xs text-slate-500 mb-1">Logado como</p>
                        <p className="text-sm font-medium text-white truncate" title={user.email}>{user.email}</p>
                    </div>
                    <button onClick={handleSignOut} className="flex items-center gap-3 w-full px-3 py-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors">
                        <LogOut size={18} />
                        Sair
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Topbar */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
                    <h2 className="font-semibold text-lg text-slate-800 capitalize">
                        {pathname.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard'}
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input type="text" placeholder="Buscar no sistema..." className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 w-64" />
                        </div>
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xs uppercase">
                            {user.email.substring(0, 2)}
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-hidden relative">
                    {children}
                </div>
            </main>
        </div>
    );
}
