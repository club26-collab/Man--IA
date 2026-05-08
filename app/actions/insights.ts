'use server';

import { GoogleGenAI } from '@google/genai';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';

const supabaseAdmin = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

const client = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

export async function gerarReflexaoPersonalizada() {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Não autorizado' };
    }

    if (!supabaseAdmin) {
      return { success: false, error: 'Configuração do servidor incompleta' };
    }

    const { data: perfil } = await supabaseAdmin
      .from('perfis')
      .select('plano, creditos, nome')
      .eq('id', user.id)
      .single();

    if (!perfil) {
      return { success: false, error: 'Perfil não encontrado' };
    }

    if (perfil.plano === 'gratis' && perfil.creditos <= 0) {
      return { success: false, error: 'Créditos esgotados. Faça upgrade para gerar sua reflexão!' };
    }

    const { data: sentimentos } = await supabaseAdmin
      .from('sentimentos')
      .select('descricao, sentimento, area_vida, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(15);

    if (!sentimentos || sentimentos.length < 3) {
      return {
        success: false,
        error: 'not_enough_data',
        message: 'Para uma reflexão profunda, precisamos de mais dados. Registre pelo menos 3 acolhimentos primeiro.'
      };
    }

    if (!client) {
      return { success: false, error: 'Configuração da IA incompleta no servidor.' };
    }

    const sentimentosFormatados = sentimentos.map((s, i) =>
      `Registro ${i + 1} (${new Date(s.created_at).toLocaleDateString()}): "${s.descricao}" [Sentimento: ${s.sentimento || 'N/I'} | Área: ${s.area_vida || 'N/I'}]`
    ).join('\n\n');

    const promptText = `Atue como um conselheiro pastoral e mentor de bem-estar emocional baseado na sabedoria bíblica.
Você está analisando o histórico emocional de ${perfil.nome}.
Leia atentamente e encontre padrões espirituais e emocionais.

REGISTROS:
${sentimentosFormatados}

Retorne um JSON ESTRITAMENTE com a seguinte estrutura:
{
  "temasPrincipais": [
    { "nome": "Ex: Ansiedade/Falta de Paz", "quantidade": 5 },
    { "nome": "Ex: Busca por Propósito", "quantidade": 3 }
  ],
  "analiseGeral": "Um parágrafo acolhedor e encorajador explicando a fase espiritual e emocional que a pessoa está passando.",
  "gatilhosInfluenciadores": ["Lista de 3 a 4 possíveis gatilhos ou causas emocionais identificadas nos registros."],
  "dicasEspirituais": ["Lista de 3 a 4 práticas espirituais ou hábitos saudáveis para fortalecer a fé e o bem-estar (ex: Leitura de Salmos, Oração matinal, Gratidão diária)."]
}
IMPORTANTE: "temasPrincipais" deve ter no máximo 5 itens. A "quantidade" deve refletir o "peso" daquele tema nos registros (de 1 a 10). O texto de analiseGeral deve ser acolhedor e bíblico.`;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error('IA retornou vazio');

    const resultData = JSON.parse(jsonText);

    if (perfil.plano === 'gratis') {
      await supabaseAdmin
        .from('perfis')
        .update({ creditos: perfil.creditos - 1 })
        .eq('id', user.id);
    }

    return { success: true, data: resultData };

  } catch (error: any) {
    console.error('Erro ao gerar reflexão:', error);

    if (error.message?.includes('429') || error.status === 429) {
      return { success: false, error: 'O serviço está sobrecarregado no momento. Por favor, aguarde cerca de 1 minuto e tente novamente.' };
    }

    return { success: false, error: 'Erro interno ao gerar reflexão personalizada.' };
  }
}
