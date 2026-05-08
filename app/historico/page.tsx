'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/browser';
import { useAuth } from '@/components/AuthProvider';
import Header from '@/components/Header';
import { Sentimento } from '@/lib/types';
import { History, Heart, BookOpen, FileDown, Clock, Sparkles } from 'lucide-react';
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
  familia: 'Família',
  trabalho: 'Trabalho',
  saude: 'Saúde',
  relacionamento: 'Relacionamento',
  espiritualidade: 'Espiritual',
  financeiro: 'Financeiro',
  pessoal: 'Pessoal',
  outro: 'Outro',
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
    if (user) fetchSentimentos();
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

    printWindow.document.write(`<!DOCTYPE html>
<html><head><title>Acolhimento - Mana AI</title><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Inter,system-ui,sans-serif;padding:40px;max-width:700px;margin:0 auto;color:#1a2e33;background:#F9F7F2}
.header{text-align:center;padding-bottom:20px;border-bottom:2px solid #2D5A61;margin-bottom:30px}
.logo{font-size:24px;font-weight:700;color:#2D5A61}
.date{color:#5a7075;font-size:14px;margin-top:5px}
.sentimento-box{background:white;padding:20px;border-radius:12px;margin:20px 0;border:1px solid rgba(45,90,97,0.1)}
.sentimento-label{font-size:12px;color:#5a7075;margin-bottom:8px}
.sentimento-text{line-height:1.6;color:#1a2e33}
h2{color:#2D5A61;font-size:18px;margin:24px 0 12px 0}
p{line-height:1.8;margin-bottom:12px;color:#5a7075}
strong{color:#1a2e33}
.footer{text-align:center;margin-top:40px;padding-top:20px;border-top:1px solid #ddd;color:#999;font-size:12px}
</style></head><body>
<div class="header"><div class="logo">&#10022; Mana AI</div><div class="date">${formatDate(sentimento.created_at)}</div></div>
<div class="sentimento-box"><div class="sentimento-label">Como voce se sentia:</div><div class="sentimento-text">${sentimento.descricao}</div></div>
${sentimento.image_url ? `<div style="text-align:center;margin-bottom:20px"><img src="${sentimento.image_url}" style="max-width:100%;border-radius:12px;max-height:300px" /></div>` : ''}
<div class="content">${sentimento.acolhimento || '<p>Sem acolhimento disponivel.</p>'}</div>
<div class="footer"><p>Gerado por Mana AI &bull; ${new Date().toLocaleDateString('pt-BR')}</p></div>
<script>window.print()</script>
</body></html>`);
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

  const formatDateShort = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
  };

  const groupByDate = (items: Sentimento[]): Record<string, Sentimento[]> => {
    const groups: Record<string, Sentimento[]> = {};
    for (const item of items) {
      const dateKey = new Date(item.created_at).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(item);
    }
    return groups;
  };

  const extractPreview = (text: string): string => {
    if (!text) return '';
    const clean = text.replace(/##?\s*[^\n]*/g, '').replace(/\*\*/g, '').trim();
    return clean.substring(0, 120) + (clean.length > 120 ? '...' : '');
  };

  if (loading || !perfil) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
          <BookOpen className="w-12 h-12 text-teal-400 animate-pulse" />
        </motion.div>
      </div>
    );
  }

  const grouped = groupByDate(sentimentos);
  const dateKeys = Object.keys(grouped);

  return (
    <div className="min-h-screen">
      <Header perfil={perfil} signOut={signOut} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <History className="w-7 h-7 text-teal-500" />
          <h1 className="text-2xl font-bold text-text-primary">Histórico</h1>
          <span className="text-sm text-text-secondary bg-black/5 px-3 py-1 rounded-full">
            {sentimentos.length} {sentimentos.length === 1 ? 'registro' : 'registros'}
          </span>
        </motion.div>

        {loadingSentimentos ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 bg-teal-300 rounded-full" />
                  <div className="w-0.5 flex-1 bg-teal-100" />
                </div>
                <div className="flex-1 bg-black/5 rounded-xl p-4">
                  <div className="h-4 bg-black/10 rounded w-1/3 mb-3" />
                  <div className="h-3 bg-black/10 rounded w-full mb-2" />
                  <div className="h-3 bg-black/10 rounded w-2/3" />
                </div>
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
            <h3 className="text-xl font-semibold text-text-primary mb-2">Nenhum acolhimento registrado</h3>
            <p className="text-text-secondary">Comece compartilhando seus sentimentos no Dashboard.</p>
          </motion.div>
        ) : (
          <div className="relative">
            {/* Linha vertical da timeline */}
            <div className="absolute left-[7px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal-300 via-teal-200 to-teal-100" />

            <div className="space-y-8">
              {dateKeys.map((dateKey, dateIdx) => (
                <motion.div
                  key={dateKey}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: dateIdx * 0.05 }}
                >
                  {/* Cabeçalho da data */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-[18px] h-[18px] rounded-full bg-teal-500 border-4 border-teal-100 flex-shrink-0 z-10" />
                    <span className="text-sm font-semibold text-text-primary">{dateKey}</span>
                  </div>

                  {/* Cards do dia */}
                  <div className="ml-9 space-y-3">
                    {grouped[dateKey].map((sentimento, cardIdx) => {
                      const label = sentimento.sentimento ? sentimentoLabels[sentimento.sentimento] : null;
                      return (
                        <motion.div
                          key={sentimento.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: cardIdx * 0.03 }}
                          onClick={() => setSelectedSentimento(sentimento)}
                          className="bg-gradient-card backdrop-blur-sm border border-border-soft rounded-xl p-4 hover:shadow-md transition-all cursor-pointer group"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5">
                                <Clock className="w-3.5 h-3.5 text-text-secondary flex-shrink-0" />
                                <span className="text-xs text-text-secondary">
                                  {formatDateShort(sentimento.created_at)}
                                </span>
                                {label && (
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${label.color}`}>
                                    <Heart className="w-2.5 h-2.5 mr-1" />
                                    {label.label}
                                  </span>
                                )}
                                {sentimento.area_vida && areaLabels[sentimento.area_vida] && (
                                  <span className="text-xs text-text-secondary bg-black/5 px-2 py-0.5 rounded-full">
                                    {areaLabels[sentimento.area_vida]}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed">
                                {extractPreview(sentimento.acolhimento || '')}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <div className="flex gap-1.5">
                                {sentimento.image_url && (
                                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-border-soft flex-shrink-0">
                                    <img src={sentimento.image_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={(e) => { e.stopPropagation(); handlePrintSentimento(sentimento); }}
                                className="p-2 rounded-lg hover:bg-black/5 transition-colors text-text-secondary hover:text-text-primary opacity-0 group-hover:opacity-100"
                                title="Imprimir"
                              >
                                <FileDown className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Modal do acolhimento */}
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
                  <h3 className="text-lg font-semibold text-text-primary">Acolhimento</h3>
                  <p className="text-xs text-text-secondary">{formatDate(selectedSentimento.created_at)}</p>
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

                <div className="flex gap-2 mb-4 flex-wrap">
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
