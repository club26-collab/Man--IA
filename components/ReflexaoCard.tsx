'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw } from 'lucide-react';
import { gerarReflexao } from '@/app/actions/acolhimento';

export default function ReflexaoCard() {
  const [reflexao, setReflexao] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [gerando, setGerando] = useState(false);

  const carregarReflexao = async () => {
    setGerando(true);
    const result = await gerarReflexao();
    if (result.success && result.reflexao) {
      setReflexao(result.reflexao);
    }
    setLoading(false);
    setGerando(false);
  };

  useEffect(() => {
    const cached = sessionStorage.getItem('reflexao_hoje');
    const data = sessionStorage.getItem('reflexao_data');
    const hoje = new Date().toDateString();

    if (cached && data === hoje) {
      setReflexao(cached);
      setLoading(false);
    } else {
      carregarReflexao();
    }
  }, []);

  useEffect(() => {
    if (reflexao) {
      sessionStorage.setItem('reflexao_hoje', reflexao);
      sessionStorage.setItem('reflexao_data', new Date().toDateString());
    }
  }, [reflexao]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-amber-50 to-teal-50 border border-amber-200/50 rounded-2xl p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-amber-800">Reflexão do Dia</h3>
            <p className="text-xs text-amber-600/70">Uma palavra para começar</p>
          </div>
        </div>
        <button
          onClick={carregarReflexao}
          disabled={gerando}
          className="p-1.5 rounded-lg hover:bg-black/5 transition-colors text-amber-500 hover:text-amber-600 disabled:opacity-50"
          title="Nova reflexão"
        >
          <RefreshCw className={`w-4 h-4 ${gerando ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-3 bg-amber-200/50 rounded w-full" />
          <div className="h-3 bg-amber-200/50 rounded w-3/4" />
        </div>
      ) : (
        <p className="text-sm text-amber-800/80 leading-relaxed italic">
          &ldquo;{reflexao}&rdquo;
        </p>
      )}
    </motion.div>
  );
}
