'use server';

import { GoogleGenAI } from '@google/genai';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';

const supabaseAdmin = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

const client = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

const contextosSentimentos: Record<string, string> = {
  ansiedade: 'Pessoas ansiosas precisam de paz e confiança. Versículos sobre calma, entrega a Deus e confiança são ideais. Visual: ondas suaves se dissolvendo em luz dourada.',
  tristeza: 'Pessoas tristes precisam de conforto e esperança. Versículos sobre consolo, presença de Deus e restauração são ideais. Visual: aurora rompendo nuvens escuras.',
  gratidao: 'Pessoas gratas precisam de celebração e profundidade. Versículos sobre louvor, bênçãos e ações de graça são ideais. Visual: campos floridos banhados em luz quente.',
  medo: 'Pessoas com medo precisam de coragem e proteção. Versículos sobre força, amparo divino e coragem são ideais. Visual: farol brilhante em meio à névoa.',
  esperanca: 'Pessoas esperançosas precisam de confirmação e visão. Versículos sobre promessas, futuro e fé são ideais. Visual: semente germinando em luz divina.',
  cansaco: 'Pessoas cansadas precisam de descanso e renovação. Versículos sobre repouso em Deus e força renovada são ideais. Visual: rio sereno ao entardecer.',
  paz: 'Pessoas em paz precisam de gratidão e comunhão. Versículos sobre shalom, harmonia e presença de Deus são ideais. Visual: lago espelhado sob céu sereno.',
  raiva: 'Pessoas com raiva precisam de paciência e perdão. Versículos sobre mansidão, domínio próprio e reconciliação são ideais. Visual: tempestade se acalmando em arco-íris.',
  solidao: 'Pessoas solitárias precisam de companhia divina. Versículos sobre presença de Deus, amor incondicional e comunidade são ideais. Visual: única árvore iluminada em campo vasto.',
  alegria: 'Pessoas alegres precisam de celebração e gratidão. Versículos sobre júbilo, louvor e alegria no Senhor são ideais. Visual: pássaros voando em céu dourado.',
  confusao: 'Pessoas confusas precisam de clareza e direção. Versículos sobre sabedoria, discernimento e guia de Deus são ideais. Visual: caminho iluminado em floresta nebulosa.',
  culpa: 'Pessoas com culpa precisam de perdão e libertação. Versículos sobre graça, redenção e misericórdia são ideais. Visual: correntes se dissolvendo em partículas de luz.',
  amor: 'Pessoas sentindo amor precisam de aprofundamento. Versículos sobre amor ágape, amor de Deus e relações são ideais. Visual: duas luzes se fundindo em uma só.',
};

const contextosAreaVida: Record<string, string> = {
  familia: 'A área familiar envolve relacionamentos, criação de filhos, casamento e laços de sangue.',
  trabalho: 'A área profissional envolve carreira, propósito, desafios no trabalho e vocação.',
  saude: 'A área de saúde envolve bem-estar físico, mental e emocional.',
  relacionamento: 'A área de relacionamentos envolve amizades, romance e conexões interpessoais.',
  espiritualidade: 'A área espiritual envolve fé, comunhão com Deus, crescimento e práticas devocionais.',
  financeiro: 'A área financeira envolve recursos, provisão, generosidade e administração.',
  pessoal: 'A área pessoal envolve autoconhecimento, crescimento interior e identidade.',
  outro: 'Outras áreas da vida que podem ser abrangidas pela sabedoria bíblica.',
};

const IMAGE_BASE_STYLE = 'sacred minimalism, soft digital painting, divine filtered light, teal #2D5A61 and matte gold palette, organic ethereal brushstrokes, no human faces, focus on symbolism and atmosphere, subtle watermark text "Maná AI" in elegant small font at bottom right corner, mobile-optimized vertical composition 4:5 aspect ratio, contemplative mood';

export async function regenerarImagem(sentimentoId: string) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Não autorizado' };
    if (!supabaseAdmin) return { success: false, error: 'Configuração do servidor incompleta' };

    const { data: sentimento } = await supabaseAdmin
      .from('sentimentos')
      .select('image_prompt')
      .eq('id', sentimentoId)
      .eq('user_id', user.id)
      .single();

    if (!sentimento?.image_prompt) {
      return { success: false, error: 'Nenhum prompt de imagem salvo' };
    }

    const imagePrompt = sentimento.image_prompt.replace(/[^a-zA-Z0-9\s,.-]/g, '').replace(/\s+/g, ' ').trim();
    const imageUrl = `/api/proxy-image?prompt=${encodeURIComponent(imagePrompt)}`;

    await supabaseAdmin.from('sentimentos').update({ image_url: imageUrl }).eq('id', sentimentoId);

    return { success: true, imageUrl };
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error('Erro ao regenerar imagem:', err.message);
    return { success: false, error: 'Erro ao regenerar imagem' };
  }
}

export async function gerarReflexao() {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Não autorizado' };
    if (!client) return { success: false, error: 'Configuração da IA incompleta' };

    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Você é um Mentor Espiritual. Gere uma reflexão curta (máx 4 linhas) para começar o dia bem. Pode incluir um versículo curto se apropriado. Seja acolhedor e prático. Não use emojis. Responda APENAS com o texto da reflexão, sem introdução.`,
    });

    return { success: true, reflexao: response.text || 'Que seu dia seja leve e abençoado.' };
  } catch {
    return { success: true, reflexao: 'Que seu dia seja leve e abençoado.' };
  }
}

export async function gerarAcolhimento(formData: FormData) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Não autorizado' };
    }

    const sentimento = formData.get('sentimento') as string;
    const nome = formData.get('nome') as string;
    const sentimentoTag = formData.get('sentimentoTag') as string | null;
    const areaVida = formData.get('areaVida') as string | null;

    if (!sentimento || !nome) {
      return { success: false, error: 'Dados incompletos' };
    }

    if (!supabaseAdmin) {
      return { success: false, error: 'Configuração do servidor incompleta' };
    }

    const { data: perfil } = await supabaseAdmin
      .from('perfis')
      .select('plano, creditos')
      .eq('id', user.id)
      .single();

    if (!perfil) {
      return { success: false, error: 'Perfil não encontrado' };
    }

    if (perfil.plano === 'gratis' && perfil.creditos <= 0) {
      return { success: false, error: 'Créditos esgotados. Faça upgrade!' };
    }

    if (!client) {
      return { success: false, error: 'Configuração da IA incompleta no servidor.' };
    }

    let contexto = '';
    if (sentimentoTag && contextosSentimentos[sentimentoTag]) {
      contexto += contextosSentimentos[sentimentoTag] + ' ';
    }
    if (areaVida && contextosAreaVida[areaVida]) {
      contexto += contextosAreaVida[areaVida] + ' ';
    }

    const promptText = `Você é um Mentor Espiritual empático e sábio, especializado em aconselhamento bíblico e bem-estar emocional. Sua missão é acolher pessoas com compaixão, usando a sabedoria das Escrituras Sagradas.

CONTEXTO: ${nome} | Sentimento: ${sentimentoTag || 'N/I'} | Área: ${areaVida || 'N/I'}
CONTEXTO ADICIONAL: ${contexto}

O QUE A PESSOA COMPARTILHOU: "${sentimento}"

Retorne APENAS um JSON válido com a seguinte estrutura (sem texto antes ou depois):
{
  "texto_acolhimento": "Responda em markdown com exatamente estas 3 seções:\n\n## 📖 Versículo para o Coração\n[Cite UM versículo bíblico REAL e completo (com referência). Explique brevemente como ele se conecta ao sentimento da pessoa.]\n\n## 💛 Palavra de Acolhimento\n[Escreva uma mensagem de conforto, empatia e encorajamento. Reconheça o sentimento da pessoa e mostre que Deus está presente nessa situação.]\n\n## 🙏 Oração para o Dia\n[Escreva uma oração curta e pessoal, endereçada a Deus, que a pessoa possa fazer ao longo do dia. Seja específico ao sentimento e situação dela.]",
  "image_prompt": "Create a short English visual description (max 150 chars) inspired by the verse and feeling. Style: ${IMAGE_BASE_STYLE}. Focus on symbolic elements that represent comfort, hope and divine presence. Mobile-optimized vertical feel."
}

REGRAS:
1. texto_acolhimento deve ter entre 200-300 palavras no total. Parágrafos curtos (máx 3 linhas).
2. O versículo deve ser REAL e citado corretamente.
3. image_prompt deve ser conciso, em inglês, focado em simbolismo e atmosfera sacra.
4. A imagem NÃO deve conter rostos humanos detalhados.`;

    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: promptText,
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error('IA retornou resposta vazia');

    let parsed: { texto_acolhimento: string; image_prompt: string };
    try {
      const cleaned = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      throw new Error('Resposta da IA em formato inválido');
    }

    const acolhimento = parsed.texto_acolhimento;
    let imageUrl: string | null = null;
    let imagePromptUsed: string | null = null;

    if (parsed.image_prompt) {
      const imagePrompt = parsed.image_prompt
        .replace(/[^a-zA-Z0-9\s,.-]/g, '')
        .replace(/\s+/g, ' ')
        .substring(0, 200)
        .trim();

      imagePromptUsed = imagePrompt;
      imageUrl = `/api/proxy-image?prompt=${encodeURIComponent(imagePrompt)}`;
    }

    const versiculoMatch = acolhimento.match(/📖 Versículo[\s\S]*?\n([\s\S]*?)\n\n/);
    const versiculo = versiculoMatch ? versiculoMatch[1].trim().substring(0, 200) : null;

    if (perfil.plano === 'gratis') {
      await supabaseAdmin
        .from('perfis')
        .update({ creditos: perfil.creditos - 1 })
        .eq('id', user.id);
    }

    const { data: sentimentoSalvo } = await supabaseAdmin.from('sentimentos').insert({
      user_id: user.id,
      descricao: sentimento,
      sentimento: sentimentoTag || null,
      area_vida: areaVida || null,
      acolhimento,
      versiculo,
      image_url: imageUrl,
      image_prompt: imagePromptUsed,
    }).select('id').single();

    return {
      success: true,
      acolhimento,
      imageUrl,
      sentimentoId: sentimentoSalvo?.id || null
    };

  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error('Erro na action de acolhimento:', err.message);
    return { success: false, error: 'Erro interno no servidor' };
  }
}
