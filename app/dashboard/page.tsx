'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import Header from '@/components/Header';
import SentimentInput from '@/components/SentimentInput';
import AcolhimentoDisplay from '@/components/AcolhimentoDisplay';
import QuickStats from '@/components/QuickStats';
import PremiumUpgrade from '@/components/PremiumUpgrade';
import { Sparkles, BookOpen } from 'lucide-react';
import { gerarAcolhimento } from '@/app/actions/acolhimento';

export default function DashboardPage() {
  const router = useRouter();
  const { user, perfil, loading, signOut, refreshPerfil } = useAuth();
  const [acolhimento, setAcolhimento] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [sentimentoId, setSentimentoId] = useState<string | null>(null);
  const [acolhendo, setAcolhendo] = useState(false);
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (redirectedRef.current) return;

    if (loading) return;

    if (!user) {
      redirectedRef.current = true;
      router.push('/auth');
      return;
    }

    if (perfil && !perfil.onboarding_completed) {
      redirectedRef.current = true;
      router.push('/onboarding');
      return;
    }
  }, [loading, user, perfil, router]);

  const handleAcolher = useCallback(async (sentimento: string, nome: string, sentimentoTag: string | null, areaVida: string | null) => {
    setAcolhendo(true);
    setAcolhimento(null);
    setImageUrl(null);

    try {
      const formData = new FormData();
      formData.append('sentimento', sentimento);
      formData.append('nome', nome);
      if (sentimentoTag) formData.append('sentimentoTag', sentimentoTag);
      if (areaVida) formData.append('areaVida', areaVida);

      const data = await gerarAcolhimento(formData);

      if (!data.success) {
        throw new Error(data.error || 'Erro ao buscar acolhimento');
      }

      setAcolhimento(data.acolhimento!);
      setImageUrl(data.imageUrl || null);
      setSentimentoId(data.sentimentoId || null);
      await refreshPerfil();
    } catch (err: unknown) {
      const error = err as { message?: string };
      alert(error.message || 'Erro ao buscar acolhimento. Tente novamente.');
    } finally {
      setAcolhendo(false);
    }
  }, [refreshPerfil]);

  if (loading || (user && !perfil)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="w-12 h-12 text-teal-400 animate-pulse mx-auto mb-4" />
          </motion.div>
          <p className="text-text-secondary animate-pulse">
            Carregando...
          </p>
        </div>
      </div>
    );
  }

  if (!user || !perfil) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Header perfil={perfil} signOut={signOut} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <QuickStats perfil={perfil} />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <SentimentInput
              perfil={perfil}
              onAcolher={handleAcolher}
            />

            {perfil.plano === 'gratis' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8"
              >
                <PremiumUpgrade />
              </motion.div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <AnimatePresence mode="wait">
              {acolhendo ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-gradient-card backdrop-blur-sm border border-border-soft rounded-2xl p-8 min-h-[400px] flex items-center justify-center"
                >
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    >
                      <Sparkles className="w-16 h-16 text-teal-400 mx-auto mb-4" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-text-primary mb-2">
                      Buscando Palavra para Você...
                    </h3>
                    <p className="text-text-secondary">
                      O mentor espiritual está preparando seu acolhimento...
                    </p>
                  </div>
                </motion.div>
              ) : acolhimento ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <AcolhimentoDisplay
                    acolhimento={acolhimento}
                    imageUrl={imageUrl}
                    sentimentoId={sentimentoId}
                    nome={perfil.nome}
                    onNovoAcolhimento={() => { setAcolhimento(null); setImageUrl(null); setSentimentoId(null); }}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gradient-card backdrop-blur-sm border border-border-soft rounded-2xl p-8 min-h-[400px] flex items-center justify-center"
                >
                  <div className="text-center">
                    <BookOpen className="w-16 h-16 text-teal-400/50 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-text-primary mb-2">
                      Seu Acolhimento Diário
                    </h3>
                    <p className="text-text-secondary max-w-xs mx-auto">
                      Compartilhe como está se sentindo e receba uma palavra de conforto personalizada.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
