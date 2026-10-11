# Plano de pipeline — image-to-imagination (app Shopify)

**Dono:** Head de Produto & Engenharia · **Criado:** 2026-10-11 · **Revisado:** 2026-10-11 (D1, D2 e parte da D8 decididas; Customily; impressão Printful ou Gelato)
**Status:** PROPOSTA. O build da Fase 0 depende do restante da D8 (Printful **ou** Gelato + produtos/preços), das respostas Q3/Q7 (Customily) e da spec do fornecedor escolhido (D3).
**Convenção:** `fato` · `estimativa` · `premissa` · `[unverified]` / `[data needed: X]`. Não houve acesso web nesta sessão: números de free tier, capacidades do Customily e specs de Printful/Gelato **não foram verificados nem inventados**.

---

## 0. Recomendação (resumo)

**Fase 0 = gerador 100% no navegador + entrega ao Customily (o app de personalização que a hellominton.com já usa) + impressão por Printful ou Gelato.** Na prática, o app vira **só uma Theme App Extension**, sem backend no caminho principal.

- O visitante sobe a imagem, escolhe a opção 1, 2 ou 3 e aprova o resultado. O PNG aprovado é **entregue ao Customily** (opção de integração A agora; B se o Customily permitir, ver seção b).
- **O Customily cobre** seletor de produto, preview, carrinho e pedido. A produção vai para **Printful ou Gelato** `[unverified: como o arquivo do Customily chega ao fornecedor, Q5/Q10]`.
- Processamento no navegador com modelos open-source de licença comercial; opção 2 por filtros/shaders; opção 3 por repetição sem IA. Custo zero (D2).

**Trade-off sacrificado:**
1. **Atrito na passagem de bastão** (opção A): o cliente baixa o PNG e sobe de novo no Customily.
2. **Rastreio fino imagem↔pedido**: medimos por atributo do carrinho, não por arquivo.

Em troca: zero backend, zero armazenamento nosso, zero escopo Admin API, privacidade mínima, e reuso do fluxo de compra existente. Sinal de reversão: queda > 40% entre "aprovou" e "adicionou ao carrinho" → migrar para a opção B ou C.

---

## Decisões e fatos registrados

| ID | Data | Decisão / fato | Fonte |
|---|---|---|---|
| **D1** | 2026-10-11 | **"A imagem gerada, depois de aprovada pelo cliente, pode ser usada para customizar produtos na hellominton.com."** | Igor, mensagem direta repassada pelo coordenador |
| **D2** | 2026-10-11 | **"começar custo 0 só para testar e então fazer um plano de expansão"**. Fase 0 com custo zero, sem API de IA paga; gasto só por gatilho da seção (e) + aprovação do Igor | Igor, idem |
| **D8 (parcial 1)** | 2026-10-11 | **"hellominton.com roda em Shopify - os produtos customizáveis via Customily App"**. A loja de instalação é a hellominton.com | Igor, idem |
| **D8 (parcial 2)** | 2026-10-11 | **"O print será usando Printful ou Gelato"**. **A escolha entre os dois segue aberta** | Igor, idem |

**D8, ainda em aberto:** (1) **qual dos dois, Printful ou Gelato**; (2) lista de produtos customizáveis e seus preços.

---

## (a) Stack e arquitetura — Fase 0 (custo zero, com Customily)

| Camada | Decisão Fase 0 | Custo | Trade-off sacrificado |
|---|---|---|---|
| Distribuição | **App custom** só na hellominton, contendo **apenas a Theme App Extension** | Zero `[unverified]` | Revenda a outros lojistas |
| Storefront | **App block** numa página "Create"; widget ≤ 30 KB gz; modelos (vários MB) carregados sob demanda e cacheados | Zero | Peso na etapa de processamento (não no primeiro carregamento) |
| Processamento | **No navegador** (ONNX Runtime Web / Transformers.js; WebGPU, com WASM como fallback) | Zero | Qualidade e velocidade abaixo de API paga |
| Backend | **Nenhum na opção A.** Na opção B, **Worker + R2 Free** só para hospedar o PNG aprovado por algumas horas | Zero (dentro do free tier `[unverified]`) | — |
| App Proxy | **Desnecessário na opção A**; volta na opção B | Zero | — |
| Admin API / webhooks | **Desnecessários** (sem `read_orders`, sem `orders/create`) | Zero | Vínculo automático arquivo↔pedido (feito pelo Customily `[unverified: Q5]`) |
| Atribuição | **Atributo de carrinho** (`i2i=1` via Ajax Cart API) + eventos de cliente (Web Pixels) | Zero | Rastreio por arquivo |
| Moderação | Classificador NSFW leve no navegador + **revisão do Igor nos pedidos `i2i`** antes da produção | Zero; custa tempo do Igor | Moderação automática robusta |
| Teste | Loja de desenvolvimento (com Customily, se permitido `[unverified: Q6]`) → página oculta na hellominton | Zero `[unverified]` | — |

### Limites dos free tiers (só relevantes na opção B; todos `[unverified]`)
Workers Free ~100 mil requisições/dia e ~10 ms de CPU por chamada; R2 Free ~10 GB-mês, ~1 M operações classe A e ~10 M classe B/mês, saída de dados gratuita; Workers AI ~10 mil "neurons"/dia (experimento opcional da opção 2). Conta **sem cartão**; alerta a 80% de uso.

### O que cada opção entrega e perde na Fase 0

| Opção | Como funciona | Entrega | Perde vs. API paga |
|---|---|---|---|
| **1. Original, ready to print** | Recorte (BiRefNet-lite, ISNet/U²-Net; **excluídos RMBG-1.4/2.0, não comercial, e @imgly/background-removal, AGPL** `[verificar licenças no G2]`) + upscale 2x–4x (Real-ESRGAN ou similar) no navegador | PNG transparente | Bordas piores em cabelo e fundo confuso; lento no celular; **limite de canvas do iOS (~16,7 MP `[unverified]`)**. O tamanho alvo é o **menor entre** o exigido pelo template do Customily `[Q3]` e o do fornecedor de impressão `[D3]` |
| **2. See 3 cool options** | 3 estilos por shader/canvas (halftone, duotone/posterize, line-art); opcional 1 estilo via Workers AI dentro da cota | Instantâneo, previsível | Não é transformação generativa: é a maior perda de "uau" |
| **3. See 3 Patterns** | Repetição sem IA (grid, half-drop, espelhado) | Emenda invisível garantida | Menos criatividade; produtos de estampa total (all-over) podem exigir áreas maiores `[D3]` |

---

## (b) Integração pós-aprovação com o Customily — opções

**Recomendação:** começar com **A** e **migrar para B** se o Q2 confirmar que o Customily aceita imagem pré-carregada. **C** só na expansão.

| | **A. Entrega do PNG + link para o produto** | **B. Link com a imagem pré-carregada** | **C. Integração pela API do Customily** |
|---|---|---|---|
| Como | Após aprovar: download do PNG + links para produtos Customily (configurados no app block); atributo `i2i=1` no carrinho; o cliente sobe o PNG no Customily | PNG aprovado no R2 com URL assinada curta; o link abre o produto Customily com a imagem já carregada | O servidor cria a personalização via API e devolve o link |
| Depende de | Só o campo de upload existente `[Q3]` | Customily aceitar imagem por URL/injeção `[unverified: Q2]`; copiar vs. referenciar `[Q4]` | API pública e plano que a inclua `[unverified: Q1, Q6]` |
| UX | Atrito: baixar → subir de novo | Fluida | Fluida |
| Backend | Nenhum | Worker + R2 Free (TTL curto) + App Proxy | Worker + credencial da API |
| Custo | Zero | Zero `[unverified]` | Possível custo de plano `[unverified]` |
| Risco | Abandono na passagem | Comportamento não documentado pode quebrar | Lock-in, custo |

### O que deixa de ser necessário ou muda (com o Customily)

| Item | Situação |
|---|---|
| Seletor de produto e mockup 2D próprios | **Saem.** Ficam links para produtos Customily e o preview do Customily |
| `_i2i_asset_id` no carrinho | **Sai.** Vira o atributo `i2i=1`, só para atribuição |
| `read_orders` + `orders/create` | **Saem** em A e B |
| Entrega à produção por URL assinada | **Sai.** Customily → Printful/Gelato `[unverified: Q5, Q10]` |
| Retenção do nosso lado | A: nada. B: ≤ 24 h, salvo se o Customily referenciar a URL `[Q4]` |
| Privacidade (D5) | Muito simplificada. Em A, nenhum dado pessoal passa por nós. Operadores da hellominton: Customily + Printful ou Gelato; conferir se a política de privacidade cita ambos `[data needed]` |

---

## (c) D3 — Specs de impressão: o que conferir em Printful e Gelato

Nenhum número abaixo foi verificado. **Não preencher com valores de memória.** A fonte deve ser a documentação/template oficial de cada fornecedor **para cada produto escolhido**, com link e data, e o resultado registrado aqui antes do build.

| Item a conferir | Printful | Gelato | Por que importa para o app |
|---|---|---|---|
| **Formatos de arquivo aceitos** (PNG, JPG, PDF etc.) | `[unverified]` | `[unverified]` | Define o formato de exportação do widget |
| **PNG com fundo transparente** aceito e respeitado na impressão (DTG, sublimação, bordado tratam a transparência de formas diferentes) | `[unverified]` | `[unverified]` | A opção 1 promete fundo transparente; em técnicas como sublimação de caneca, o transparente pode virar branco `[unverified]` |
| **DPI recomendado/mínimo** | `[unverified]` | `[unverified]` | Teto de upscale e aviso de resolução mínima na entrada |
| **Dimensões em px da área de impressão por produto** (camiseta frente, caneca, poster, all-over) | `[unverified]` por produto | `[unverified]` por produto | Tamanho alvo da exportação; compatibilidade com o limite de canvas do iOS |
| **Tamanho máximo de arquivo** | `[unverified]` | `[unverified]` | Compressão do PNG; peso do download no celular |
| **Perfil de cor** (sRGB etc.) | `[unverified]` | `[unverified]` | Conversão no export |
| **Margem de sangria / zona segura** (especialmente patterns e all-over) | `[unverified]` | `[unverified]` | Composição da opção 3 |
| **Como o arquivo chega do Customily ao fornecedor**: integração nativa, via app Shopify do fornecedor lendo o pedido, ou envio manual | `[unverified]` | `[unverified]` | Decide se a produção é automática ou se o Igor transfere arquivos à mão |
| **Integração com Shopify** (app oficial, sincronização de produtos/pedidos, convivência com produtos personalizados pelo Customily) | `[unverified]` | `[unverified]` | Sem conflito entre os dois apps no mesmo produto |
| **Gerador de mockup/validador de arquivo gratuito** para testar o PNG antes de vender | `[unverified]` | `[unverified]` | Teste de custo zero no estágio 2 |
| **Cobertura de produção/entrega nos mercados da hellominton** | `[unverified]` | `[unverified]` | Prazo e custo de frete (critério de escolha, não de engenharia) |

**Critério de escolha recomendado (Igor decide):** (1) integração automática Customily → fornecedor sem trabalho manual; (2) suporte real a PNG transparente nos produtos-alvo; (3) catálogo e preço dos produtos; (4) prazo e frete nos mercados da loja. A engenharia é praticamente indiferente entre os dois, **desde que o critério 1 seja atendido**.

---

## (d) Estágios do pipeline, gates e roteamento

| # | Estágio | Líder de pod (R) | Especialistas que ENTRAM | Ficam DE FORA (motivo) | Gate de saída |
|---|---|---|---|---|---|
| 0 | **Decisões do Igor** | Head | — | — | **G0**: D1 ✔ D2 ✔ D8 parcial ✔✔; pendentes: Printful vs. Gelato, produtos/preços, Q1–Q12 |
| 1 | **Fluxo e UX:** upload, 3 escolhas, espera do processamento local, aprovação, passagem ao Customily | `creative-direction` | ux-architect, ui-designer, motion-designer (carregamento), ux-research (5 testes, incluindo baixar e subir no Customily pelo celular) | design-system-engineer, sound-designer | **G1 — Head** + Igor |
| 2 | **Teste técnico:** modelos no navegador (iPhone, Android médio, desktop) + **PNG de teste validado no upload do Customily e no gerador de mockup/validador do fornecedor escolhido** (custo zero) + viabilidade da opção B | `engineering-lead` | ai-engineer, creative-technologist, system-performance, backend-integration (só a investigação da opção B) | mobile-crossplatform | **G2 — Head** com evidência; Igor avalia 20 imagens reais (linha de base) |
| 3 | **Experiência interativa:** drag-drop, progresso honesto, galeria, antes/depois, transição para o produto | `experience-director` | micro-interaction, interactive-dataviz (antes/depois), creative-technologist (shaders/patterns) | scroll-motion, gamification, dynamic-content, 3d-immersive | **G3 — experience-director** |
| 4 | **Build Fase 0:** app block, processamento local, exportação no spec D3 + Customily, atributo `i2i`, links de produto; opção B só se o Q2 confirmar | `engineering-lead` | frontend-multistack, ai-engineer, creative-technologist, system-performance, devops-deploy; backend-integration só se B | mobile-crossplatform | **Começa com: fornecedor escolhido + produtos/preços + D3 preenchida + Q3 + Q7.** **G4**: pedido de teste completo, do upload até o pedido chegar ao fornecedor (ou à fila de produção dele) |
| 5 | **Conteúdo e medição:** microcopy, termos, eventos (upload → opção → aprovado → download/clique no produto → carrinho com `i2i` → pedido) | `growth-lead` | analytics-growth (Web Pixels e ShopifyQL), content-seo (microcopy) | — | **G5**: painel dos gatilhos da seção (f) |
| 6 | **Auditoria independente (obrigatória)** | `quality-lead` (reporta ao Head) | audit-code, audit-design, security-privacy, qa-cross-browser (iOS/Android, download e reupload no Customily, checkout), ai-security-review (licenças, moderação) | nenhum | **G6**: zero P0/P1. **Nunca pulado.** |
| 7 | **Lançamento Fase 0:** página oculta na hellominton.com, 4–6 semanas | `engineering-lead` + `growth-lead` | devops-deploy, analytics-growth | — | **G7 — Igor** |

**Paralelismo:** os estágios 1 e 2 podem começar já; no estágio 2, o teste de modelos não depende do fornecedor. O 4 depende de 2, 3 e dos itens listados no gate.

---

## (e) Decisões pendentes, perguntas e riscos

| ID | Status | Decisão | Recomendação |
|---|---|---|---|
| D1, D2 | **Decididas** | — | — |
| **D8** | **Parcial: falta escolher Printful ou Gelato + lista de produtos/preços** | — | Escolher pelo critério da seção (c) |
| **D3** | Pendente (segue a D8 e o Q3) | Specs de impressão | Preencher a tabela da seção (c) com fonte oficial |
| D4 | Adiada para a Fase 1 | Fornecedor de IA pago | — |
| D5 | Pendente, simplificada | Privacidade | Política cita Customily + fornecedor de impressão |
| D6 | Pendente | Direitos autorais/moderação | Aceite na aprovação + revisão do Igor nos pedidos `i2i` |
| D7 | Fase 5 | App pública | — |
| D9 | Praticamente eliminada | Retenção do nosso lado | A: nada; B: ≤ 24 h |
| D10 | Pendente | Integração com o Customily | A agora; B se o Q2 permitir |

### Perguntas para o Igor

**Customily (anteriores):**
- **Q1:** qual plano do Customily a loja usa? Inclui API?
- **Q2:** aceita imagem pré-carregada por URL ou por JavaScript no site?
- **Q3:** formatos, tamanho máximo, resolução e DPI do campo de upload por template?
- **Q4:** copia a imagem ou referencia a URL? Por quanto tempo retém?
- **Q5:** gera o arquivo de produção e o envia ao fornecedor automaticamente?
- **Q6:** há custo por pedido? Dá para instalar em loja de desenvolvimento?
- **Q7:** quais produtos têm upload de imagem livre?

**Impressão (novas):**

| # | Pergunta | Bloqueia |
|---|---|---|
| **Q8** | **Printful ou Gelato?** Já existe conta ativa em algum dos dois conectada à hellominton? | D8, build |
| **Q9** | Quais **produtos** (e técnicas: DTG, sublimação, bordado, all-over) entram na Fase 0, e a que **preço**? | D8, D3 |
| **Q10** | Hoje, como um pedido Customily chega à produção: integração automática com Printful/Gelato, ou o arquivo é enviado à mão? | G4, automação |
| **Q11** | Em quais mercados/países a hellominton vende? (prazo e frete de cada fornecedor; base legal de privacidade) | Escolha do fornecedor, D5 |
| **Q12** | Pode baixar o template oficial dos produtos escolhidos (área de impressão em px/DPI) e compartilhar o link ou o arquivo? | D3 |

### Riscos

| Risco | Prob. | Impacto | Mitigação | Sinal de reversão |
|---|---|---|---|---|
| Abandono na passagem de bastão (A) | Alta | Alto | Instrução clara, link direto, teste no celular; preparar B | Aprovado→carrinho < 60% → B ou C |
| **Customily não integra automaticamente com o fornecedor escolhido (novo)** | Média | Alto | Responder Q10 antes de escolher; preferir o fornecedor com integração automática | Transferência manual de arquivo por pedido |
| **Transparência não respeitada em alguma técnica (ex.: caneca) (novo)** | Média | Médio | Conferir na D3; restringir a opção 1 aos produtos compatíveis | Pedido impresso com fundo indesejado |
| PNG fora do spec do Customily ou do fornecedor | Média | Alto | Q3 + D3 antes do build; validação no G2 | Rejeição > 5% |
| Qualidade do navegador abaixo do padrão de impressão | Alta | Alto | Linha de base no G2; revisão do Igor | Igor reprova > 30% → Fase 1 |
| Celular fraco / limite de canvas iOS | Alta | Médio | Processamento em blocos, WASM, sugestão de desktop | Falha > 10% no mobile |
| Licença de modelo incompatível | Média | Alto | Auditoria no G2 e no G6 | Qualquer NC/AGPL |

---

## (f) Plano de expansão por fases

**Regra geral:** cada fase exige **gatilho medido + aprovação do Igor**, com teto mensal e corte automático. Critério econômico: **custo de IA por pedido ≤ 10% da margem de contribuição** `[premissa; Igor valida a margem, que agora depende do preço de base Printful/Gelato]`. Os números dos gatilhos são propostas iniciais `[premissa]`. Custos de Customily e do fornecedor de impressão são da loja, não do app, e ficam fora destes tetos.

| Fase | O que muda | Gatilho para entrar | Teto mensal (app) |
|---|---|---|---|
| **0 — Teste** | Acima, opção A (ou B) | D8 completa + D3 + Q3/Q7 + G6 | **US$ 0** |
| **0b — Passagem fluida** | A → B (custo zero) ou avaliar C | Aprovado→carrinho < **60%** e Q2 confirma B (ou Q1 confirma C) | US$ 0 (B); C em business case |
| **1 — Qualidade paga mínima (opção 1)** | Workers Paid + API paga de recorte e upscale só no arquivo aprovado | ≥ **300 uploads/mês** e upload→pedido ≥ **2%** e (Igor reprova > **30%** ou falha no mobile > **10%**) | **US$ 50** `[unverified: Workers Paid ~US$5]` |
| **2 — Estilos generativos** | Opção 2 por img2img pago | Opção 2 em ≥ **25%** das sessões e aprovação < metade da opção 1 e custo/pedido ≤ 10% da margem | **US$ 150** |
| **3 — Patterns por IA** | Tile por IA | Patterns ≥ **20%** dos pedidos `i2i` e amostra de 20 aprovada pelo Igor | **+ US$ 100** |
| **4 — Mais produtos** | Novos produtos no Customily + fornecedor (configuração, não código), após conferir a D3 de cada um | ≥ **30 pedidos `i2i`/mês** por 2 meses | ~US$ 0 de app |
| **5 — App público** | Multi-loja, OAuth, billing, webhooks de privacidade obrigatórios; sem depender do Customily nem de um fornecedor específico | ≥ **3 lojistas externos** pedindo + custo/pedido estável por 3 meses + decisão do Igor | Business case próprio; **porta de mão única parcial** |

A revisão dos gatilhos acontece a cada ciclo de 4–6 semanas, com recomendação do Head e decisão do Igor. D1, D2 e D8 serão registradas em `transition-interactive/DECISIONS.md` quando o pipeline for aprovado.
