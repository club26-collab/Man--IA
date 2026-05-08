'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/browser';
import { useAuth } from '@/components/AuthProvider';
import Header from '@/components/Header';
import { Sentimento } from '@/lib/types';
import { History, Clock, Heart, BookOpen, FileDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const sentimentoLabels: Record<string, { label: string; color: string }> = {
  ansiedade: { label: 'Ansiedade', color: 'bg-orange-100 text-orange-600 border-orange-200' },
  tristeza: { label: 'Tristeza', color: 'bg-blue-100 text-blue-600 border-blue-200' },
  gratidao: { label: 'Gratidão', color: 'bg-green-100 text-green-600 border-green-200' },
  medo: { label: 'Medo', color: 'bg-purple-100 text-purple-600 border-purple-200' },
  esperanca: { label: 'Esperança', color: 'bg-yellow-100 text-yellow-600 border-yellow-200' },
  cansaco: { label: 'Cansaço', color: 'bg-gray-100 text-gray-600 border-gray-200' },
  paz: { label: 'Paz', color: 'bg-teal-100 text-teal-600 border-teal-200' },
  raiva: { label: 'Raiva', color: 'bg-red-100 text-red-600 border-red-200' },
  solidao: { label: 'Solidão', color: 'bg-indigo-100 text-indigo-600 border-indigo-200' },
  alegria: { label: 'Alegria', color: 'bg-amber-100 text-amber-600 border-amber-200' },
  confusao: { label: 'Confusão', color: 'bg-slate-100 text-slate-600 border-slate-200' },
  culpa: { label: 'Culpa', color: 'bg-rose-100 text-rose-600 border-rose-200' },
  amor: { label: 'Amor', color: 'bg-pink-100 text-pink-600 border-pink-200' },
};

const areaLabels: Record<string, string> = {
  familia: '👨‍👩‍👧‍👦 Família',
  trabalho: '💼 Trabalho',
  saude: '🏥 Saúde',
  relacionamento: '❤️ Relacionamento',
  espiritualidade: '✝️ Espiritual',
  financeiro: '💰 Financeiro',
  pessoal: '🧘 Pessoal',
  outro: '🌟 Outro',
};

export default function HistoricoPage() {
  const router = useRouter();
  const { user, perfil, signOut, loading } = useAuth();
  const [sentimentos, setSentimentos] = useState<Sentimento[]>([]);
  const [loadingSentimentos, setLoadingSentimentos] = useState(true);
  const [selectedSentimento, setSelectedSentimento] = useState<Sentimento | null>(null);
  const hasRedirectedRef = useRef(false);

  const fetchSentimentos = useCallback(async () => {
    if (!user) return;
    const supabase = createClient();
    const { data } = await supabase
      .from('sentimentos')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setSentimentos(data);
    setLoadingSentimentos(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchSentimentos();
    }
  }, [user, fetchSentimentos]);

  useEffect(() => {
    if (hasRedirectedRef.current) return;
    if (!loading && !user) {
      hasRedirectedRef.current = true;
      router.push('/auth');
    }
  }, [loading, user, router]);

  const handlePrintSentimento = (sentimento: Sentimento) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
<title>Acolhimento - Mana AI</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', system-ui, sans-serif; padding: 40px; max-width: 700px; margin: 0 auto; color: #1a2e33; background: #F9F7F2; }
  .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #2D5A61; margin-bottom: 30px; }
  .logo { font-size: 24px; font-weight: 700; color: #2D5A61; }
  .date { color: #5a7075; font-size: 14px; margin-top: 5px; }
  .sentimento-box { background: white; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid rgba(45,90,97,0.1); }
  .sentimento-label { font-size: 12px; color: #5a7075; margin-bottom: 8px; }
  .sentimento-text { line-height: 1.6; color: #1a2e33; }
  h2 { color: #2D5A61; font-size: 18px; margin: 24px 0 12px 0; }
  p { line-height: 1.8; margin-bottom: 12px; color: #5a7075; }
  strong { color: #1a2e33; }
  .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px; }
</style>
</head>
<body>
  <div class="header">
    <div class="logo">✦ Mana AI</div>
    <div class="date">${formatDate(sentimento.created_at)}</div>
  </div>
  <div class="sentimento-box">
    <div class="sentimento-label">Como você se sentia:</div>
    <div class="sentimento-text">${sentimento.descricao}</div>
  </div>
  <div class="content">${sentimento.acolhimento || '<p>Sem acolhimento disponível.</p>'}</div>
  <div class="footer">
    <p>Gerado por Mana AI • ${new Date().toLocaleDateString('pt-BR')}</p>
  </div>
  <script>window.print();</script>
</body>
</html>
    `);
    printWindow.document.close();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading || !perfil) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          <BookOpen className="w-12 h-12 text-teal-400 animate-pulse" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header perfil={perfil} signOut={signOut} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <History className="w-7 h-7 text-teal-500" />
          <h1 className="text-2xl font-bold text-text-primary">Histórico de Acolhimentos</h1>
          <span className="text-sm text-text-secondary bg-black/5 px-3 py-1 rounded-full">
            {sentimentos.length} {sentimentos.length === 1 ? 'acolhimento' : 'acolhimentos'}
          </span>
        </motion.div>

        {loadingSentimentos ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-black/5 rounded-xl p-6 animate-pulse">
                <div className="h-4 bg-black/10 rounded w-3/4 mb-4" />
                <div className="h-3 bg-black/10 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : sentimentos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gradient-card backdrop-blur-sm border border-border-soft rounded-2xl p-12 text-center"
          >
            <BookOpen className="w-16 h-16 text-teal-400/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              Nenhum acolhimento registrado
            </h3>
            <p className="text-text-secondary">
              Comece compartilhando seus sentimentos no Dashboard.
            </p>
          </motion.div>
        ) : (
          <div className="bg-gradient-card backdrop-blur-sm border border-border-soft rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-soft">
                    <th className="text-left px-6 py-4 text-sm text-text-secondary font-medium">Data</th>
                    <th className="text-left px-6 py-4 text-sm text-text-secondary font-medium">Sentimento</th>
                    <th className="text-left px-6 py-4 text-sm text-text-secondary font-medium">Sentimento</th>
                    <th className="text-left px-6 py-4 text-sm text-text-secondary font-medium">Área</th>
                    <th className="text-left px-6 py-4 text-sm text-text-secondary font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {sentimentos.map((sentimento, index) => (
                    <motion.tr
                      key={sentimento.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-border-soft/50 hover:bg-black/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-text-secondary">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">{formatDate(sentimento.created_at)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-text-primary text-sm truncate max-w-[200px]">
                          {sentimento.descricao.substring(0, 60)}...
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {sentimento.sentimento && sentimentoLabels[sentimento.sentimento] ? (
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs border ${sentimentoLabels[sentimento.sentimento].color}`}>
                            <Heart className="w-3 h-3 mr-1" />
                            {sentimentoLabels[sentimento.sentimento].label}
                          </span>
                        ) : (
                          <span className="text-text-secondary text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-text-secondary">
                          {sentimento.area_vida ? areaLabels[sentimento.area_vida] : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedSentimento(sentimento)}
                          className="flex items-center gap-2 text-teal-500 hover:text-teal-600 transition-colors"
                        >
                          <BookOpen className="w-4 h-4" />
                          <span className="text-sm">Ver</span>
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedSentimento && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedSentimento(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-card backdrop-blur-sm border border-border-soft rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-teal-50 px-6 py-4 border-b border-border-soft flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">
                    Acolhimento
                  </h3>
                  <p className="text-xs text-text-secondary">
                    {formatDate(selectedSentimento.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePrintSentimento(selectedSentimento)}
                    className="p-2 rounded-lg hover:bg-black/5 transition-colors text-text-secondary hover:text-text-primary"
                    title="Imprimir / PDF"
                  >
                    <FileDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedSentimento(null)}
                    className="text-text-secondary hover:text-text-primary transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {selectedSentimento.image_url && (
                  <div className="mb-4 rounded-xl overflow-hidden">
                    <img
                      src={selectedSentimento.image_url}
                      alt="Arte Sacra"
                      className="w-full object-cover"
                      style={{ aspectRatio: '4/5', maxHeight: '320px' }}
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="mb-4 p-4 bg-black/5 rounded-xl border border-border-soft">
                  <p className="text-sm text-text-secondary mb-1">Como você se sentia:</p>
                  <p className="text-text-primary">{selectedSentimento.descricao}</p>
                </div>

                <div className="flex gap-2 mb-4">
                  {selectedSentimento.sentimento && sentimentoLabels[selectedSentimento.sentimento] && (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs border ${sentimentoLabels[selectedSentimento.sentimento].color}`}>
                      {sentimentoLabels[selectedSentimento.sentimento].label}
                    </span>
                  )}
                  {selectedSentimento.area_vida && areaLabels[selectedSentimento.area_vida] && (
                    <span className="bg-black/5 text-text-secondary px-3 py-1 rounded-full text-xs border border-border-soft">
                      {areaLabels[selectedSentimento.area_vida]}
                    </span>
                  )}
                </div>

                <div className="markdown-content">
                  <ReactMarkdown>{selectedSentimento.acolhimento || 'Acolhimento não disponível.'}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
