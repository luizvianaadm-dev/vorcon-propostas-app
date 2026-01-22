
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { Loader2, ShieldAlert, Lock, Mail } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const errObj = searchParams.get('error');
        if (errObj === 'unauthorized') {
            setError("Seu email não tem permissão para acessar este sistema.");
        }
    }, [searchParams]);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            setError(error.message === "Invalid login credentials" ? "Email ou senha incorretos." : error.message);
            setLoading(false);
        } else {
            // Check whitelist specifically here too for immediate feedback, though layout handles it
            const ALLOWED_EMAILS = ['luizviana@vorcon.com.br', 'comercial@vorcon.com.br'];
            if (!ALLOWED_EMAILS.includes(email)) {
                await supabase.auth.signOut();
                setError("Acesso restrito a equipe Vorcon.");
                setLoading(false);
            } else {
                router.push("/dashboard");
            }
        }
    }

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">Vorcon Pro</h1>
                    <p className="text-slate-500">Acesso Restrito</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-start gap-3 text-sm">
                        <ShieldAlert size={18} className="shrink-0 mt-0.5" />
                        <div>{error}</div>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email Corporativo</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="pl-10 w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                placeholder="nome@vorcon.com.br"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="pl-10 w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : "Entrar"}
                    </button>
                </form>

                <div className="mt-6 text-center text-xs text-slate-400">
                    <p>Esqueceu a senha? Contate o administrador.</p>
                    <Link href="/" className="text-blue-600 hover:underline mt-2 inline-block">Voltar ao início</Link>
                </div>
            </div>
        </div>
    );
}
