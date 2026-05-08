import { Database } from '@/lib/supabase/database.types';

export type Perfil = Database['public']['Tables']['perfis']['Row'];
export type Sentimento = Database['public']['Tables']['sentimentos']['Row'];
export type MensagemDiaria = Database['public']['Tables']['mensagens_diarias']['Row'];
export type Assinatura = Database['public']['Tables']['assinaturas']['Row'];

export type SentimentoTag =
  | 'ansiedade'
  | 'tristeza'
  | 'gratidao'
  | 'medo'
  | 'esperanca'
  | 'cansaco'
  | 'paz'
  | 'raiva'
  | 'solidao'
  | 'alegria'
  | 'confusao'
  | 'culpa'
  | 'amor';

export type AreaVida =
  | 'familia'
  | 'trabalho'
  | 'saude'
  | 'relacionamento'
  | 'espiritualidade'
  | 'financeiro'
  | 'pessoal'
  | 'outro';
