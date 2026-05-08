import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';

const VERCEL_CRON_SECRET = process.env.VERCEL_CRON_SECRET || '';

const client = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

const supabaseAdmin = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${VERCEL_CRON_SECRET}`) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  if (!client || !supabaseAdmin) {
    return NextResponse.json({ error: 'Configuração incompleta' }, { status: 500 });
  }

  try {
    const { data: usuariosPro } = await supabaseAdmin
      .from('perfis')
      .select('id, nome, email')
      .eq('plano', 'pro');

    if (!usuariosPro || usuariosPro.length === 0) {
      return NextResponse.json({ message: 'Nenhum usuário Pro encontrado', count: 0 });
    }

    const hoje = new Date().toISOString().split('T')[0];
    const resultados: Array<{ userId: string; nome: string; mensagem: string; status: string }> = [];

    for (const usuario of usuariosPro) {
      try {
        const prompt = `Gere uma "Mensagem de Maná" para ${usuario.nome}. É manhã e ele/ela precisa começar o dia com uma palavra de Deus.

Retorne APENAS um JSON com esta estrutura:
{
  "versiculo": "Texto completo do versículo (com referência)",
  "mensagem": "Breve reflexão de conforto e encorajamento (3-4 frases)",
  "oracao": "Uma oração curta para o dia (2-3 frases)"
}

Use versículos reais da Bíblia. Seja acolhedor e inspirador. Varie os livros bíblicos.`;

        const response = await client.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          }
        });

        const jsonText = response.text;
        if (!jsonText) throw new Error('Resposta vazia');

        const msgData = JSON.parse(jsonText);

        await supabaseAdmin.from('mensagens_diarias').insert({
          user_id: usuario.id,
          versiculo: msgData.versiculo,
          mensagem: msgData.mensagem,
          oracao: msgData.oracao,
          data_envio: hoje,
          canal: 'app',
          status: 'pendente',
        });

        resultados.push({
          userId: usuario.id,
          nome: usuario.nome,
          mensagem: 'Gerada com sucesso',
          status: 'sucesso',
        });

        if (process.env.WHATSAPP_API_URL && process.env.WHATSAPP_API_TOKEN) {
          try {
            await fetch(process.env.WHATSAPP_API_URL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
              },
              body: JSON.stringify({
                phone: usuario.email,
                message: `☀️ Bom dia, ${usuario.nome}!\n\n📖 ${msgData.versiculo}\n\n💛 ${msgData.mensagem}\n\n🙏 ${msgData.oracao}\n\n— Maná AI`,
              }),
            });

            await supabaseAdmin
              .from('mensagens_diarias')
              .update({ status: 'enviado', canal: 'whatsapp' })
              .eq('user_id', usuario.id)
              .eq('data_envio', hoje);
          } catch {
            console.error(`Erro ao enviar WhatsApp para ${usuario.nome}`);
          }
        }

        await new Promise(r => setTimeout(r, 1000));
      } catch (error: any) {
        console.error(`Erro ao gerar mensagem para ${usuario.nome}:`, error.message);
        resultados.push({
          userId: usuario.id,
          nome: usuario.nome,
          mensagem: error.message,
          status: 'erro',
        });
      }
    }

    return NextResponse.json({
      message: 'Mensagens de Maná geradas',
      total: usuariosPro.length,
      resultados,
    });

  } catch (error: any) {
    console.error('Erro no workflow de Maná:', error.message);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
