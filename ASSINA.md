# Assina

Gerenciador de assinaturas que descobre onde seu dinheiro está sumindo todo mês. Conecta, detecta, avisa e sugere cortes.

---

## Conceito

Todo mundo tem: Netflix, Spotify, Amazon Prime, YouTube Premium, iCloud, Google Drive, academia, seguro do carro, plano de saúde, aluguel de domínio, GitHub Sponsors... a soma assusta ninguém.

Assina resolve:

1. **Detecta** assinaturas automaticamente (extrato bancário, e-mail, ou manual)
2. **Avisa** antes de cada renovação
3. **Mostra** o gasto mensal/anual total (spoiler: é sempre maior que você imagina)
4. **Sugere** o que cancelar baseado no seu uso ("você não abre o Paramount+ há 3 meses")
5. **Cobra** se quiser cancelar por você (se tiver integração)

---

## Público-alvo

- Qualquer pessoa com 3+ assinaturas ativas
- Jovens adultos (18-35) que assinaram tudo na pandemia e esqueceram
- Pessoas tentando economizar ("onde meu dinheiro foi?")
- Famílias com múltiplos serviços de streaming

---

## Funcionalidades

### Core (MVP)

1. **Dashboard "Quanto você gasta"**
   - Número grande: **R$ 287,00/mês**
   - Abaixo: gasto anual equivalente + "isso dá X dias de mercado"
   - Gráfico de pizza simples por categoria: streaming, produtividade, saúde, outros

2. **Lista de assinaturas**
   - Cada uma: ícone + nome + valor + próxima cobrança
   | Spotify | R$ 21,90/mês | Renova em 3 dias |
   - Ordenável por: valor, data de renovação, categoria
   - Arrasta para arquivar (cancelada)

3. **Detecção automática (manual no MVP)**
   - Usuário adiciona manualmente (2 campos: nome + valor)
   - V2: escaneia e-mail por "sua assinatura foi renovada"
   - V3: conexão com banco via Open Finance

4. **Calendário de renovações**
   - Próximos 30 dias: "Dia 12: Netflix (R$ 55,90) | Dia 15: Academia (R$ 99,00)"
   - Notificação 3 dias antes: "Netflix vai renovar em 3 dias. Quer cancelar?"

5. **Relatório de uso**
   - "Você usou o Apple TV nos últimos 30 dias?" → Sim / Não / Não lembro
   - Se não usou: "Que tal cancelar? Já economizou R$ 59,90 esse ano"

6. **Meta de economia**
   - "Quero gastar no máximo R$ 100/mês em assinaturas"
   - App sugere o que cancelar para atingir a meta

### V2.0+

- Escaneamento automático de e-mail (Gmail API / IMAP)
- Integração Open Finance (Brasil)
- Cancelamento por delegação (o app cancela pra você)
- Alertas de aumento de preço ("Netflix subiu de R$ 55,90 para R$ 65,90")
- Compartilhamento familiar: "sua mãe usa sua Netflix?"

---

## Design

### Princípios

| Princípio | Descrição |
|---|---|
| **O número que dói** | Mostra TOTAL mensal grande. O choque é o gatilho da ação |
| **Cada assinatura é um card** | Card horizontal com ícone, valor grande, data de renovação |
| **Cor = urgência** | Verde >30 dias. Amarelo 7-30 dias. Vermelho <7 dias |
| **Ação principal = cancelar** | Botão "Cancelar" sempre visível. Não esconde |
| **Sem cadastro complexo** | Primeira tela: "Quanto você gasta?" → usuário já coloca valores |

### Paleta

- Fundo: Off-white (#F9F8F6)
- Primary: Vermelho granada (#C44A4A) — urgência para cortar gastos
- Secundária: Azul petróleo (#2C6E6F) — confiança, controle
- Economia: Verde lima (#81C784) — positivo, meta atingida
- Alerta: Laranja (#E8944A)
- Texto: Quase preto (#2D2D2D)

### Tipografia

- Valores: "JetBrains Mono" ou "Inter Variable" — destaque para números
- Corpo: "Inter" — limpo e legível mobile

---

## Arquitetura Técnica

### Stack

```
Frontend (Mobile) → React Native (Expo) — Android + iOS
Backend           → Supabase (auth, DB, edge functions)
IA                → Gemini API (classificação automática de assinaturas por e-mail)
Pagamento         → Stripe
Notificação       → OneSignal
E-mail scan       → Gmail API / IMAP (V2)
```

### Banco de Dados (Supabase)

```sql
assinaturas
  id uuid PK
  user_id uuid FK
  nome text
  categoria text (streaming, produtividade, saude, academia, outros)
  valor_centavos integer
  ciclo text (mensal, anual, trimestral, semestral)
  data_proxima_cobranca date
  data_inicio date
  icone text (url ou emoji)
  cor text (hex)
  url_cancelamento text nullable
  ativa boolean default true
  ultimo_uso timestamptz nullable
  criado_em timestamptz

metas
  id uuid PK
  user_id uuid FK
  valor_maximo_centavos integer
  ativa boolean default true

registros_uso
  id uuid PK
  assinatura_id uuid FK
  usuario_resposta text (sim, nao, nao_lembro)
  registrado_em timestamptz

historico_precos
  id uuid PK
  assinatura_id uuid FK
  valor_antigo_centavos integer
  valor_novo_centavos integer
  detectado_em timestamptz
```

### Estrutura de pastas

```
ASSINA/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx        # Dashboard (total + gráfico)
│   │   ├── lista.tsx        # Todas as assinaturas
│   │   ├── calendario.tsx   # Próximas renovações
│   │   └── configuracoes.tsx
│   ├── adicionar.tsx         # Adicionar assinatura manual
│   └── assinatura/[id].tsx   # Detalhe da assinatura
├── components/
│   ├── CardAssinatura.tsx    # Card horizontal com ícone + valor
│   ├── TotalDisplay.tsx      # Número grande central
│   ├── GraficoGasto.tsx      # Pizza simples
│   ├── CalendarioRow.tsx     # Linha de renovação
│   └── MetaBar.tsx           # Progresso da meta
├── lib/
│   ├── supabase.ts
│   └── calculos.ts
└── stores/
    └── useAssinaturas.ts     # Zustand + cache local
```

---

## Monetização

| Plano | Preço | Limites |
|---|---|---|
| Grátis | R$ 0 | Até 5 assinaturas, sem calendário |
| Assina Pro | R$ 4,90/mês | Ilimitado, calendário, notificações, relatório |
| Anual | R$ 49/ano (R$ 4,08/mês) | Mesmo do Pro + 2 meses grátis |

Gatilho de venda: usuário chega na 6ª assinatura → "Você atingiu o limite. Assine o Pro por R$ 4,90/mês — menos que 1 café por mês pra controlar seus gastos."

---

## Fluxo do Usuário

1. **Primeiro acesso:** "Quantas assinaturas você tem?" → palpite. "Vamos descobrir?"
2. Adiciona a primeira: nome + valor. App já calcula total.
3. Ao adicionar a 3ª: "Você já gasta R$ 127,00/mês. Sabia disso?"
4. Toda semana: notificação com o total. "Essa semana: R$ 287,00/mês em assinaturas."
5. Antes de renovar: "Netflix renova amanhã (R$ 55,90). Quer cancelar?" → 1 tap cancela.
6. App pergunta de vez em quando: "Usou o Paramount+ esse mês?" → Se não → "Cancelar?"
7. Quando atinge a meta: "🎉 Você economizou R$ 340,00 esse ano cortando assinaturas!"

---

## Diferenciais

- **Foco total em economia** — não é um "organizador financeiro", é um caçador de assinaturas
- **Experiência de choque** — mostrar o total anual é o que faz o usuário agir
- **Meta clara** — "quero gastar no máximo R$ X" com sugestão de cortes
- **Notificação antes de cobrar** — não depois. O app previne, não constata
- **Viral**: "Pede pro amigo instalar e descobrir quanto ele gasta" → indicar amigos desbloqueia funções grátis
