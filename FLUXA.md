# Fluxa

App mobile-first de finanças pessoais para autônomos, MEIs e freelancers — pessoas com renda variável que apps bancários tradicionais ignoram.

---

## Conceito

Fluxa não é um "app de controle financeiro". É um **companheiro de caixa** que responde uma única pergunta: **"Quanto posso gastar hoje?"** Toda complexidade (imposto, parcelas, projeção) existe em segundo plano para chegar nesse número.

---

## Público-alvo

- Autônomos (pedreiro, diarista, eletricista, uber)
- Freelancers (designer, dev, fotógrafo)
- MEIs (microempreendedor individual)
- Pessoas com renda variável ou multiple fontes

---

## Funcionalidades

### Core (MVP)

1. **Dashboard "Quanto sobra hoje"**
   - Número grande e central: saldo livre após contas previstas
   |  R$ 127,50  |  Faltam 12 dias para fechar o mês  |
   - Abaixo: alerta se cair abaixo de "2 meses de custo fixo"

2. **Entrada Express**
   - Tela única: teclado numérico + 6 categorias grandes com cor
   - 2 toques registra um gasto (categoria + valor)
   - Aceita **voz**: "gasolina 50 reais" → já categoriza

3. **Receita com vínculo**
   - Cada receita vinculada a um cliente/projeto
   - Mostra margem por cliente: "João: R$ 2000 recebidos, R$ 150 em custos"

4. **Projeção de imposto automática**
   - Calcula DAS (MEI) ou carnê-leão baseado no que entrou
   - Sugere: "Separe R$ 87,00 para imposto esse mês"

5. **Meta de caixa**
   - Define quantos meses de custo quer ter de reserva
   - Alerta quando saldo cai abaixo disso

6. **Extrato semanal**
   - Notificação: "Essa semana: +R$ 1.200,00 / -R$ 340,00"
   - Resumo sem cálculo mental

7. **Offline-first**
   - Funciona 100% sem internet (autônomo no metrô, obra, rua)
   - Sincroniza quando voltar ao normal

### Versão 2.0+

- Envio de cobrança por WhatsApp com resumo
- Relatório anual para declaração de IR
- Múltiplos "caixas" (pessoa física + PJ)
- Compartilhar com contador
- Integração com bancos via Open Finance

---

## Design

### Princípios

| Princípio | Descrição |
|---|---|
| **1 mão** | Tudo no alcance do polegar, sem esticar |
| **1 número** | Cada tela mostra apenas o número importante do momento |
| **Cor > ícone** | Categorias são identificadas por cor, não por ícone (reconhecimento mais rápido) |
| **Card deslizável** | Cada entrada = card horizontal. Arrasta p/ deletar, marcar pago, editar |
| **Tom acolhedor** | Sem "saldo negativo". "Vamos ajustar a rota?" com linguagem de parceria |
| **Sem gráficos** | Autônomo não quer pizza/barra. Quer números e alertas |
| **Fonte grande** | Números em fonte extra-grande. Leitura de relance |

### Paleta

- Fundo: Off-white quente (#FAF8F4)
- Primary: Verde musgo (#4A7C5F) — dinheiro sem ser "ouro escandaloso"
- Secundária: Azul calmo (#5B7FA5) — confiança
- Alerta: Laranja queimado (#C9743E)
- Acento positivo: Verde claro (#82B787)
- Texto: Quase preto (#2D2D2D)

### Tipografia

- Números: "JetBrains Mono" ou "Inter Variable" — monoespaçada para valores
- Corpo: "Inter" — limpa e legível em mobile

---

## Arquitetura Técnica

### Stack

```
Frontend     → React Native (Expo) — mobile-first, 1 app Android/iOS
Backend      → Supabase (auth, DB realtime, storage)
Serverless   → Vercel Functions (webhooks, notificações)
IA           → Gemini API (para categorização por voz e insights)
Pagamento    → Stripe
Offline      → SQLite local (expo-sqlite) + sync com Supabase
Notificação  → OneSignal ou Firebase Cloud Messaging
```

### Estrutura de pastas (projetada)

```
FLUXA/
├── app/                     # Expo Router (telas)
│   ├── (tabs)/
│   │   ├── index.tsx        # Dashboard
│   │   ├── entrada.tsx      # Entrada Express
│   │   ├── extrato.tsx      # Extrato detalhado
│   │   └── config.tsx       # Config / metas
│   ├── auth/
│   └── onboarding/
├── components/
│   ├── CardMovimento.tsx    # Card deslizável
│   ├── TecladoNumerico.tsx
│   ├── CategoriaGrid.tsx
│   └── SaldoDisplay.tsx     # Número grande central
├── lib/
│   ├── supabase.ts
│   ├── categorias.ts
│   └── calculos.ts          # Engine de projeção
├── stores/
│   └── useCaixa.ts          # Zustand + SQLite offline
└── app.json
```

### Banco de Dados (Supabase)

```sql
-- Tabelas principais

movimentos
  id uuid PK
  user_id uuid FK
  tipo 'receita' | 'despesa'
  categoria text
  valor integer (centavos)
  descricao text
  cliente_id uuid FK nullable
  projeto text nullable
  forma_pagamento text
  data_movimento date
  criado_em timestamptz
  sincronizado boolean default false

clientes
  id uuid PK
  user_id uuid FK
  nome text
  cor text (para identificar visualmente)

metas
  user_id uuid PK FK
  meses_reserva integer default 2
  alerta_ativado boolean default true
```

### Engine de Cálculo (core)

```typescript
// Exemplo da lógica central
function saldoLivreHoje(
  saldoAtual: number,
  receitasPrevistas: number,
  despesasFixas: number,
  impostoEstimado: number,
  custoFixoMensal: number
): { saldo: number; alertaBaixo: boolean } {
  const reservaNecessaria = custoFixoMensal * 2;
  const saldoAposContas =
    saldoAtual + receitasPrevistas - despesasFixas - impostoEstimado;
  return {
    saldo: saldoAposContas,
    alertaBaixo: saldoAposContas < reservaNecessaria,
  };
}
```

---

## Monetização

| Plano | Preço | Limites |
|---|---|---|
| Gratuito | R$ 0 | 30 lançamentos/mês, 1 meta de caixa |
| Fluxa Pro | R$ 9,90/mês | Ilimitado, relatórios, voz, cobrança WhatsApp |
| Anual | R$ 89,10/ano (R$ 7,42/mês) | Mesmo do Pro com 25% off |

---

## Fluxo do Usuário

1. Abre o app → vê **"R$ 127,00"** (quanto pode gastar hoje)
2. Gastou algo? → 2 toques registra
3. Recebeu? → 2 toques registra com nome do cliente
4. Fim de semana → notificação com resumo da semana
5. Fim do mês → "Você gastou R$ X em alimentação esse mês"
6. Se saldo baixar → "Vamos ajustar a rota?" + sugestão de corte

---

## Diferenciais contra concorrência

- **Não é banco** — não quer ser conta digital, não tem cartão
- **Offline nativo** — não depende de internet como a maioria
- **Projeção de imposto** — nenhum app popular faz isso para autônomo
- **UX de 1 mão** — pensado para uso no dia a dia corrido
- **Tom humano** — não trata o usuário como empresa
