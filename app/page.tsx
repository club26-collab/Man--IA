'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/browser';

export default function Home() {
  const router = useRouter();
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

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-sans selection:bg-teal-500/20">
      <nav className="flex justify-between items-center px-6 md:px-8 py-4 md:py-6 border-b border-border-soft backdrop-blur-md sticky top-0 z-50 bg-bg-primary/90">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-tr from-gold-400 to-teal-500 rounded-full flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="text-xl font-bold tracking-tight">Maná<span className="text-teal-500">AI</span></span>
        </Link>
        <div className="hidden md:flex gap-8 text-sm font-medium text-text-secondary">
          <a href="#como-funciona" className="hover:text-text-primary transition">Como funciona</a>
          <a href="#beneficios" className="hover:text-text-primary transition">Benefícios</a>
          <a href="#precos" className="hover:text-text-primary transition">Preços</a>
        </div>
        <Link href="/auth" className="px-5 py-2 border border-teal-500/40 rounded-full text-sm hover:bg-teal-500/10 transition text-teal-600 font-medium">
          Entrar
        </Link>
      </nav>

      <main className="max-w-6xl mx-auto px-4 pt-16 md:pt-24 pb-24 md:pb-32 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 text-xs font-semibold mb-6 md:mb-10">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
          </span>
          ACOLHIMENTO ESPIRITUAL DIÁRIO
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif leading-tight mb-4 md:mb-6 text-text-primary">
          O que seu coração <br className="hidden sm:block"/>
          <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-teal-400 to-gold-400">
            precisa ouvir hoje?
          </span>
        </h1>

        <p className="max-w-2xl text-text-secondary text-base md:text-lg lg:text-xl mb-8 md:mb-12 leading-relaxed">
          Receba versículos, conforto e orientação bíblica personalizada com inteligência artificial. Uma palavra de Deus feita sob medida para o seu momento.
        </p>

        <div className="flex flex-col items-center gap-3 md:gap-4">
          <Link href="/auth" className="group relative px-8 md:px-10 py-4 md:py-5 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full font-bold text-base md:text-lg shadow-lg shadow-teal-500/20 hover:shadow-xl hover:shadow-teal-500/30 transition-all active:scale-95 text-white">
            <span className="relative z-10 flex items-center gap-2">
              🙏 Receber Acolhimento
            </span>
            <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition"></div>
          </Link>
          <p className="text-xs text-text-secondary">3 acolhimentos gratuitos para novos usuários</p>
        </div>

        <div id="como-funciona" className="mt-20 md:mt-28 w-full">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-text-primary text-center mb-8 md:mb-12">
            Como funciona
          </h2>
          <div className="grid sm:grid-cols-3 gap-4 md:gap-6">
            {[
              {
                icon: '💬',
                title: 'Compartilhe',
                desc: 'Conte como está se sentindo. Seu coração é ouvido com atenção e carinho.',
              },
              {
                icon: '📖',
                title: 'Receba a Palavra',
                desc: 'A IA gera um acolhimento com versículo bíblico real, palavra de conforto e uma oração.',
              },
              {
                icon: '🌱',
                title: 'Cresça na Fé',
                desc: 'Acompanhe seu histórico e reflita sobre sua jornada espiritual ao longo do tempo.',
              },
            ].map((item, i) => (
              <div key={i} className="p-5 md:p-6 rounded-2xl bg-bg-card border border-border-soft hover:shadow-lg hover:-translate-y-1 transition-all">
                <span className="text-3xl md:text-4xl block mb-3 md:mb-4">{item.icon}</span>
                <h3 className="text-base md:text-lg font-semibold text-text-primary mb-2">{item.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div id="beneficios" className="mt-20 md:mt-28 w-full max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-text-primary text-center mb-8 md:mb-12">
            Por que Maná AI?
          </h2>
          <div className="space-y-4 md:space-y-5">
            {[
              { icon: '✝️', title: 'Base Bíblica', desc: 'Todos os versículos são reais e contextualizados para o seu momento.' },
              { icon: '🤍', title: 'Acolhimento Real', desc: 'Não é apenas informação — é uma palavra que toca o coração.' },
              { icon: '📱', title: 'Acesso Rápido', desc: 'Receba conforto espiritual a qualquer hora, em qualquer lugar.' },
              { icon: '🔒', title: 'Privacidade Total', desc: 'Seus sentimentos são seus. Seus dados são protegidos e privados.' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 md:gap-4 p-4 rounded-xl hover:bg-bg-card transition-colors">
                <span className="text-xl md:text-2xl flex-shrink-0 mt-0.5">{item.icon}</span>
                <div>
                  <h3 className="font-semibold text-text-primary">{item.title}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div id="precos" className="mt-20 md:mt-28 w-full grid sm:grid-cols-2 gap-4 md:gap-6 max-w-4xl text-left">
          <div className="p-6 md:p-8 rounded-3xl bg-bg-card border border-border-soft hover:shadow-lg transition-all">
            <h3 className="text-lg md:text-xl font-bold text-text-primary mb-2">Gratuito</h3>
            <div className="text-3xl md:text-4xl font-bold text-text-primary mb-4 md:mb-6">R$ 0</div>
            <ul className="space-y-3 text-text-secondary text-sm">
              <li className="flex items-center gap-2">✓ 3 Acolhimentos iniciais</li>
              <li className="flex items-center gap-2">✓ Versículos personalizados</li>
              <li className="flex items-center gap-2">✓ Histórico básico</li>
              <li className="flex items-center gap-2">✓ Reflexões emocionais</li>
            </ul>
            <Link href="/auth" className="w-full mt-6 md:mt-8 py-3 border border-teal-500/40 text-teal-600 rounded-xl font-bold hover:bg-teal-500/10 transition-colors flex justify-center">
              Começar Grátis
            </Link>
          </div>

          <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-b from-teal-50 to-bg-primary border border-teal-500/30 relative overflow-hidden hover:shadow-lg transition-all">
            <div className="absolute top-0 right-0 bg-gold-400 text-white px-3 md:px-4 py-1 text-[10px] md:text-xs font-bold uppercase tracking-tighter shadow-md">MAIS POPULAR</div>
            <h3 className="text-lg md:text-xl font-bold text-text-primary mb-2">Maná Pro</h3>
            <div className="text-3xl md:text-4xl font-bold text-text-primary mb-4 md:mb-6">R$ 9,90 <span className="text-sm font-normal text-text-secondary">/mês</span></div>
            <ul className="space-y-3 text-text-primary text-sm">
              <li className="flex items-center gap-2 text-teal-600">✦ Acolhimentos Ilimitados</li>
              <li className="flex items-center gap-2">✦ Versículos Personalizados</li>
              <li className="flex items-center gap-2">✦ Download de Relatórios em PDF</li>
              <li className="flex items-center gap-2 text-gold-600">✦ Mensagem Diária de Maná (WhatsApp)</li>
              <li className="flex items-center gap-2">✦ Reflexões Profundas com IA</li>
            </ul>
            <Link href="/auth" className="w-full mt-6 md:mt-8 py-3 bg-teal-500 text-white rounded-xl font-bold hover:bg-teal-600 transition-colors flex justify-center shadow-md">
              Assinar Agora
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-border-soft py-8 md:py-12 text-center text-text-secondary text-sm">
        <p>© 2026 Maná AI por Studio Paula. Conectando fé e tecnologia.</p>
      </footer>
    </div>
  );
}
