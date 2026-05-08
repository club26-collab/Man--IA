'use client';

import { motion } from 'framer-motion';
import { BookOpen, Crown, Heart, History } from 'lucide-react';
import { Perfil } from '@/lib/types';
import Link from 'next/link';

interface QuickStatsProps {
  perfil: Perfil;
}

export default function QuickStats({ perfil }: QuickStatsProps) {
  const stats = [
    {
      icon: perfil.plano === 'pro' ? Crown : Heart,
      label: perfil.plano === 'pro' ? 'Plano Pro' : 'Plano Gratuito',
      value: perfil.plano === 'pro' ? 'Ilimitado' : `${perfil.creditos} créditos`,
      color: perfil.plano === 'pro' ? 'text-gold-500' : 'text-teal-500',
      bgColor: perfil.plano === 'pro' ? 'bg-gold-50' : 'bg-teal-50',
      link: null,
    },
    {
      icon: BookOpen,
      label: 'Acolhimentos',
      value: 'Ver histórico →',
      color: 'text-teal-500',
      bgColor: 'bg-teal-50',
      link: '/historico',
    },
    {
      icon: Heart,
      label: 'Reflexões',
      value: 'Explorar →',
      color: 'text-sage-500',
      bgColor: 'bg-sage-50',
      link: '/insights',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const content = (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${stat.bgColor} backdrop-blur-sm border border-border-soft rounded-xl p-4 flex items-center gap-4 ${stat.link ? 'cursor-pointer hover:border-teal-500/30 transition-colors' : ''}`}
          >
            <div className="p-2 rounded-lg bg-white/60">
              <Icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs text-text-secondary">{stat.label}</p>
              <p className={`text-lg font-semibold text-text-primary ${stat.link ? 'hover:text-teal-600 transition-colors' : ''}`}>{stat.value}</p>
            </div>
          </motion.div>
        );

        if (stat.link) {
          return (
            <Link key={stat.label} href={stat.link}>
              {content}
            </Link>
          );
        }

        return <div key={stat.label}>{content}</div>;
      })}
    </div>
  );
}
