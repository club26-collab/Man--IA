export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      perfis: {
        Row: {
          id: string
          email: string
          nome: string
          plano: 'gratis' | 'pro'
          creditos: number
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          nome: string
          plano?: 'gratis' | 'pro'
          creditos?: number
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          nome?: string
          plano?: 'gratis' | 'pro'
          creditos?: number
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      sentimentos: {
        Row: {
          id: string
          user_id: string
          descricao: string
          sentimento: string | null
          area_vida: string | null
          acolhimento: string | null
          versiculo: string | null
          image_url: string | null
          image_prompt: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          descricao: string
          sentimento?: string | null
          area_vida?: string | null
          acolhimento?: string | null
          versiculo?: string | null
          image_url?: string | null
          image_prompt?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          descricao?: string
          sentimento?: string | null
          area_vida?: string | null
          acolhimento?: string | null
          versiculo?: string | null
          image_url?: string | null
          image_prompt?: string | null
          created_at?: string
        }
      }
      mensagens_diarias: {
        Row: {
          id: string
          user_id: string
          versiculo: string
          mensagem: string
          oracao: string | null
          data_envio: string
          canal: string
          status: 'pendente' | 'enviado' | 'falhou'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          versiculo: string
          mensagem: string
          oracao?: string | null
          data_envio?: string
          canal?: string
          status?: 'pendente' | 'enviado' | 'falhou'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          versiculo?: string
          mensagem?: string
          oracao?: string | null
          data_envio?: string
          canal?: string
          status?: 'pendente' | 'enviado' | 'falhou'
          created_at?: string
        }
      }
      assinaturas: {
        Row: {
          id: string
          user_id: string
          stripe_session_id: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          status: 'pendente' | 'ativo' | 'cancelado'
          plano: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_session_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status?: 'pendente' | 'ativo' | 'cancelado'
          plano?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_session_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status?: 'pendente' | 'ativo' | 'cancelado'
          plano?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
