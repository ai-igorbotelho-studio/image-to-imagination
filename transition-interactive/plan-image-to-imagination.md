# Plano de pipeline — image-to-imagination (app Shopify)

**Dono:** Head de Produto & Engenharia · **Criado:** 2026-10-11 · **Revisado:** 2026-10-11 (D1 e D2 decididas)
**Status:** PROPOSTA. D1 e D2 decididas; o build depende só da D8.
**Convenção:** `fato` · `estimativa` · `premissa` · `[unverified]` / `[data needed: X]` = conferir antes de decidir. Nesta sessão não houve acesso web: todo número de free tier abaixo vem de conhecimento prévio e está marcado `[unverified]`, para confirmar na página de preços do fornecedor antes do estágio 4.

---

## 0. Recomendação (resumo)

**Fase 0 (teste) com custo zero de infraestrutura e de IA**, depois expansão por fases com gatilhos medidos.

- **Shopify:** app custom com Theme App Extension (app block) numa página "Create" + App Proxy.
- **Backend mínimo:** Cloudflare Workers + R2 no **plano Free, sem cartão de pagamento cadastrado**, para que seja impossível gerar cobrança.
- **Processamento de imagem no navegador do visitante**, com modelos open-source de licença comercial permissiva carregados sob demanda.
  - Opção 1: recorte + upscale por modelo no navegador.
  - Opção 2: 3 estilos por filtros/shaders determinísticos. Experimento opcional: Workers AI dentro da cota gratuita diária.
  - Opção 3: 3 patterns por repetição, sem IA.
- **Efeito colateral positivo:** imagens não aprovadas **nunca saem do dispositivo**. Só o arquivo aprovado sobe ao R2, o que simplifica muito a privacidade (D5).

**Trade-off sacrificado na Fase 0:** qualidade e consistência de resultado. Recorte e upscale são inferiores aos de APIs pagas, os "estilos" são filtros e não transformação generativa, o processamento fica lento em celular fraco e há teto de resolução no iOS. Em troca, custo zero e aprendizado real de demanda antes de gastar. A expansão (seção d) define quando esse trade-off deixa de valer.

---

## Decisões registradas

| ID | Data | Decisão | Fonte |
|---|---|---|---|
| **D1** | 2026-10-11 | **"A imagem gerada, depois de aprovada pelo cliente, pode ser usada para customizar produtos na hellominton.com."** | Igor, mensagem direta repassada pelo coordenador |
| **D2** | 2026-10-11 | **"começar custo 0 só para testar e então fazer um plano de expansão"**. Interpretação: Fase 0 com custo zero, **sem API de IA paga**; gasto só após gatilho da seção (d) e aprovação do Igor por fase | Igor, mensagem direta repassada pelo coordenador |

**Loja de instalação:** a premissa é hellominton.com. `[data needed: Igor confirmar que hellominton.com roda em Shopify e é a loja de instalação; domínio *.myshopify.com]`. Não foi possível verificar neste repositório.

---

## (a) Stack, arquitetura e formato Shopify — Fase 0 (custo zero)

| Camada | Decisão Fase 0 | Custo | Trade-off sacrificado | Alternativa rejeitada |
|---|---|---|---|---|
| Distribuição | **App custom** só na loja hellominton | Zero: app custom não tem taxa `[unverified]` | Revenda a outros lojistas | App pública (Fase 5) |
| Ambiente de teste | **Loja de desenvolvimento** (Partner/Dev Dashboard) para build e QA → depois **página oculta na hellominton.com** para teste com clientes reais | Zero `[unverified]`. Loja de dev só aceita pedidos de teste, então a conversão real só é medida na hellominton | — | Teste só na loja de dev (não mede pedido real) |
| Storefront | **Theme App Extension, app block** numa página "Create"; widget ≤ 30 KB gz | Zero (CDN da Shopify) | Presença global | App embed |
| Modelos no navegador | **Carregados sob demanda** (só depois do upload e da escolha da opção) e cacheados; ONNX Runtime Web / Transformers.js, com WebGPU quando houver e WASM como fallback | Zero de infra; custo em **download para o visitante (vários MB)** `[estimativa]` | Leveza do primeiro carregamento é preservada, a da etapa de processamento não | Processamento no servidor (exige GPU paga) |
| Canal front→back | **App Proxy** apenas para pedir URL de upload, aprovar e registrar | Zero | — | — |
| Backend | **Cloudflare Workers Free**; **sem Queues** (não há job assíncrono no servidor na Fase 0); webhook `orders/create` | Zero dentro do free tier | Fila e processamento no servidor | Vercel/Fly |
| Armazenamento | **R2 Free**, só arquivos **aprovados**; estado em **D1 (banco) Free** ou KV | Zero dentro do free tier | — | S3 |
| Anti-abuso | **Turnstile** (gratuito `[unverified]`) só no momento de aprovar/subir | Zero | — | CAPTCHA pago |
| Moderação | Classificador NSFW leve no navegador + **revisão manual do Igor de cada pedido antes da produção** (viável no volume da Fase 0) | Zero; custa tempo do Igor | Moderação automática robusta | API de moderação paga |
| Domínio/servidor | **Nenhum.** Usa `*.workers.dev` atrás do App Proxy, invisível ao cliente | Zero | URL própria do backend | Domínio pago |

### Limites dos free tiers (todos `[unverified]`, confirmar na página de preços)

| Serviço | Limite gratuito (conhecimento prévio) | Consumo esperado na Fase 0 | Risco |
|---|---|---|---|
| Workers Free | ~100.000 requisições/dia; ~10 ms de CPU por invocação | Poucas chamadas por sessão (URL de upload, aprovação, status) | Baixo. Os 10 ms de CPU impedem processar imagem no Worker, e por isso o processamento fica no navegador |
| R2 Free | ~10 GB-mês de armazenamento; ~1 M operações classe A/mês; ~10 M classe B/mês; egress gratuito | Só aprovados: ~5–15 MB por PNG de impressão `[estimativa]`, cerca de 700–2.000 arquivos retidos | Médio se a retenção for longa (D9). Regra de ciclo de vida obrigatória |
| D1 (banco) Free / KV Free | D1 ~5 GB e ~5 M linhas lidas/dia; KV ~100 k leituras e ~1 k escritas/dia | Metadados de aprovação/pedido | Baixo. KV pode estourar escritas, então preferir D1 |
| Queues | Disponibilidade no plano Free incerta `[unverified]` | **Não usado** na Fase 0 | — |
| Workers AI | ~10.000 "neurons"/dia gratuitos `[unverified]`; modelos img2img (ex.: SD 1.5 img2img) `[unverified]` | Experimento opcional da opção 2 | Cota acaba rápido com imagens. Ao esgotar, cair para os estilos por filtro. **Sem cartão cadastrado = sem cobrança** `[unverified: confirmar que o plano Free recusa em vez de cobrar]` |
| Shopify | Loja de dev gratuita; app custom sem taxa; App Proxy e Theme App Extension sem custo | — | Plano pago da própria hellominton já existe (não é custo do app) |

### O que cada opção entrega e perde na Fase 0

| Opção | Como funciona (custo zero) | Entrega | Perde vs. API paga |
|---|---|---|---|
| **1. Original, ready to print** | Recorte por modelo open-source no navegador (candidatos: BiRefNet-lite, ISNet/U²-Net; **excluir RMBG-1.4/2.0, de licença não comercial, e @imgly/background-removal, AGPL** `[verificar licenças no G2]`) + upscale 2x–4x por Real-ESRGAN ou similar via ONNX/WebGPU | PNG transparente; bom em fotos de contraste claro e ilustrações | Bordas piores em cabelo, transparência e fundo confuso; upscale lento no celular (dezenas de segundos ou mais `[estimativa]`); **iOS Safari tem limite de área de canvas (~16,7 MP `[unverified]`)**, então o arquivo de impressão pode ficar limitado a ~4096 px no lado maior em iPhone, abaixo de ~4500×5400 a 300 DPI; recorte e upscale feitos em blocos (tiles) para caber na memória |
| **2. See 3 cool options** | 3 estilos **determinísticos por shader/canvas** sobre o recorte (ex.: halftone pop-art, duotone/posterize, line-art/sketch); opcional: 1 estilo via Workers AI img2img dentro da cota | Resultado instantâneo, previsível, imprimível, com cara de "efeito gráfico" | Não é transformação generativa ("vira aquarela/anime/3D"). O "uau" é menor, e esta é a maior perda da Fase 0 |
| **3. See 3 Patterns** | Repetição sem IA (grid, half-drop, espelhado/rotacionado) do recorte, em canvas | Patterns com emenda invisível garantida, rápidos | Composição menos criativa que um pattern gerado; mesmo teto de resolução no iOS para impressão all-over |

### Fluxo "aprovar → customizar produto na hellominton.com" (D1, mantido)

1. **Upload** fica **local** no navegador: nada sobe ao servidor.
2. **Processamento local** → preview das opções.
3. **Aprovar:** aceite de termos (titularidade + uso para produção) + Turnstile. **Só então** o arquivo de impressão sobe ao R2 por URL pré-assinada, com estado `aprovado`.
4. **Customizar produto:** seletor de produtos customizáveis (lista via settings do bloco ou tag/coleção) → mockup 2D → variante.
5. **Carrinho:** Ajax Cart API com `_i2i_asset_id` (propriedade oculta) + miniatura. Nenhuma URL pública do arquivo de impressão.
6. **Pedido:** webhook `orders/create` → estado `pedido` → **Igor revisa o arquivo** → entrega à produção por URL assinada.
7. **Entrega à produção:** `[data needed: D8 — fornecedor POD/produção e como recebe arquivo por pedido]`.

### Retenção por estado do arquivo

| Estado | Retenção recomendada |
|---|---|
| Upload e resultados não aprovados | **Nunca saem do dispositivo** na Fase 0 (exceto o experimento opcional com Workers AI, que exige aviso no consentimento) |
| Aprovado sem pedido | 14–30 dias, depois exclusão automática `[D9]` |
| Aprovado com pedido | Até o fim da janela de troca/reimpressão (ex.: 90 dias após a entrega) `[D9]` |

---

## (b) Estágios do pipeline, gates e roteamento

| # | Estágio | Líder de pod (R) | Especialistas que ENTRAM | Ficam DE FORA (motivo) | Gate de saída |
|---|---|---|---|---|---|
| 0 | **Decisões do Igor** | Head | — | — | **G0**: D1 ✔ D2 ✔; **D8 bloqueia o build**; D3, D5, D6 e D9 seguem com os valores recomendados até o Igor dizer o contrário |
| 1 | **Fluxo e UX:** upload, 3 escolhas, **espera de processamento local (download do modelo + execução)**, aprovação, seletor de produto, mockup | `creative-direction` | ux-architect, ui-designer, motion-designer (carregamento), ux-research (5 testes rápidos, **incluindo celular médio**) | design-system-engineer, sound-designer | **G1 — Head** + Igor aprova wireframe e microcopy |
| 2 | **Teste de modelos no navegador:** recorte e upscale em iPhone, Android médio e desktop; mede tempo, memória, peso de download, qualidade, **licença**; teste dos 3 estilos por shader; **teste da entrega ao POD** | `engineering-lead` | ai-engineer, creative-technologist, system-performance (**passa a entrar aqui**: o peso dos modelos decide a viabilidade), backend-integration | mobile-crossplatform | **G2 — Head** com tabela de evidência; Igor avalia a qualidade em 20 imagens reais (vira a linha de base dos gatilhos da seção d) |
| 3 | **Experiência interativa:** drag-drop, progresso honesto do processamento local, galeria, antes/depois, mockup 2D | `experience-director` | micro-interaction, interactive-dataviz (antes/depois), creative-technologist (mockup e shaders de estilo) | scroll-motion, gamification, dynamic-content, 3d-immersive | **G3 — experience-director** |
| 4 | **Build Fase 0:** app block, processamento no navegador, Worker Free, R2/D1 Free, App Proxy, aprovação, carrinho, webhook de pedido, ciclo de vida do R2, **alertas de 80% de uso do free tier** | `engineering-lead` | frontend-multistack, backend-integration, ai-engineer, creative-technologist, system-performance, devops-deploy (conta Cloudflare **sem cartão**) | mobile-crossplatform | **Começa só com D8.** **G4**: fluxo upload → pedido de teste completo na loja de dev |
| 5 | **Conteúdo e medição:** microcopy, termos, eventos (upload → opção → processamento concluído → aprovado → carrinho → pedido), **taxa de falha por dispositivo** | `growth-lead` | analytics-growth (ferramentas gratuitas: eventos do Shopify/Web Pixels, sem analytics pago), content-seo (microcopy) | — | **G5**: painel de gatilhos da seção (d) funcionando |
| 6 | **Auditoria independente (obrigatória)** | `quality-lead` (reporta ao Head) | audit-code, audit-design, security-privacy, qa-cross-browser (**limites de canvas/memória no iOS, WebGPU vs. WASM**, checkout no tema da hellominton), ai-security-review (**licenças comerciais dos modelos**, moderação) | nenhum | **G6**: zero P0/P1. **Nunca pulado.** |
| 7 | **Lançamento Fase 0:** página oculta ou com link restrito na hellominton.com, por 4–6 semanas | `engineering-lead` + `growth-lead` | devops-deploy, analytics-growth | — | **G7 — Igor** aprova produção; ao fim, revisão dos gatilhos |

**Paralelismo:** os estágios 1 e 2 já podem começar, porque não dependem da D8. O 3 depende do 1; o 4 depende do 2, do 3 e da D8; o 5 começa junto com o 4; o 6 só começa após o 4 e o 5.

---

## (c) Decisões pendentes, privacidade e riscos

| ID | Status | Decisão | Recomendação |
|---|---|---|---|
| D1 | **Decidida** | Destino da imagem | Customização na hellominton.com |
| D2 | **Decidida** | Teto de custo | Fase 0 = zero; tetos por fase na seção (d) |
| D3 | Pendente (segue a D8) | Specs POD | Spec do fornecedor; provisório PNG RGBA sRGB 300 DPI `[unverified]` |
| D4 | **Adiada para a Fase 1** | Fornecedor de IA pago | Escolher só quando o gatilho da Fase 1 disparar |
| D5 | Pendente, **simplificada na Fase 0** | Privacidade | Não aprovados não saem do dispositivo; aprovados ligados ao pedido = dado pessoal (execução de contrato); webhooks de privacidade da Shopify; validação por advogado licenciado |
| D6 | Pendente | Direitos autorais/moderação | Aceite na aprovação + revisão manual do Igor por pedido |
| D7 | Pendente (Fase 5) | App pública | Só com o gatilho da Fase 5 |
| **D8** | **PENDENTE, ÚNICO BLOQUEIO DO BUILD** | Loja (hellominton.com em Shopify?), fornecedor POD/produção, produtos customizáveis | `[data needed]` |
| D9 | Pendente | Prazos de retenção | 14–30 dias / 90 dias após a entrega |

| Risco | Prob. | Impacto | Mitigação | Sinal de reversão |
|---|---|---|---|---|
| Qualidade de recorte e upscale no navegador abaixo do padrão de impressão | Alta | Alto | Linha de base no G2; revisão manual do Igor; aviso de resolução mínima | Igor reprova > 30% dos arquivos de pedido → gatilho da Fase 1 |
| Celular fraco trava ou demora demais | Alta | Médio | Processamento em blocos, WASM como fallback, mensagem honesta, sugestão de usar desktop | Falha de processamento > 10% no mobile |
| Teto de canvas no iOS limita o tamanho de impressão | Média | Médio | Exportar no máximo suportado; limitar os produtos grandes ao desktop | Pedidos de produto grande vindos de iPhone com arquivo abaixo da spec |
| Licença de modelo incompatível com uso comercial | Média | Alto | Auditoria de licença no G2 e no G6 | Qualquer modelo NC/AGPL no bundle |
| Free tier muda ou é excedido | Baixa | Médio | Conta sem cartão; alerta a 80%; degradação controlada | Alerta de 80% por 3 dias seguidos → gatilho de expansão |
| Filtros não convencem como "3 cool options" | Alta | Médio | Medir taxa de escolha e de aprovação da opção 2 | Ver gatilho da Fase 2 |

---

## (d) Plano de expansão por fases

**Regra geral:** cada passagem de fase exige **gatilho medido + aprovação do Igor**. Cada fase tem teto mensal com corte automático. Critério econômico transversal: **custo de IA por pedido ≤ 10% da margem de contribuição do produto** `[premissa: Igor valida a margem]`. Os números dos gatilhos são **propostas iniciais** `[premissa]`, a recalibrar com os dados da Fase 0.

| Fase | O que muda | Gatilho para entrar (todos medidos) | Teto de custo mensal (app) | Reversível? |
|---|---|---|---|---|
| **0 — Teste** | Tudo acima | D8 resolvida + G6 aprovado | **US$ 0** (conta sem cartão) | Sim |
| **1 — Qualidade paga mínima (opção 1)** | Workers Paid (para ter Queues e mais CPU) + **API paga de recorte + upscale** só para **arquivos aprovados** (a prévia segue no navegador; paga-se só o que vira pedido ou aprovação); escolher D4 | ≥ **300 uploads/mês** **e** upload→pedido ≥ **2%** **e** (Igor reprova > **30%** dos arquivos de pedido **ou** falha no mobile > **10%**) | **US$ 50** `[unverified: Workers Paid ~US$5/mês + API]` | Sim (volta ao navegador) |
| **2 — Estilos generativos (opção 2 por IA)** | 3 estilos img2img por API paga, gerados sob demanda | Opção 2 escolhida em ≥ **25%** das sessões **e** aprovação da opção 2 < **metade** da opção 1 (sinal de que o filtro não convence) **e** custo de IA por pedido ≤ 10% da margem na Fase 1 | **US$ 150** | Sim |
| **3 — Patterns por IA** | Tile gerado por IA + composição | Patterns ≥ **20%** dos pedidos via app **e** Igor aprova uma amostra de 20 patterns de IA como superiores aos determinísticos | **+ US$ 100** (acumulado US$ 250) | Sim |
| **4 — Mais produtos POD** | Novos produtos customizáveis, mockups por produto | ≥ **30 pedidos/mês** via app por 2 meses seguidos **e** fornecedor POD suporta os novos produtos com a mesma integração | ~US$ 0 de app (custo é de catálogo/mockup) | Sim |
| **5 — App público (App Store)** | Multi-loja, OAuth completo, billing API, webhooks de privacidade obrigatórios, revisão da Shopify | ≥ **3 lojistas externos** pedindo o app **e** Fases 1–2 com custo de IA por pedido estável ≤ 10% da margem por 3 meses **e** decisão estratégica do Igor | A definir em business case próprio (desenvolvimento + suporte) | **Porta de mão única parcial**: compromisso público de suporte e compliance |

**Monitoramento contínuo (custo zero):** o painel do estágio 5 reporta, toda semana, volume de uploads, upload→pedido, taxa de reprovação do Igor, falha por dispositivo e uso do free tier. A revisão dos gatilhos acontece ao fim de cada ciclo de 4–6 semanas, com recomendação do Head e decisão do Igor.

A D1 e a D2 serão registradas em `transition-interactive/DECISIONS.md` quando o pipeline for aprovado.
