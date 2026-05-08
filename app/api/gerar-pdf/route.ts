import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';

const getSupabaseAdmin = () => createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { sentimentoId } = await req.json();

    if (!sentimentoId) {
      return NextResponse.json({ error: 'ID do acolhimento necessário' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: sentimento } = await supabaseAdmin
      .from('sentimentos')
      .select('*')
      .eq('id', sentimentoId)
      .eq('user_id', user.id)
      .single();

    if (!sentimento) {
      return NextResponse.json({ error: 'Acolhimento não encontrado' }, { status: 404 });
    }

    const { data: perfil } = await supabaseAdmin
      .from('perfis')
      .select('nome')
      .eq('id', user.id)
      .single();

    const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Acolhimento - Mana AI</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; background: #F9F7F2; color: #1a2e33; padding: 40px; max-width: 700px; margin: 0 auto; }
  .header { text-align: center; padding-bottom: 30px; border-bottom: 1px solid rgba(45,90,97,0.2); margin-bottom: 30px; }
  .logo { font-size: 24px; font-weight: 700; color: #2D5A61; margin-bottom: 8px; }
  .subtitle { color: #5a7075; font-size: 14px; }
  .meta { display: flex; gap: 20px; margin-bottom: 30px; flex-wrap: wrap; }
  .meta-item { background: rgba(255,255,255,0.6); padding: 12px 20px; border-radius: 12px; border: 1px solid rgba(45,90,97,0.1); }
  .meta-label { font-size: 12px; color: #5a7075; margin-bottom: 4px; }
  .meta-value { font-size: 16px; font-weight: 600; }
  .sentimento-section { background: rgba(255,255,255,0.6); padding: 24px; border-radius: 16px; border: 1px solid rgba(45,90,97,0.1); margin-bottom: 24px; }
  .sentimento-section h3 { color: #2D5A61; font-size: 18px; margin-bottom: 12px; }
  .sentimento-text { color: #5a7075; line-height: 1.7; }
  .acolhimento-section { padding: 24px 0; }
  .acolhimento-section h2 { color: #b8991e; font-size: 20px; margin-bottom: 20px; }
  .acolhimento-content { color: #5a7075; line-height: 1.8; }
  .acolhimento-content h3 { color: #2D5A61; font-size: 16px; margin: 24px 0 12px 0; }
  .acolhimento-content p { margin-bottom: 12px; }
  .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(45,90,97,0.1); color: #999; font-size: 12px; }
</style>
</head>
<body>
  <div class="header">
    <div class="logo">✦ Mana AI</div>
    <div class="subtitle">Acolhimento Espiritual Diario</div>
  </div>
  <div class="meta">
    <div class="meta-item"><div class="meta-label">Nome</div><div class="meta-value">${perfil?.nome || 'Buscante'}</div></div>
    <div class="meta-item"><div class="meta-label">Data</div><div class="meta-value">${new Date(sentimento.created_at).toLocaleDateString('pt-BR')}</div></div>
  </div>
  <div class="sentimento-section">
    <h3>💛 Como você se sentia</h3>
    <p class="sentimento-text">${sentimento.descricao}</p>
  </div>
  <div class="acolhimento-section">
    <h2>✝️ Seu Acolhimento</h2>
    <div class="acolhimento-content">${sentimento.acolhimento}</div>
  </div>
  <div class="footer">
    <p>Gerado por Mana AI • ${new Date().toLocaleDateString('pt-BR')}</p>
  </div>
  <script>window.print();</script>
</body>
</html>`;

    return NextResponse.json({ html });
  } catch {
    return NextResponse.json({ error: 'Erro ao gerar PDF' }, { status: 500 });
  }
}
