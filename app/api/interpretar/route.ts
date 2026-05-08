import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';

const supabaseAdmin = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

const client = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

const contextosSentimentos: Record<string, string> = {
  ansiedade: 'Pessoas ansiosas precisam de paz e confiança.',
  tristeza: 'Pessoas tristes precisam de conforto e esperança.',
  gratidao: 'Pessoas gratas precisam de celebração e profundidade.',
  medo: 'Pessoas com medo precisam de coragem e proteção.',
  esperanca: 'Pessoas esperançosas precisam de confirmação e visão.',
  cansaco: 'Pessoas cansadas precisam de descanso e renovação.',
  paz: 'Pessoas em paz precisam de gratidão e comunhão.',
  raiva: 'Pessoas com raiva precisam de paciência e perdão.',
  solidao: 'Pessoas solitárias precisam de companhia divina.',
  alegria: 'Pessoas alegres precisam de celebração e gratidão.',
  confusao: 'Pessoas confusas precisam de clareza e direção.',
  culpa: 'Pessoas com culpa precisam de perdão e libertação.',
  amor: 'Pessoas sentindo amor precisam de aprofundamento.',
};

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { sentimento, nome, sentimentoTag, areaVida } = body;

    if (!sentimento || !nome) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Configuração do servidor incompleta' }, { status: 500 });
    }

    const { data: perfil } = await supabaseAdmin
      .from('perfis')
      .select('plano, creditos')
      .eq('id', user.id)
      .single();

    if (!perfil) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
    }

    if (perfil.plano === 'gratis' && perfil.creditos <= 0) {
      return NextResponse.json({ error: 'Créditos esgotados. Faça upgrade!' }, { status: 403 });
    }

    let acolhimento: string;

    if (client) {
      let contexto = '';
      if (sentimentoTag && contextosSentimentos[sentimentoTag]) contexto += contextosSentimentos[sentimentoTag] + ' ';
      if (areaVida) contexto += `Área da vida: ${areaVida}. `;

      const prompt = `Você é um Mentor Espiritual empático e sábio, especializado em aconselhamento bíblico e bem-estar emocional.

CONTEXTO: ${nome} | Sentimento: ${sentimentoTag || 'N/I'} | Área: ${areaVida || 'N/I'}
CONTEXTO ADICIONAL: ${contexto}

O QUE A PESSOA COMPARTILHOU: "${sentimento}"

Responda em markdown com exatamente estas 3 seções:

## 📖 Versículo para o Coração
[Cite UM versículo bíblico REAL e completo. Explique brevemente como ele se conecta ao sentimento.]

## 💛 Palavra de Acolhimento
[Mensagem de conforto e encorajamento. Reconheça o sentimento e mostre que Deus está presente.]

## 🙏 Oração para o Dia
[Oração curta e pessoal para a pessoa fazer ao longo do dia.]`;

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      acolhimento = response.text ?? '';

      if (!acolhimento) {
        return NextResponse.json({ error: 'IA retornou resposta vazia' }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: 'Configuração da IA incompleta no servidor.' }, { status: 500 });
    }

    if (perfil.plano === 'gratis') {
      await supabaseAdmin
        .from('perfis')
        .update({ creditos: perfil.creditos - 1 })
        .eq('id', user.id);
    }

    const { data: sentimentoSalvo, error: insertError } = await supabaseAdmin.from('sentimentos').insert({
      user_id: user.id,
      descricao: sentimento,
      sentimento: sentimentoTag || null,
      area_vida: areaVida || null,
      acolhimento,
    }).select('id').single();

    if (insertError || !sentimentoSalvo) {
      return NextResponse.json({ acolhimento }, { status: 200 });
    }

    return NextResponse.json({ acolhimento, sentimentoId: sentimentoSalvo.id });
  } catch (error: unknown) {
    const err = error as { message?: string; stack?: string; code?: string; status?: number };
    console.error('Erro no acolhimento:', err.message, err.stack);
    return NextResponse.json(
      { error: `Erro interno: ${err.message || 'Erro desconhecido'}` },
      { status: 500 }
    );
  }
}
