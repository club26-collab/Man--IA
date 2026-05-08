# Maná AI

Acolhimento Espiritual Diário com IA.

## Stack

- **Framework:** Next.js 16 (Turbopack)
- **Linguagem:** TypeScript
- **Estilo:** Tailwind CSS + Framer Motion
- **Banco:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (email/senha)
- **IA:** Google Gemini (2.5-flash)
- **Imagem:** Pollinations API (via proxy)
- **Pagamento:** Stripe
- **Deploy:** Vercel

## Estrutura

```
app/
├── actions/          # Server Actions (acolhimento, regenerar imagem, reflexão)
├── api/              # API Routes (proxy-image, criar-checkout, webhooks, etc.)
├── auth/             # Página de login + callback OAuth
├── dashboard/        # Dashboard principal
├── historico/        # Timeline de acolhimentos anteriores
├── configuracoes/    # Página de configurações
├── insights/         # Insights emocionais
├── onboarding/       # Primeiro acesso (nome do usuário)
└── page.tsx          # Landing page

components/
├── AuthProvider.tsx   # Contexto de autenticação
├── Header.tsx         # Header com navegação
├── SentimentInput.tsx # Input de sentimento + área da vida
├── AcolhimentoDisplay.tsx # Cards de versículo, consolo e oração
├── ReflexaoCard.tsx   # Reflexão diária (sidebar)
├── HistoricoTimeline.tsx # Timeline do histórico
├── QuickStats.tsx     # Estatísticas do usuário
└── PremiumUpgrade.tsx # Upgrade para plano premium

lib/
├── supabase/
│   ├── browser.ts     # Cliente Supabase (client-side)
│   └── server.ts      # Cliente Supabase (server-side)
├── types.ts           # Tipos TypeScript
└── database.types.ts  # Tipos do banco Supabase
```

## Fluxo do Acolhimento

1. Usuário autenticado acessa `/dashboard`
2. Escreve como está se sentindo + escolhe tag de sentimento + área da vida
3. Server Action `gerarAcolhimento()` envia prompt para Gemini
4. Gemini retorna JSON com `texto_acolhimento` (versículo + consolo + oração) e `image_prompt`
5. Acolhimento é exibido em 3 cards coloridos: Versículo (teal), Consolo (sage), Oração (gold)
6. Imagem é gerada via `/api/proxy-image` (Pollinations) com retry + timeout
7. Tudo é salvo na tabela `sentimentos`
8. Usuário perde 1 crédito (plano grátis)

## Variáveis de Ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
NEXT_PUBLIC_APP_URL=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
WHATSAPP_API_URL=
WHATSAPP_API_TOKEN=
VERCEL_CRON_SECRET=
```

## Banco (Supabase)

### perfis
| Coluna | Tipo | Descrição |
|---|---|---|
| id | uuid PK | Mesmo ID do auth.users |
| email | text | Email do usuário |
| nome | text | Nome de exibição |
| plano | text | gratis | premium |
| creditos | int | Saldo de acolhimentos |
| onboarding_completed | boolean | Se já passou pelo onboarding |

### sentimentos
| Coluna | Tipo | Descrição |
|---|---|---|
| id | uuid PK | Auto |
| user_id | uuid FK | Referência ao perfil |
| descricao | text | O que o usuário escreveu |
| sentimento | text | Tag do sentimento |
| area_vida | text | Área da vida |
| acolhimento | text | Resposta da IA (markdown) |
| versiculo | text | Versículo extraído |
| image_url | text | URL da imagem gerada |
| image_prompt | text | Prompt usado na imagem |
| created_at | timestamptz | Data do acolhimento |

## Autenticação

- Login email/senha via Supabase Auth
- Sessão gerenciada por cookies (`@supabase/ssr`)
- AuthProvider (context) gerencia estado global do usuário
- Callback em `/auth/callback` trata link de confirmação e cria perfil

## Estilo (Paleta)

- **Teal:** `#2D5A61` (primário)
- **Sage:** `#B2C2B1` (secundário)
- **Ivory:** `#F9F7F2` (fundo)
- **Gold:** Matte Gold (destaques)

## Deploy

O deploy é automático via Vercel (conectado ao GitHub).
URL: `https://man-ia.vercel.app`
