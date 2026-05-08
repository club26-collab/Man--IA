'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/browser';
import { BookOpen, ArrowLeft, Sparkles, Mail, Lock, User, RefreshCw } from 'lucide-react';
import Link from 'next/link';

type AuthTab = 'login' | 'signup' | 'reset';

export default function AuthPage() {
  const router = useRouter();
  const [tab, setTab] = useState<AuthTab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const doneRef = useRef(false);

  useEffect(() => {
    if (doneRef.current) return;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) return;
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        doneRef.current = true;
        router.push('/dashboard');
      }
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl) {
        setError('Configure suas variáveis de ambiente Supabase.');
        setLoading(false);
        return;
      }
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: perfil } = await supabase
          .from('perfis')
          .select('onboarding_completed')
          .eq('id', session.user.id)
          .single();

        setTimeout(() => {
          if (perfil?.onboarding_completed) {
            router.push('/dashboard');
          } else {
            router.push('/onboarding');
          }
        }, 100);
      }
    } catch (err: unknown) {
      const authError = err as { message: string };
      setError(authError.message || 'Erro ao autenticar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl) {
        setError('Configure suas variáveis de ambiente Supabase.');
        setLoading(false);
        return;
      }
      if (!nome.trim()) {
        setError('Por favor, preencha seu nome.');
        setLoading(false);
        return;
      }
      const supabase = createClient();
      const { error: signUpError, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome: nome.trim(),
            onboarding_completed: false,
          },
        },
      });
      if (signUpError) throw signUpError;

      if (data.user) {
        setSuccess('Conta criada! Verifique seu e-mail para confirmar o cadastro.');
        setLoading(false);
        return;
      }
    } catch (err: unknown) {
      const authError = err as { message: string };
      setError(authError.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl) {
        setError('Configure suas variáveis de ambiente Supabase.');
        setLoading(false);
        return;
      }
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?tab=reset-confirm`,
      });
      if (resetError) throw resetError;
      setSuccess('Link de recuperação enviado! Verifique seu e-mail.');
    } catch (err: unknown) {
      const authError = err as { message: string };
      setError(authError.message || 'Erro ao enviar link. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const isSupabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4 py-8">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 md:w-96 h-72 md:h-96 bg-teal-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 md:w-96 h-72 md:h-96 bg-gold-400/5 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <Link href="/" className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition mb-6 md:mb-8">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Voltar</span>
        </Link>

        <div className="text-center mb-6 md:mb-8">
          <motion.div
            className="inline-block mb-4"
          >
            <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-tr from-gold-400 to-teal-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <BookOpen className="w-7 h-7 md:w-8 md:h-8 text-white" />
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold tracking-tight mb-2 text-text-primary"
          >
            Maná<span className="text-teal-500">AI</span>
          </motion.h1>
          <p className="text-text-secondary text-sm flex items-center justify-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            Acolhimento Espiritual Diário
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-black/5 rounded-xl mb-6">
          {[
            { id: 'login' as AuthTab, label: 'Entrar' },
            { id: 'signup' as AuthTab, label: 'Criar conta' },
            { id: 'reset' as AuthTab, label: 'Recuperar' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setError(''); setSuccess(''); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                tab === t.id
                  ? 'bg-bg-card text-text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 md:p-8 rounded-3xl bg-bg-card border border-border-soft backdrop-blur-sm"
        >
          <AnimatePresence mode="wait">
            {tab === 'login' && (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleLogin}
                className="space-y-4"
              >
                <h2 className="text-xl font-semibold mb-2 text-text-primary">
                  Bem-vindo de volta
                </h2>
                <p className="text-text-secondary text-sm mb-4">
                  Entre na sua conta para receber seu acolhimento diário.
                </p>

                <div>
                  <label className="block text-sm text-text-secondary mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-bg-input border border-border-soft rounded-xl pl-10 pr-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all placeholder:text-text-secondary text-sm"
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-text-secondary mb-1.5">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-bg-input border border-border-soft rounded-xl pl-10 pr-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all placeholder:text-text-secondary text-sm"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold py-3 rounded-xl shadow-lg shadow-teal-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 animate-spin" />
                      Entrando...
                    </span>
                  ) : 'Entrar'}
                </motion.button>

                {!isSupabaseConfigured && (
                  <p className="text-amber-600 text-xs text-center bg-amber-50 p-2 rounded-lg border border-amber-200">
                    Configure o Supabase para habilitar o login.
                  </p>
                )}
              </motion.form>
            )}

            {tab === 'signup' && (
              <motion.form
                key="signup"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleSignUp}
                className="space-y-4"
              >
                <h2 className="text-xl font-semibold mb-2 text-text-primary">
                  Crie sua conta
                </h2>
                <p className="text-text-secondary text-sm mb-4">
                  Comece sua jornada de acolhimento espiritual com 3 créditos gratuitos.
                </p>

                <div>
                  <label className="block text-sm text-text-secondary mb-1.5">Nome</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="w-full bg-bg-input border border-border-soft rounded-xl pl-10 pr-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all placeholder:text-text-secondary text-sm"
                      placeholder="Como deseja ser chamado?"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-text-secondary mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-bg-input border border-border-soft rounded-xl pl-10 pr-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all placeholder:text-text-secondary text-sm"
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-text-secondary mb-1.5">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-bg-input border border-border-soft rounded-xl pl-10 pr-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all placeholder:text-text-secondary text-sm"
                      placeholder="Mínimo 6 caracteres"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold py-3 rounded-xl shadow-lg shadow-teal-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 animate-spin" />
                      Criando conta...
                    </span>
                  ) : 'Criar Conta'}
                </motion.button>

                {!isSupabaseConfigured && (
                  <p className="text-amber-600 text-xs text-center bg-amber-50 p-2 rounded-lg border border-amber-200">
                    Configure o Supabase para habilitar o cadastro.
                  </p>
                )}
              </motion.form>
            )}

            {tab === 'reset' && (
              <motion.form
                key="reset"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleReset}
                className="space-y-4"
              >
                <h2 className="text-xl font-semibold mb-2 text-text-primary">
                  Recuperar senha
                </h2>
                <p className="text-text-secondary text-sm mb-4">
                  Informe seu email e enviaremos um link para redefinir sua senha.
                </p>

                <div>
                  <label className="block text-sm text-text-secondary mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-bg-input border border-border-soft rounded-xl pl-10 pr-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all placeholder:text-text-secondary text-sm"
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold py-3 rounded-xl shadow-lg shadow-teal-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Enviando...
                    </span>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Enviar Link de Recuperação
                    </>
                  )}
                </motion.button>

                {!isSupabaseConfigured && (
                  <p className="text-amber-600 text-xs text-center bg-amber-50 p-2 rounded-lg border border-amber-200">
                    Configure o Supabase para habilitar a recuperação de senha.
                  </p>
                )}
              </motion.form>
            )}
          </AnimatePresence>

          {(error || success) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-3 rounded-xl text-sm text-center ${
                error ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-teal-50 text-teal-600 border border-teal-200'
              }`}
            >
              {error || success}
            </motion.div>
          )}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-text-secondary text-xs mt-6 md:mt-8 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-3 h-3 text-gold-400" />
          3 acolhimentos gratuitos ao se registrar
          <Sparkles className="w-3 h-3 text-gold-400" />
        </motion.p>
      </motion.div>
    </div>
  );
}
