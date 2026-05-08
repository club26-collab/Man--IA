'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import Header from '@/components/Header';
import { createClient } from '@/lib/supabase/browser';
import { User, Mail, Key, Save, BookOpen, Crown, Trash2, AlertTriangle } from 'lucide-react';

export default function ConfiguracoesPage() {
  const router = useRouter();
  const { user, perfil, signOut, loading, refreshPerfil } = useAuth();
  const [nome, setNome] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [erroSenha, setErroSenha] = useState('');
  const [senhaAtualizando, setSenhaAtualizando] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (perfil) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNome(perfil.nome);
    }
  }, [perfil]);

  useEffect(() => {
    if (hasRedirectedRef.current) return;
    if (!loading && !user) {
      hasRedirectedRef.current = true;
      router.push('/auth');
    }
  }, [loading, user, router]);

  const handleSalvarPerfil = async () => {
    if (!user || !nome.trim()) return;
    setSalvando(true);
    setSalvo(false);
    const supabase = createClient();
    const { error } = await supabase
      .from('perfis')
      .update({ nome: nome.trim() })
      .eq('id', user.id);

    if (error) {
      alert('Erro ao salvar: ' + error.message);
    } else {
      setSalvo(true);
      await refreshPerfil();
      setTimeout(() => setSalvo(false), 3000);
    }
    setSalvando(false);
  };

  const handleTrocarSenha = async () => {
    if (novaSenha.length < 6) {
      setErroSenha('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setErroSenha('');
    setSenhaAtualizando(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: novaSenha });

    if (error) {
      setErroSenha(error.message);
    } else {
      setErroSenha('');
      setNovaSenha('');
      alert('Senha atualizada com sucesso!');
    }
    setSenhaAtualizando(false);
  };

  const handleDeletarConta = async () => {
    if (!user) return;
    const supabase = createClient();
    await supabase.from('sentimentos').delete().eq('user_id', user.id);
    await supabase.from('perfis').delete().eq('id', user.id);
    await supabase.auth.signOut();
    router.push('/');
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

  return (
    <div className="min-h-screen">
      <Header perfil={perfil} signOut={signOut} />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-text-primary mb-8 flex items-center gap-3">
            <User className="w-7 h-7 text-teal-500" />
            Configurações
          </h1>

          <div className="bg-bg-card border border-border-soft rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-teal-500" />
              Meu Perfil
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1">Email</label>
                <div className="flex items-center gap-2 bg-black/5 rounded-xl px-4 py-3 text-text-primary border border-border-soft">
                  <Mail className="w-4 h-4 text-text-secondary" />
                  {user?.email}
                </div>
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-1">Nome</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-bg-input border border-border-soft rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Seu nome"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/5 border border-border-soft rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2 text-text-secondary text-sm">
                    <Crown className="w-4 h-4 text-gold-500" />
                    Plano
                  </div>
                  <p className="text-text-primary font-semibold mt-1">
                    {perfil.plano === 'pro' ? 'Pro Ilimitado' : 'Gratuito'}
                  </p>
                </div>
                <div className="bg-black/5 border border-border-soft rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2 text-text-secondary text-sm">
                    <BookOpen className="w-4 h-4 text-teal-500" />
                    Créditos
                  </div>
                  <p className="text-text-primary font-semibold mt-1">
                    {perfil.plano === 'pro' ? 'Ilimitado' : `${perfil.creditos} restantes`}
                  </p>
                </div>
              </div>

              <button
                onClick={handleSalvarPerfil}
                disabled={salvando || !nome.trim()}
                className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-lg transition-all"
              >
                <Save className="w-4 h-4" />
                {salvando ? 'Salvando...' : salvo ? 'Salvo!' : 'Salvar Alterações'}
              </button>
            </div>
          </div>

          <div className="bg-bg-card border border-border-soft rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Key className="w-5 h-5 text-teal-500" />
              Trocar Senha
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1">Nova Senha</label>
                <input
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  className="w-full bg-bg-input border border-border-soft rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                />
              </div>

              {erroSenha && (
                <p className="text-red-500 text-sm">{erroSenha}</p>
              )}

              <button
                onClick={handleTrocarSenha}
                disabled={senhaAtualizando || !novaSenha}
                className="w-full bg-black/5 border border-border-soft text-text-primary font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-black/10 transition-all disabled:opacity-50"
              >
                <Key className="w-4 h-4" />
                {senhaAtualizando ? 'Atualizando...' : 'Atualizar Senha'}
              </button>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-red-600 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Zona de Perigo
            </h2>
            <p className="text-text-secondary text-sm mb-4">
              Ao deletar sua conta, todos os seus dados e acolhimentos serão removidos permanentemente.
            </p>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-100 border border-red-300 text-red-600 font-semibold py-2 px-4 rounded-xl hover:bg-red-200 transition-all flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Deletar Minha Conta
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-red-600 text-sm font-semibold">Tem certeza? Esta ação é irreversível!</p>
                <div className="flex gap-3">
                  <button
                    onClick={handleDeletarConta}
                    className="bg-red-600 text-white font-semibold py-2 px-6 rounded-xl hover:bg-red-700 transition-all"
                  >
                    Sim, deletar
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="bg-black/5 text-text-primary font-semibold py-2 px-6 rounded-xl hover:bg-black/10 transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
