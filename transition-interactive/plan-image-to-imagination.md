# Plano de pipeline — image-to-imagination (app Shopify)

**Dono:** Head de Produto & Engenharia · **Criado:** 2026-10-11 · **Revisado:** 2026-10-11 (D1 decidida)
**Status:** PROPOSTA. D1 decidida; D2 e demais pendentes no Gate 0.
**Convenção:** `fato` · `estimativa` · `premissa` · `[não verificado]` / `[data needed: X]` = conferir antes de decidir.

---

## 0. Recomendação (resumo)

Construir como **app Shopify custom, instalado só na loja que atende hellominton.com**, sem UI de admin:
**Theme App Extension (app block)** numa página "Create" da loja → **App Proxy** → **backend serverless em Cloudflare Workers + R2 + Queues** → **APIs de imagem de terceiros (ex.: Replicate ou fal.ai)**. Nenhum modelo auto-hospedado, nenhum framework no front.

**Com a D1 decidida, o app deixa de ser gerador de imagem e vira um funil de venda:**
upload → gerar → **cliente aprova uma imagem** → **customiza um produto da hellominton.com** → carrinho → pedido.

A **opção 3 (Patterns)** sai na v1 como **composição determinística**: 3 layouts de repetição sem emenda a partir do recorte da opção 1, **sem chamada de IA**.

**Trade-off sacrificado principal:** controle e custo unitário mínimo de longo prazo (modelos próprios em GPU), trocados por zero infraestrutura de GPU, tempo de lançamento curto e custo proporcional ao uso. Sinal de reversão: custo de API maior que o de GPU reservada por 2 meses seguidos.

---

## Decisões registradas

| ID | Data | Decisão | Fonte |
|---|---|---|---|
| **D1** | 2026-10-11 | **"A imagem gerada, depois de aprovada pelo cliente, pode ser usada para customizar produtos na hellominton.com."** | Igor, mensagem direta repassada pelo coordenador |

**Loja de instalação:** a premissa é que hellominton.com é a loja Shopify onde o app será instalado. Não consegui confirmar a partir deste repositório: não há menção a hellominton.com nem acesso à loja nesta sessão. Status: `[data needed: Igor confirmar que hellominton.com roda em Shopify e é a loja de instalação; domínio *.myshopify.com e plano]`.

---

## (a) Stack, arquitetura e formato Shopify

| Camada | Decisão | Por que é leve | Trade-off sacrificado | Alternativa rejeitada |
|---|---|---|---|---|
| Distribuição | **App custom** (só a loja hellominton) | Sem revisão da App Store, sem billing API, sem multi-tenant | Revenda a outros lojistas | App pública |
| Storefront | **Theme App Extension, app block** numa página dedicada "Create" (e, opcionalmente, nos produtos customizáveis) | Carrega só onde o bloco é colocado; assets servidos pelo CDN da Shopify | Presença global no site | **App embed** (script em todas as páginas) |
| Front do widget | **JS vanilla (ou Preact ≤ 4 KB)**, Web Components, tokens do tema; orçamento **≤ 30 KB gz** sem contar imagens | Zero framework, zero impacto fora da página do bloco | Velocidade de um framework completo | React/Remix no storefront |
| Admin | **Nenhuma UI na v1.** **Mudou com a D1:** o app precisa de token Admin API com escopos mínimos (`read_orders`, mais o de webhooks de pedido) para ligar o arquivo aprovado ao pedido | Token do app custom dispensa fluxo OAuth público `[verificar no setup atual do Shopify CLI/Dev Dashboard]` | Painel de gestão para o Igor | Template Remix completo |
| Canal front→back | **App Proxy** (`/apps/i2i/*`) para criar job, consultar status e **aprovar** | Mesmo domínio da loja, requisição assinada (HMAC) | Upload binário pelo proxy | Chamada cross-origin direta |
| Upload | **URL pré-assinada direto para R2** | Sem trafegar MB pelo backend | CORS no bucket | Upload via proxy |
| Backend | **Cloudflare Workers + Queues**; polling de status; webhook do provedor de IA; **webhook `orders/create` da Shopify (novo)** | Sem servidor, paga por uso | sharp/libvips não rodam no Worker | Vercel functions, Cloud Run/Fly com GPU |
| Armazenamento | **R2 privado** com **ciclo de vida por estado do arquivo** (ver retenção abaixo); estado em **D1/KV** | Egress zero `[verificar preço vigente]`; retenção mínima por estado | Histórico permanente | S3 |
| IA de imagem | **API de provedor** (escolha no spike) | Troca de modelo por config | Controle fino | Auto-hospedagem |
| Patterns v1 | **Composição determinística** (grid, half-drop, espelhado) | Custo ~zero, emenda invisível garantida | Criatividade de pattern por IA | Tile por IA na v1 |

### Fluxo "aprovar → customizar produto na hellominton.com" (novo)

1. **Upload** → validação (tipo, tamanho, resolução mínima, moderação) → visitante escolhe a opção 1, 2 ou 3.
2. **Resultados** → preview com marca d'água leve (o arquivo de impressão nunca fica público).
3. **Aprovar:** ação explícita "Use this image", com aceite dos termos (titularidade da imagem + autorização de uso para produção). O arquivo muda de `gerado` para `aprovado`. Só imagens que passaram na moderação podem ser aprovadas.
4. **Customizar produto:** seletor com os produtos customizáveis da hellominton.com (lista definida pelo Igor via settings do bloco ou por uma tag/coleção de produtos) → mockup 2D da imagem sobre o produto → escolha de variante.
5. **Carrinho:** `cart/add` (Ajax Cart API) com propriedades do item: `_i2i_asset_id` (oculta por ter prefixo `_`), mais uma miniatura visível ao cliente. **Nenhuma URL pública do arquivo de impressão vai no carrinho**, só o ID.
6. **Pedido:** o webhook `orders/create` chega ao Worker, que lê o `_i2i_asset_id` e muda o arquivo para `pedido`. O Worker então entrega ao fluxo de produção uma **URL assinada de curta duração** do arquivo de impressão.
7. **Entrega à produção:** depende de como a hellominton produz hoje. `[data needed: fornecedor POD/produção da hellominton (Printful, Printify, Gelato, produção própria) e como ele recebe arquivos customizados por pedido]`. Esta é a maior incógnita técnica remanescente: se o fornecedor só lê uma URL na propriedade do pedido, aceitamos URL assinada com validade mais longa (trade-off: menos privacidade em troca de integração sem código).

### Retenção por estado do arquivo (novo)

| Estado | Retenção recomendada | Motivo |
|---|---|---|
| Upload original e resultados **não aprovados** | Exclusão automática em **24–72 h** | Minimização de dados; não há finalidade depois da sessão |
| **Aprovado sem pedido** (carrinho abandonado) | **14–30 dias**, depois exclusão `[data needed: Igor define; alinhar à vida útil do carrinho]` | Permitir que o cliente finalize a compra |
| **Aprovado com pedido** | Até o fim da janela de troca/reimpressão (ex.: **90 dias após a entrega**), depois exclusão `[data needed: política de trocas da hellominton]` | Produção, reimpressão e disputa |
| Upload original de um pedido | Mesmo prazo do arquivo do pedido, ou excluir logo após gerar o arquivo de impressão | Igor decide; o recomendado é excluir o original cedo |

---

## (b) Estágios do pipeline, gates e roteamento

| # | Estágio | Líder de pod (R) | Especialistas que ENTRAM | Ficam DE FORA (motivo) | Gate de saída |
|---|---|---|---|---|---|
| 0 | **Decisões do Igor** | Head | — | — | **G0 — Igor**: D1 ✔ decidida; pendentes D2–D9 |
| 1 | **Fluxo e UX:** upload, 3 escolhas, espera, **aprovação, seletor de produto e mockup, passagem ao carrinho**, consentimento | `creative-direction` | ux-architect, ui-designer, motion-designer (carregamento e transição para o mockup), ux-research (5 testes rápidos, **incluindo o passo de aprovação**) | design-system-engineer (o widget herda o tema da hellominton), sound-designer | **G1 — Head** + Igor aprova wireframe e microcopy |
| 2 | **Teste de fornecedores de IA** (20 imagens reais) **+ teste da entrega ao fornecedor POD da hellominton** | `engineering-lead` | ai-engineer, creative-technologist, backend-integration (**novo: provar o caminho pedido → arquivo → produção**) | mobile-crossplatform | **G2 — Head** com evidência; Igor escolhe provedor (D4) e confirma o caminho POD (D8) |
| 3 | **Experiência interativa:** drag-drop, progresso, galeria, antes/depois, **mockup do produto** | `experience-director` | micro-interaction, interactive-dataviz (antes/depois), **creative-technologist (mockup 2D sobre o produto, novo)** | scroll-motion, gamification, dynamic-content, 3d-immersive (mockup 3D fica para a v2) | **G3 — experience-director** |
| 4 | **Build:** app block, Worker, R2, Queues, App Proxy, saída POD, patterns, **aprovação, carrinho, webhook de pedido, máquina de estados de retenção, entrega à produção** | `engineering-lead` | frontend-multistack, backend-integration, ai-engineer, creative-technologist, system-performance, devops-deploy | mobile-crossplatform | **G4 — engineering-lead**: **fluxo completo upload → pedido de teste** em loja de desenvolvimento |
| 5 | **Conteúdo e medição:** microcopy, termos de uso, eventos (upload → opção → resultado → **aprovado → no carrinho → pedido**) e custo de IA por pedido | `growth-lead` | analytics-growth, content-seo (microcopy) | — | **G5 — growth-lead**. North Star sugerida: **% de uploads que viram pedido** |
| 6 | **Auditoria independente (obrigatória)** | `quality-lead` (reporta ao Head) | audit-code, audit-design, security-privacy (**vínculo imagem ↔ pedido ↔ dados do cliente**, URLs assinadas, HMAC de proxy e webhook, retenção por estado), qa-cross-browser (iOS/Android/desktop, **carrinho e checkout no tema da hellominton**), ai-security-review | nenhum | **G6 — quality-lead**: zero P0/P1. **Nunca pulado.** |
| 7 | **Lançamento controlado** na hellominton.com com teto diário de custo e monitoramento por 14 dias | `engineering-lead` + `growth-lead` | devops-deploy, analytics-growth | — | **G7 — Igor** aprova produção |

**Paralelismo:** os estágios 1 e 2 correm em paralelo; o 3 depende do 1; o 4 depende do 2 e do 3; o 5 começa junto com o 4; o 6 só começa após o 4 e o 5.
**DACI:** Driver = Head · Approver = Igor (G0, G1, D4, D8, G7) · Contributors = 5 líderes.

---

## (c) Riscos e decisões que dependem do Igor

### Decisões

| ID | Status | Decisão | Recomendação do Head |
|---|---|---|---|
| **D1** | **DECIDIDA 2026-10-11** | Destino da imagem | Imagem aprovada → customização de produtos na hellominton.com (ver fluxo acima) |
| **D2** | **PENDENTE, bloqueia o build** | Teto de custo de IA (mês e sessão) | Teto mensal com corte automático + 3 jobs por sessão + Turnstile. Medir **custo de IA por pedido** desde o dia 1 |
| **D3** | Pendente | Specs POD | Seguir a spec do fornecedor da hellominton; base provisória PNG RGBA sRGB 300 DPI, camiseta ~4500×5400 px `[não verificado]` |
| **D4** | Pendente (após G2) | Fornecedor de IA | Critério: custo × qualidade × termos de dados |
| **D5** | Pendente, **escopo ampliado pela D1** | Privacidade | Ver impacto abaixo; validação por advogado licenciado |
| **D6** | Pendente | Direitos autorais e moderação | Aceite de titularidade **no momento da aprovação**; imagem com alerta de moderação não pode ser aprovada nem ir ao carrinho |
| **D7** | Pendente | App custom vs. pública | Custom |
| **D8** | **Nova, pendente** | Loja e produção: confirmar que hellominton.com é a loja Shopify de instalação; qual fornecedor POD ou produção atende; quais produtos são customizáveis | `[data needed]` sem isso o estágio 4 não fecha a entrega à produção |
| **D9** | **Nova, pendente** | Prazos de retenção (aprovado sem pedido; com pedido) | 14–30 dias e 90 dias após a entrega, respectivamente |

### Impacto da D1 em privacidade (D5)

- **A imagem passa a ser ligada a um pedido**, ou seja, a nome, endereço e e-mail do cliente. Ela deixa de ser um dado efêmero anônimo e vira dado pessoal associado a uma pessoa identificada, sobretudo se contiver rostos.
- **Base legal:** os não aprovados ficam sob consentimento e minimização; os aprovados com pedido ficam sob execução de contrato. Conferir com advogado para LGPD, Privacy Act NZ 2020/AU 1988 e leis estaduais dos EUA, conforme os mercados da hellominton `[data needed: mercados atendidos]`.
- **Novos operadores:** o fornecedor POD passa a receber o arquivo, o que exige uma cláusula de tratamento de dados com ele, além da cláusula com o provedor de IA.
- **Direitos do titular:** a exclusão a pedido do cliente precisa apagar os arquivos ligados aos pedidos dele. Implementar os webhooks de privacidade da Shopify (`customers/data_request`, `customers/redact`, `shop/redact`) mesmo sendo app custom, como boa prática `[verificar obrigatoriedade para app custom]`.
- **Política de privacidade da hellominton:** precisa citar o upload, a geração por IA, a retenção por estado e os operadores.

### Riscos principais

| Risco | Prob. | Impacto | Mitigação | Sinal de reversão |
|---|---|---|---|---|
| Custo de IA acima da margem dos produtos | Média | Alto | D2 + custo de IA por pedido; opção 3 sem IA | Custo de IA / margem de contribuição acima do limite do Igor |
| **Fornecedor POD não aceita arquivo por pedido sem URL pública (novo)** | Média | Alto | Testar no estágio 2; URL assinada com validade compatível | Integração exige expor o arquivo publicamente |
| Upscale insuficiente para impressão | Alta | Médio | Resolução mínima na entrada + aviso honesto | > 10% de rejeição na produção |
| Espera longa derruba conversão | Média | Médio | Fila assíncrona, estados de espera desenhados, preview progressivo | Abandono na espera > 40% |
| **Conteúdo infrator ou ilegal chega a pedido (agravado pela D1)** | Média | Alto | Moderação antes da aprovação, aceite de titularidade, revisão manual opcional antes da produção | Qualquer pedido infrator |
| Abuso (bots) | Média | Alto | Turnstile, limite de requisições, TTL | Jobs sem sessão real |
| Upload HEIC no mobile | Média | Médio | Conversão no cliente ou aceitar só JPEG/PNG; QA em iOS real | Erro > 5% no mobile |

**Bloqueio atual:** o build (estágio 4) aguarda **D2** e **D8**. Os estágios 1 e 2 podem começar já.

A D1 será registrada em `transition-interactive/DECISIONS.md` quando o pipeline for aprovado. As demais, à medida que o Igor decidir.
