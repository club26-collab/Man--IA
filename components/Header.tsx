'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, History, LayoutDashboard, LogOut, Crown, Settings, LineChart } from 'lucide-react';
import { Perfil } from '@/lib/types';

interface HeaderProps {
  perfil: Perfil;
  signOut: () => Promise<void>;
}

export default function Header({ perfil, signOut }: HeaderProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Início', icon: LayoutDashboard },
    { href: '/historico', label: 'Histórico', icon: History },
    { href: '/insights', label: 'Reflexões', icon: LineChart },
    { href: '/configuracoes', label: 'Configurações', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-md border-b border-border-soft">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-gold-400 to-teal-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-lg font-bold text-text-primary">Maná<span className="text-teal-500">AI</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm ${
                    isActive
                      ? 'bg-teal-500/15 text-teal-600'
                      : 'text-text-secondary hover:text-text-primary hover:bg-black/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-black/5 px-3 py-2 rounded-xl border border-border-soft">
              <Crown className="w-4 h-4 text-gold-500" />
              <span className="text-sm text-text-primary">
                {perfil.plano === 'pro' ? 'Pro' : `${perfil.creditos} créditos`}
              </span>
            </div>

            <div className="text-sm text-text-secondary hidden sm:block">
              Olá, {perfil.nome.split(' ')[0]}
            </div>

            <button
              onClick={signOut}
              className="p-2 rounded-xl hover:bg-black/5 transition-colors text-text-secondary hover:text-text-primary"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <nav className="md:hidden flex items-center justify-center gap-1 px-4 pb-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all flex-1 justify-center text-xs ${
                isActive
                  ? 'bg-teal-500/15 text-teal-600'
                  : 'text-text-secondary hover:text-text-primary hover:bg-black/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
