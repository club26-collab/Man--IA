'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Heart, BookOpen, Sparkles } from 'lucide-react';
import { Perfil } from '@/lib/types';

interface SentimentInputProps {
  perfil: Perfil;
  onAcolher: (sentimento: string, nome: string, sentimentoTag: string | null, areaVida: string | null) => Promise<void>;
}

export default function SentimentInput({ perfil, onAcolher }: SentimentInputProps) {
  const [sentimento, setSentimento] = useState('');
  const [sentimentoTag, setSentimentoTag] = useState<string | null>(null);
  const [areaVida, setAreaVida] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [localLoading, setLocalLoading] = useState(false);

  const handleAcolher = async () => {
    if (!sentimento.trim()) {
      setError('Por favor, compartilhe como você está se sentindo.');
      return;
    }

    if (perfil.plano === 'gratis' && perfil.creditos <= 0) {
      setError('Seus créditos acabaram. Faça upgrade para o Plano Pro!');
      return;
    }

    setError('');
    setLocalLoading(true);

    try {
      await onAcolher(sentimento.trim(), perfil.nome, sentimentoTag, areaVida);
      setSentimento('');
    } catch {
      setError('Erro ao buscar acolhimento. Tente novamente.');
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="bg-gradient-card backdrop-blur-sm border border-border-soft rounded-2xl p-6">
      <h2 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
        <Heart className="w-5 h-5 text-teal-500" />
        Como você está se sentindo hoje?
      </h2>

      <div className="space-y-5">
        <div>
          <label className="block text-sm text-text-secondary mb-2">
            Compartilhe seus sentimentos
          </label>
          <textarea
            value={sentimento}
            onChange={(e) => setSentimento(e.target.value)}
            className="w-full bg-bg-input border border-border-soft rounded-xl px-4 py-3 text-text-primary min-h-[150px] resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all placeholder:text-text-secondary"
            placeholder="Como está seu coração hoje? O que tem pesado ou alegrado sua alma..."
          />
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-2 flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Como classificaria seu sentimento?
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {[
              { id: 'ansiedade', label: 'Ansiedade', icon: '😰' },
              { id: 'tristeza', label: 'Tristeza', icon: '😢' },
              { id: 'gratidao', label: 'Gratidão', icon: '🙏' },
              { id: 'medo', label: 'Medo', icon: '😨' },
              { id: 'esperanca', label: 'Esperança', icon: '🌅' },
              { id: 'cansaco', label: 'Cansaço', icon: '😴' },
              { id: 'paz', label: 'Paz', icon: '☮️' },
              { id: 'alegria', label: 'Alegria', icon: '😊' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setSentimentoTag(sentimentoTag === t.id ? null : t.id)}
                className={`p-3 rounded-xl border transition-all text-center ${
                  sentimentoTag === t.id
                    ? 'bg-teal-500/15 border-teal-500'
                    : 'bg-bg-input border-border-soft hover:border-teal-500/30'
                }`}
              >
                <span className="text-lg block">{t.icon}</span>
                <span className="text-xs text-text-secondary">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-2 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Área da vida
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {[
              { id: 'familia', label: 'Família', icon: '👨‍👩‍👧‍👦' },
              { id: 'trabalho', label: 'Trabalho', icon: '💼' },
              { id: 'saude', label: 'Saúde', icon: '🏥' },
              { id: 'relacionamento', label: 'Relacionamento', icon: '❤️' },
              { id: 'espiritualidade', label: 'Espiritual', icon: '✝️' },
              { id: 'financeiro', label: 'Financeiro', icon: '💰' },
              { id: 'pessoal', label: 'Pessoal', icon: '🧘' },
              { id: 'outro', label: 'Outro', icon: '🌟' },
            ].map((a) => (
              <button
                key={a.id}
                onClick={() => setAreaVida(areaVida === a.id ? null : a.id)}
                className={`p-3 rounded-xl border transition-all text-center w-full overflow-hidden ${
                  areaVida === a.id
                    ? 'bg-teal-500/15 border-teal-500'
                    : 'bg-bg-input border-border-soft hover:border-teal-500/30'
                }`}
              >
                <span className="text-lg block">{a.icon}</span>
                <span className="text-xs text-text-secondary break-words leading-tight">{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm"
          >
            {error}
          </motion.p>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAcolher}
          disabled={!sentimento.trim() || localLoading || (perfil.plano === 'gratis' && perfil.creditos <= 0)}
          className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold py-4 rounded-xl glow-teal hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Send className="w-5 h-5" />
          {localLoading ? 'Buscando acolhimento...' : 'Receber Acolhimento'}
        </motion.button>
      </div>
    </div>
  );
}
