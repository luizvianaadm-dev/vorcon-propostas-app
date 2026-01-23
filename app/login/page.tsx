"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { Loader2, ShieldAlert, Lock, Mail } from "lucide-react";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
    const [resetMode, setResetMode] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const errorObj = searchParams.get('error');
    if (errorObj === 'unauthorized') {
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
      setError(error.message);
      setLoading(false);
      return;
    }

    // Verifica se o email está na whitelist
    const ALLOWED_EMAILS = ['luizviana@vorcon.com.br', 'comercial@vorcon.com.br'];
    
    if (!ALLOWED_EMAILS.includes(email.toLowerCase())) {
      await supabase.auth.signOut();
      setError("Seu email não tem permissão para acessar este sistema.");
      setLoading(false);
      return;
    }

    router.push('/dashboard');
  }

    async function handlePasswordReset(e: React.FormEvent) {
          e.preventDefault();
          setLoading(true);
          setError("");
          setSuccessMessage("");

          const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,                });

          if (error) {
                  setError(error.message);
                  setLoading(false);
                  return;
                }

          setSuccessMessage("Email de recuperação enviado! Verifique sua caixa de entrada.");
          setLoading(false);
        }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 p-3 rounded-full">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Vorcon Propostas
        </h1>
      <p className="text-center text-gray-600 mb-8">{resetMode ? "Digite seu email para recuperar a senha" : "Faça login para continuar"}</p>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-2">
            <ShieldAlert className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

              {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                          <span>{successMessage}</span>
                        </div>
            )}

      <form onSubmit={resetMode ? handlePasswordReset : handleLogin} className="space-y-6">          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="seu@email.com"
                required
                disabled={loading}
              />
            </div>
          </div>

        {!resetMode && (
      <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>
          </div>
              )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
            resetMode ? "Enviando..." : "Entrando..."              </>
            ) : (
            resetMode ? "Enviar" : "Entrar"            )}
          </button>
        </form>

              <div className="mt-6 text-center space-y-3">
                        {resetMode ? (
                <button
                              type="button"
                              onClick={() => {
                                              setResetMode(false);
                                              setError("");
                                              setSuccessMessage("");
                                            }}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              ← Voltar para o login
                            </button>
              ) : (
                <button
                              type="button"
                              onClick={() => {
                                              setResetMode(true);
                                              setError("");
                                            }}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              Esqueceu sua senha?
                            </button>
              )}

                        <Link href="/" className="block text-blue-600 hover:text-blue-700 text-sm font-medium">
                                    ← Voltar para página inicial
                                  </Link>
                      </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            ← Voltar para página inicial
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
