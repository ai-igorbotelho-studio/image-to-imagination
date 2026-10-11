# Plano de pipeline — image-to-imagination (app Shopify)

**Dono:** Head de Produto & Engenharia · **Data:** 2026-10-11 · **Status:** PROPOSTA, pendente aprovação do Igor (Gate 0)
**Convenção:** `fato` · `estimativa` · `premissa` · `[não verificado]` = conferir antes de decidir.

---

## 0. Recomendação (resumo)

Construir como **app Shopify custom (instalado só na loja do Igor), sem UI de admin**:
**Theme App Extension (app block)** no storefront → **App Proxy** → **backend serverless em Cloudflare Workers + R2 + Queues** → **APIs de imagem de terceiros (ex.: Replicate ou fal.ai)**. Nenhum modelo auto-hospedado, nenhum framework no front, nenhum banco relacional na v1.

A **opção 3 (Patterns)** sai na v1 como **composição determinística** (3 layouts de repetição sem costura a partir do recorte da opção 1), **sem chamada de IA** — custo marginal ~zero e seamless garantido. Patterns gerados por IA ficam para a v2 se os dados pedirem.

**Trade-off sacrificado principal:** controle e custo unitário mínimo de longo prazo (modelos próprios em GPU) — trocados por zero infraestrutura de GPU, tempo de lançamento curto e custo proporcional ao uso. Revisar quando o volume tornar a API mais cara que GPU dedicada (sinal de reversão: custo de API > custo de GPU reservada por 2 meses seguidos).

---

## (a) Stack, arquitetura e formato Shopify

| Camada | Decisão | Por que é leve | Trade-off sacrificado | Alternativa rejeitada |
|---|---|---|---|---|
| Distribuição | **App custom** (só a loja do Igor) | Sem revisão da App Store, sem billing API, sem multi-tenant | Revenda a outros lojistas — exige refazer como app pública depois | App pública na App Store (custo de review/compliance agora sem demanda validada) |
| Storefront | **Theme App Extension — app block** em página dedicada/produto | Carrega só onde o lojista coloca o bloco; Shopify serve os assets via CDN; editável no theme editor sem tocar no tema | Presença global no site | **App embed** (script em todas as páginas = peso global; só se no futuro precisar de botão flutuante) |
| Front do widget | **JS vanilla (ou Preact ≤ 4 KB)**, Web Components, CSS herdando tokens do tema; orçamento **≤ 30 KB gz** total | Zero framework, zero impacto em LCP fora da página do bloco | Velocidade de desenvolvimento de um framework completo | React/Remix no storefront |
| Admin | **Nenhuma UI na v1**; configurações (estilos, textos) via settings do app block | Remove OAuth/Admin UI/Polaris do escopo | Painel de gestão para o Igor | Template Remix/React Router do Shopify CLI completo `[verificar se extensão-only + app proxy dispensa backend OAuth no setup atual do CLI]` |
| Canal front→back | **App Proxy** (`/apps/i2i/*`) para criar job e consultar status | Mesmo domínio da loja (sem CORS), requisição assinada (HMAC) pelo Shopify | Upload binário pelo proxy (limites de tamanho/timeout) | Chamada direta cross-origin ao Worker (CORS + endpoint público sem assinatura) |
| Upload | **URL pré-assinada direto para R2** (o arquivo não passa pelo proxy nem pelo Worker) | Sem trafegar MB pelo backend | Uma configuração de CORS no bucket | Upload via App Proxy |
| Backend | **Cloudflare Workers + Queues** (orquestração assíncrona; polling de status pelo widget; webhook do provedor de IA) | Sem servidor, sem cold start relevante, paga por uso | Bibliotecas nativas de imagem (sharp/libvips não rodam no Worker) — processamento pesado vai ao provedor ou ao navegador | Vercel/Netlify functions (timeout curto p/ jobs de 30–90 s), Cloud Run/Fly com GPU (ops + custo fixo) |
| Armazenamento | **R2** com **regra de ciclo de vida (ex.: apagar em 24–72 h)**; estado do job em **KV/D1** mínimo | Egress zero no R2 `[verificar preço vigente]`; TTL cumpre minimização de dados | Histórico permanente das criações | S3 (egress pago) |
| IA de imagem | **API de provedor de modelos** (ex.: Replicate, fal.ai) — escolha final pelo spike da etapa 2 | Troca de modelo = troca de parâmetro, não de infra | Controle fino e custo unitário mínimo | Modelos auto-hospedados |
| Patterns v1 | **Composição determinística** (grid, half-drop, espelhado) a partir do recorte com fundo transparente; render em canvas no navegador ou no provedor | Custo ~zero, latência baixa, seamless garantido | "Criatividade" de um pattern gerado por IA | Geração de tile por IA na v1 |

**Fluxo técnico (alto nível):**
`UPLOAD` → widget pede URL pré-assinada (App Proxy → Worker) → envia ao R2 → Worker valida (tipo, tamanho, resolução mínima, moderação) → visitante escolhe 1/2/3 → Worker enfileira job → provedor processa (webhook) → Worker normaliza saída (PNG RGBA, sRGB, dimensões alvo, 300 DPI nos metadados) → widget faz polling e mostra preview com marca d'água leve → download / adicionar ao carrinho (depende da decisão D1).

Por opção:
1. **Original, ready to print:** remoção de fundo → upscale (2–4x) → PNG transparente nas dimensões alvo. Bloquear/avisar se a entrada é pequena demais (upscale não inventa detalhe: `fato`).
2. **See 3 cool options:** 3 gerações image-to-image em estilos fixos e curados (prompts versionados pelo ai-engineer) → remoção de fundo → upscale. Custo ≈ 3x a opção 1 + 3 gerações.
3. **See 3 Patterns:** reaproveita o recorte da opção 1 → 3 layouts de repetição → exportação no tamanho de impressão all-over.

---

## (b) Estágios do pipeline, gates e roteamento

| # | Estágio | Líder de pod (R) | Especialistas que ENTRAM | Ficam DE FORA (motivo) | Gate de saída (quem aprova) |
|---|---|---|---|---|---|
| 0 | **Decisões do Igor** (seção c) | Head | — | — | **G0 — Igor** aprova D1–D7 |
| 1 | **Fluxo e UX** — 1 upload, 3 escolhas, estados de espera (10–90 s é o momento crítico de UX), erro, consentimento | `creative-direction` | ux-architect, ui-designer, motion-designer (só loading/transição), ux-research (5 testes de guerrilha com o protótipo) | design-system-engineer (um widget herda tokens do tema), sound-designer (sem áudio em loja) | **G1 — Head** + Igor aprova wireframe e microcopy |
| 2 | **Spike técnico / bake-off de provedor** — 20 imagens de teste reais × 2–3 provedores; mede custo/run, latência p95, qualidade de recorte e upscale contra a spec POD | `engineering-lead` | ai-engineer, creative-technologist, backend-integration | mobile-crossplatform (web responsivo basta), devops-deploy (entra no 4) | **G2 — Head** com evidência (tabela custo × latência × qualidade); **Igor** escolhe provedor (D4) |
| 3 | **Experiência interativa** — upload drag-drop, progresso honesto, galeria de 3 resultados, antes/depois do upscale | `experience-director` | micro-interaction, interactive-dataviz (só o slider antes/depois da opção 1) | scroll-motion, gamification, dynamic-content (sem conteúdo narrativo/listas), 3d-immersive (mockup 3D de caneca/camiseta = peso; v2 com mockup 2D se dados pedirem) | **G3 — experience-director** (craft) |
| 4 | **Build** — app block + Worker + R2 + Queues + App Proxy + normalização de saída POD + patterns | `engineering-lead` | frontend-multistack, backend-integration, ai-engineer (prompts versionados dos 3 estilos), creative-technologist (motor de patterns), system-performance (orçamento ≤ 30 KB gz, zero impacto fora da página), devops-deploy (ambientes dev/prod, segredos, loja de desenvolvimento, alerta de orçamento) | mobile-crossplatform | **G4 — engineering-lead**: testes passando em loja de desenvolvimento, orçamento de performance cumprido |
| 5 | **Conteúdo e medição** — microcopy final, termos de uso de imagem, eventos de funil (upload → opção → resultado → download/carrinho) e custo de IA por conversão | `growth-lead` | analytics-growth, content-seo (só microcopy/a11y de texto e página do app; SEO é marginal num widget) | — | **G5 — growth-lead**: plano de medição com North Star definida (sugestão: % de uploads que viram item no carrinho) |
| 6 | **Auditoria independente (obrigatória)** | `quality-lead` (reporta ao Head) | audit-code, audit-design, security-privacy (URLs pré-assinadas, HMAC do proxy, TTL, LGPD/Privacy Acts), qa-cross-browser (iOS Safari: HEIC e upload pela câmera; Android; desktop), ai-security-review (moderação de conteúdo, abuso/DoS de custo, termos de dados do provedor) | nenhum — todos entram | **G6 — quality-lead**: zero P0/P1 abertos. **Nunca pulado.** |
| 7 | **Lançamento controlado** — loja de dev → produção com teto diário de custo, 1 página, monitoramento 14 dias | `engineering-lead` (devops-deploy) + `growth-lead` | devops-deploy, analytics-growth | — | **G7 — Igor** aprova ir para produção; revisão de dados no dia 14 |

**Paralelismo:** 1 e 2 correm em paralelo (UX não depende do provedor; o spike não depende do layout). 3 depende de 1; 4 depende de 2 e 3; 5 começa junto com 4; 6 só após 4 e 5.

**DACI resumido:** Driver = Head · Approver = Igor (G0, G1, D4, G7) · Contributors = 5 líderes · Informed = CEO Active Transition (se houver vínculo de marca).

---

## (c) Riscos e decisões que dependem do Igor

### Decisões (G0)

| ID | Decisão | Recomendação do Head | Por que importa |
|---|---|---|---|
| **D1** | **O que acontece depois da imagem?** Download grátis, download pago, ou vira produto POD no carrinho (integração Printful/Printify/Gelato)? | v1 = **adicionar ao carrinho** de 2–3 produtos POD já existentes, com a URL do arquivo como propriedade do item; download livre só de preview com marca d'água | Define se o app gera receita ou só custo. **É a decisão que mais muda a arquitetura** — sem ela o plano não fecha |
| **D2** | **Teto de custo de IA** por mês e por sessão | Teto mensal com corte automático + limite por visitante (ex.: 3 jobs/sessão) + CAPTCHA invisível (Turnstile) | Opção 2 custa ~3–4x a opção 1; sem teto, um bot vira fatura |
| **D3** | **Specs POD** (DPI, dimensões por produto, modelo de cor) | Adotar a spec do fornecedor POD escolhido; base provisória: PNG RGBA sRGB, 300 DPI, camiseta ~4500×5400 px `[não verificado — confirmar no template do fornecedor]` | Arquivo fora da spec = devolução/reimpressão |
| **D4** | **Fornecedor de IA** | Escolher após o spike (G2), pelo critério custo/run × qualidade × termos de dados (sem treino com imagens do usuário, retenção curta, região) | Lock-in e privacidade |
| **D5** | **Privacidade** — mercados atendidos (LGPD; Privacy Act NZ 2020/AU 1988; leis estaduais EUA), consentimento no upload, retenção | Consentimento explícito no upload, retenção de 24–72 h com exclusão automática, nada de conta/login, aviso na política de privacidade; validação por advogado licenciado | Upload pode conter rostos, menores, dados pessoais |
| **D6** | **Direitos autorais e conteúdo** — imagens de terceiros, marcas, personagens, nudez | Termos de uso com declaração de titularidade + moderação automática do provedor + bloqueio de impressão em caso de flag | Imprimir conteúdo infrator expõe a loja; o fornecedor POD pode suspender a conta |
| **D7** | **App custom vs. pública** | Custom agora; pública só com demanda validada | Mudar depois custa reescrever OAuth/billing |

### Riscos principais

| Risco | Prob. | Impacto | Mitigação | Sinal de reversão |
|---|---|---|---|---|
| Custo de API acima da receita | Média | Alto | D2 + medir custo por conversão desde o dia 1; opção 3 sem IA | Custo IA / receita do app > limite definido pelo Igor |
| Qualidade de upscale insuficiente para impressão (entrada pequena) | Alta | Médio | Resolução mínima na entrada + aviso honesto ao visitante | > 10% de rejeição pelo fornecedor POD |
| Latência longa (30–90 s `estimativa`) derruba conversão | Média | Médio | Fila assíncrona + estados de espera desenhados (G1/G3) + preview progressivo | Abandono na espera > 40% |
| Abuso (bots, conteúdo ilegal) | Média | Alto | Turnstile, rate limit, moderação, TTL | Picos de jobs sem sessão real |
| Mudança de preço/termos do provedor | Média | Médio | Adaptador de provedor isolado (troca por config) | Aumento de preço > 30% |
| HEIC/upload móvel falhando | Média | Médio | Conversão no cliente ou aceitar só JPEG/PNG; QA em iOS real (G6) | Erro de upload > 5% no mobile |

**Bloqueio atual:** sem D1 e D2 o build (estágio 4) não começa. Os estágios 1 e 2 podem começar já, porque não dependem delas.

As decisões do Igor serão registradas em `transition-interactive/DECISIONS.md` depois de aprovadas. Este plano não é decisão registrada.
