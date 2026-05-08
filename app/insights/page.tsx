'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import Header from '@/components/Header';
import PremiumUpgrade from '@/components/PremiumUpgrade';
import { Sparkles, LineChart, BookOpen, Heart, BookMarked } from 'lucide-react';
import { gerarReflexaoPersonalizada } from '@/app/actions/insights';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function InsightsPage() {
  const router = useRouter();
  const { user, perfil, loading, signOut, refreshPerfil } = useAuth();
  const [analisando, setAnalisando] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
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

  const handleGerarReflexao = async () => {
    setAnalisando(true);
    setErrorMsg(null);
    setResultado(null);

    try {
      const res = await gerarReflexaoPersonalizada();

      if (!res.success) {
        throw new Error(res.message || res.error || 'Erro ao gerar reflexão.');
      }

      setResultado(res.data);
      await refreshPerfil();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setAnalisando(false);
    }
  };

  if (loading || !user || !perfil) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Sparkles className="w-12 h-12 text-teal-400 animate-pulse" />
      </div>
    );
  }

  const colors = ['#2D5A61', '#4da3af', '#7bbfc8', '#B2C2B1', '#d4b42a'];

  return (
    <div className="min-h-screen">
      <Header perfil={perfil} signOut={signOut} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <LineChart className="w-8 h-8 text-teal-500" />
          <h1 className="text-3xl font-bold text-text-primary">Minhas Reflexões</h1>
        </div>

        {!resultado && !analisando && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-card backdrop-blur-sm border border-border-soft rounded-2xl p-8 text-center"
          >
            <BookMarked className="w-16 h-16 text-teal-400/50 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-text-primary mb-4">Descubra Padrões da Sua Jornada</h2>
            <p className="text-text-secondary mb-8 max-w-lg mx-auto">
              Nossa IA analisa seu histórico de acolhimentos para identificar padrões emocionais e espirituais, revelando como sua vida desperta está influenciando sua caminhada com Deus.
            </p>

            {perfil.plano === 'gratis' && perfil.creditos <= 0 ? (
              <PremiumUpgrade />
            ) : (
              <button
                onClick={handleGerarReflexao}
                className="bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold py-3 px-8 rounded-xl glow-teal hover:shadow-lg transition-all flex items-center justify-center gap-2 mx-auto"
              >
                <Sparkles className="w-5 h-5" />
                Gerar Reflexão (Custa 1 crédito)
              </button>
            )}

            {errorMsg && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm max-w-md mx-auto">
                {errorMsg}
              </div>
            )}
          </motion.div>
        )}

        {analisando && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gradient-card backdrop-blur-sm border border-border-soft rounded-2xl p-12 text-center"
          >
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
              <LineChart className="w-16 h-16 text-teal-400 mx-auto mb-4" />
            </motion.div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">Analisando sua Jornada...</h3>
            <p className="text-text-secondary">Vasculhando seu histórico em busca de padrões emocionais e espirituais.</p>
          </motion.div>
        )}

        {resultado && !analisando && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-gradient-card backdrop-blur-sm border border-border-soft rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-teal-500" /> Temas Recorrentes
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={resultado.temasPrincipais} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <XAxis dataKey="nome" stroke="#5a7075" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis hide />
                    <Tooltip
                      cursor={{ fill: 'rgba(45, 90, 97, 0.1)' }}
                      contentStyle={{ backgroundColor: '#F9F7F2', border: '1px solid rgba(45,90,97,0.2)', borderRadius: '12px', color: '#1a2e33' }}
                    />
                    <Bar dataKey="quantidade" radius={[6, 6, 0, 0]} maxBarSize={60}>
                      {resultado.temasPrincipais.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gradient-card backdrop-blur-sm border border-border-soft rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-text-primary mb-4">Análise Profunda</h3>
              <p className="text-text-primary leading-relaxed">
                {resultado.analiseGeral}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" /> Possíveis Gatilhos
                </h3>
                <ul className="space-y-3">
                  {resultado.gatilhosInfluenciadores.map((gatilho: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-text-primary text-sm">
                      <span className="text-red-400 mt-0.5">•</span> {gatilho}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <BookMarked className="w-5 h-5 text-teal-500" /> Práticas Espirituais
                </h3>
                <ul className="space-y-3">
                  {resultado.dicasEspirituais.map((dica: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-text-primary text-sm">
                      <span className="text-teal-500 mt-0.5">✦</span> {dica}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="px-6 py-4 bg-black/5 rounded-xl border border-border-soft text-center">
              <p className="text-[10px] text-text-secondary leading-relaxed">
                Aviso: Os insights gerados pela inteligência artificial têm caráter de autoconhecimento e bem-estar espiritual,
                e não substituem o acompanhamento pastoral, psicológico ou médico.
              </p>
            </div>

            <div className="flex justify-center pt-4">
              <button
                onClick={handleGerarReflexao}
                className="text-teal-500 hover:text-teal-600 transition-colors text-sm flex items-center gap-2"
              >
                <LineChart className="w-4 h-4" />
                Gerar Nova Reflexão (1 crédito)
              </button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
