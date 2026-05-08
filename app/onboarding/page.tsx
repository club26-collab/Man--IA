'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/browser';
import { useAuth } from '@/components/AuthProvider';
import { BookOpen, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, perfil, loading, refreshPerfil } = useAuth();
  const [nome, setNome] = useState('');
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (hasRedirectedRef.current) return;
    if (loading) return;

    if (!user) {
      hasRedirectedRef.current = true;
      router.push('/auth');
      return;
    }

    if (perfil?.onboarding_completed) {
      hasRedirectedRef.current = true;
      router.push('/dashboard');
      return;
    }

    if (perfil) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (perfil.nome) setNome(perfil.nome);
    }
  }, [loading, user, perfil, router]);

  const handleComplete = async () => {
    if (!user || nome.trim().length < 2) return;

    setLoadingSubmit(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('perfis')
        .update({
          nome: nome.trim(),
          onboarding_completed: true,
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshPerfil();
      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err as { message: string };
      alert(error.message || 'Erro ao salvar. Tente novamente.');
      setLoadingSubmit(false);
    }
  };

  if (!user || loading || !perfil) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
            <Sparkles className="w-12 h-12 text-teal-400 animate-pulse mx-auto mb-4" />
          </motion.div>
          <p className="text-text-secondary animate-pulse">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4 py-12">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-gold-400/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-lg relative z-10">
        <div className="flex items-center justify-center gap-4 mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/30"
          >
            <BookOpen className="w-4 h-4 text-teal-500" />
            <span className="text-sm text-text-primary">Seu Nome</span>
          </motion.div>
          <div className="w-12 h-px bg-border-soft" />
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500/10 border border-gold-500/30"
          >
            <CheckCircle className="w-4 h-4 text-gold-500" />
            <span className="text-sm text-text-primary">Início</span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-3xl bg-bg-card border border-border-soft backdrop-blur-sm"
        >
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              Bem-vindo ao Maná AI
            </h1>
            <p className="text-text-secondary">
              Como deseja ser chamado?
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && nome.trim().length >= 2 && handleComplete()}
                className="w-full bg-bg-input border border-border-soft rounded-xl px-4 py-4 text-text-primary text-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all placeholder:text-text-secondary"
                placeholder="Seu nome..."
                autoFocus
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleComplete}
              disabled={nome.trim().length < 2 || loadingSubmit}
              className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold py-4 rounded-xl glow-teal transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loadingSubmit ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 animate-spin" />
                  Preparando seu acolhimento...
                </span>
              ) : (
                <>
                  Começar Jornada
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-text-secondary text-xs mt-8 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-3 h-3 text-gold-400" />
          3 acolhimentos gratuitos incluídos
          <Sparkles className="w-3 h-3 text-gold-400" />
        </motion.p>
      </div>
    </div>
  );
}
