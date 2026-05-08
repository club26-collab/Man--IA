# Nume

App que conecta nutricionista e cliente em tempo real. Nutri monta o cardápio, cliente segue e marca o que comeu. Nutri enxerga o real — não o que o cliente falou na consulta.

---

## Conceito

Nutricionistas perdem tempo com PDF, WhatsApp, planilha. Clientes não seguem a dieta porque é difícil traduzir papel em prato. Nume resolve os dois lados:

- **Nutri:** monta cardápio, acompanha adesão em tempo real, ajusta antes da próxima consulta
- **Cliente:** abre o app e vê o que comer AGORA. Marca com 1 tap. Sem pensar.

---

## Público-alvo

- Nutricionistas clínicos e esportivos
- Personal trainers que montam dieta
- Clientes de nutrição (qualquer pessoa com dieta ativa)
- Academias que oferecem acompanhamento nutricional

---

## Funcionalidades

### Nutricionista (Web)

#### Aba Clientes (hub central)

- **Lista de clientes** com nome, foto (avatar), WhatsApp, plano contratado
- Status: 🟢 ativo / 🟡 vence essa semana / 🔴 vencido
- **Busca rápida** — digita nome ou WhatsApp
- **Ações em cada cliente:**
  - Abrir cardápio
  - Ver relatório de adesão
  - Enviar mensagem (abre WhatsApp)
  - Renovar / arquivar
- **Badge de alerta:** "João não come há 8h" | "Maria pulou 3 refeições seguidas"

#### Cardápio Semanal

- Grade visual: dias da semana (colunas) × refeições (linhas)
- Cada célula: foto do prato + nome + botão "substituir"
- Arrasta refeição para copiar/dias seguintes
- Substituições: até 3 opções por refeição
- Modo "quick copy": "aplicar cardápio da segunda pra terça"

#### Metas do Cliente

- Calorias totais
- Proteína (g)
- Carboidrato (g)
- Gordura (g)
- Água (ml)
- Definição por refeição (ex: café 30g proteína, almoço 50g)

#### Relatório de Adesão

- Gráfico: % de refeições cumpridas por dia/semana/mês
- Quais refeições mais puladas
- Quais substituições mais usadas
- Média de macros atingidos vs meta
- Exportável em PDF para consulta

### Cliente (Mobile)

#### Hoje

- **Checklist horizontal das refeições do dia:** ☐ Café | ☐ Almoço | ☐ Lanche 1 | ☐ Janta | ☐ Lanche 2
- Cada refeição: foto do prato + nome + botões grandes: ✅ Comi tudo | ◐ Metade | ✗ Pulei
- "Tô sem fome" — botão sem culpa

#### Progresso

- Barras visuais: Proteína █████░░ 80% | Carbo ████░░░ 60% | Gordura ██░░░░░ 40%
- Água: copo enchendo a cada 200ml registrado
- Timer de jejum (se aplicável)

#### Refeição Detalhada

- Foto grande do prato
- Ingredientes listados
- Modo de preparo rápido
- Botão: "Não tenho esse ingrediente" → sugere 3 substituições equivalentes
- Porções: "1 concha de arroz" com imagem de referência

#### Perfil

- Minhas metas (calorias, proteína etc)
- Meu nutricionista (nome, WhatsApp, plano)
- Histórico de adesão
- Notificações: "Hora do café!" | "Faltam 2h para fechar a proteína do dia"

---

## Design

### Princípios

| Princípio | Descrição |
|---|---|
| **Nutri vê tudo** | Dashboard com visão geral de todos os clientes e alertas |
| **Cliente não pensa** | Abre o app e vê exatamente o que comer agora |
| **Foto primeiro** | Cada refeição com foto real. Não texto |
| **Checklist horizontal** | Refeições do dia como cards deslizáveis |
| **Sem culpa** | "Pulei" e "comi metade" são opções normais, não fracasso |
| **Substituição inteligente** | Acabou o ingrediente? App sugere equivalente nutricional |

### Paleta

- Fundo: Off-white suave (#F7F5F0)
- Primary: Verde hortelã (#7EB89A) — nutrição, saúde
- Secundária: Salmão (#E8A87C) — energia, apetite
- Acento: Roxo suave (#9B8EC4) — dados, relatórios
- Alerta: Laranja (#D4936A)
- Texto: Quase preto (#2D2D2D)

### Tipografia

- Títulos: "Playfair Display" ou "DM Serif" — toque acolhedor
- Corpo: "Inter" — legibilidade mobile

---

## Arquitetura Técnica

### Stack

```
Nutri (Web)      → Next.js + Supabase (admin panel)
Cliente (Mobile) → React Native (Expo)
Backend          → Supabase (auth, DB, storage de fotos)
IA               → Gemini API (sugestão de substituição, análise de adesão)
Pagamento        → Stripe
Notificação      → OneSignal / Firebase Cloud Messaging
Armazenamento    → Supabase Storage (fotos de pratos)
```

### Estrutura de pastas

```
NUME/
├── web/                             # App do nutricionista (Next.js)
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── clientes/           # Lista + busca + status
│   │   │   │   └── [id]/           # Cardápio, relatório, metas
│   │   │   ├── cardapio/           # Grade semanal
│   │   │   └── relatorios/
│   │   └── auth/
│   └── components/
│       ├── ClienteCard.tsx
│       ├── GradeCardapio.tsx
│       ├── SubstituicaoModal.tsx
│       └── RelatorioAdesao.tsx
│
├── mobile/                          # App do cliente (Expo)
│   ├── app/
│   │   ├── (tabs)/
│   │   │   ├── hoje.tsx            # Checklist + fotos
│   │   │   ├── progresso.tsx       # Barras de macros
│   │   │   └── perfil.tsx
│   │   └── refeicao/[id].tsx       # Detalhe da refeição
│   └── components/
│       ├── CardRefeicao.tsx
│       ├── BarraMacro.tsx
│       ├── AguaCopo.tsx            # Animação de copo enchendo
│       └── SubstituicaoLista.tsx
│
└── lib/
    ├── supabase.ts
    ├── tipos.ts
    └── calculos.ts                  # Engine de metas e adesão
```

### Banco de Dados (Supabase)

```sql
-- Nutricionistas
profissionais
  id uuid PK
  nome text
  email text
  whatsapp text
  registro text (CRN)
  plano text

-- Clientes do nutricionista
clientes
  id uuid PK
  profissional_id uuid FK
  nome text
  whatsapp text
  foto_url text nullable
  plano text
  ativo boolean default true
  data_inicio date
  data_vencimento date nullable
  metas_id uuid FK (metas_nutricionais)

-- Metas nutricionais
metas_nutricionais
  id uuid PK
  calorias integer
  proteina_g integer
  carboidrato_g integer
  gordura_g integer
  agua_ml integer
  por_refeicao jsonb -- { cafe: { proteina: 30, carbo: 40 }, almoco: { ... } }

-- Cardápio semanal
cardapios
  id uuid PK
  cliente_id uuid FK
  semana_inicio date
  criado_em timestamptz

-- Refeições do cardápio
refeicoes_cardapio
  id uuid PK
  cardapio_id uuid FK
  dia_semana text (segunda, terca...)
  tipo text (cafe, almoco, lanche1, janta, lanche2)
  nome text
  foto_url text
  ingredientes jsonb -- [{ nome, quantidade }]
  modo_preparo text
  ordem integer

substituicoes
  id uuid PK
  refeicao_id uuid FK
  nome text
  foto_url text
  ingredientes jsonb
  modo_preparo text
  ordem integer

-- Registro do cliente (o que realmente comeu)
registros_diarios
  id uuid PK
  cliente_id uuid FK
  data date
  refeicao_id uuid FK
  status text (comi_tudo, metade, pulei)
  substituicao_id uuid FK nullable
  foto_registro text nullable (cliente pode tirar foto)
  registrado_em timestamptz

-- Métricas calculadas
adesao_diaria
  cliente_id uuid FK
  data date
  total_refeicoes integer
  cumpridas integer
  metade integer
  puladas integer
  proteina_atingida_g integer
  carbo_atingido_g integer
  gordura_atingida_g integer
  agua_ml integer
```

---

## Monetização

| Plano | Preço | Para |
|---|---|---|
| Gratuito | R$ 0 | Cliente — acompanha a dieta |
| Nutri Pro | R$ 29/mês | Nutricionista — até 15 clientes |
| Nutri Premium | R$ 59/mês | Nutricionista — clientes ilimitados, IA, relatórios |

Gancho: **nutri paga, cliente usa de graça.**

---

## Fluxo do Usuário

### Nutricionista

1. Cadastra-se (CRN, WhatsApp)
2. Cria plano de nutrição (metas)
3. Adiciona cliente → envia convite por WhatsApp
4. Monta cardápio semanal na grade visual
5. Acompanha adesão em tempo real
6. Ajusta cardápio com 2 cliques
7. Relatório na consulta: "você seguiu 80% da dieta esse mês"

### Cliente

1. Recebe convite no WhatsApp → baixa o app
2. Abre → vê "Café da manhã: Omelete de frango" com foto
3. Comeu? ✅ Comi tudo. Não comeu? ✗ Pulei (sem culpa)
4. Vê progresso do dia: proteína 80%, carbo 60%
5. "Não tenho frango" → app mostra 3 opções equivalentes
6. Nutri vê em tempo real e ajusta se precisar

---

## Diferenciais

- **Nutri enxerga o real** — não o relato na consulta
- **Adesão em tempo real** — alerta se cliente pulou 3 refeições
- **Substituição inteligente por IA** — equivalente nutricional real
- **WhatsApp integrado** — convite, notificação, suporte
- **Cliente não precisa pensar** — abre e vê o que comer
- **Nutri não precisa de planilha** — cardápio visual, arrasta e solta
