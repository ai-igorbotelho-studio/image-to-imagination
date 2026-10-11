# Estágio 1 — Fluxo e UX do widget image-to-imagination

**Dono:** UX Architect · **Data:** 2026-10-11 · **Status:** PROPOSTA para G1 (Head + Igor)
**Base:** `plan-image-to-imagination.md` (D1, D2 decididas; Fase 0 custo zero; processamento no navegador).
**Convenção:** `fato` · `estimativa` · `premissa` · `[unverified]` / `[data needed: X]`. Sem acesso web nesta sessão: normas WCAG e comportamentos de navegador vêm de conhecimento prévio e estão marcados quando incertos.
**Padrão de UX escolhido (pelo objetivo):** assistente linear de passo único por tela (wizard curto), não galeria livre. Objetivo do conteúdo = levar uma foto a um pedido em poucos toques, com espera longa e decisão de consentimento no meio. Trade-off nomeado: menos exploração (voltar e comparar é possível, mas secundário) em troca de menos abandono e menos erro em celular.

---

## 1. Mapa de telas e estados

```
S0 Início ──upload──> S1 Validando arquivo ──ok──> S2 Escolha (3 cards)
                         │ HEIC / formato ruim                │
                         ├─> E2 HEIC/iPhone ─(resolvido)──────┤
                         └─> E1 Arquivo inválido/grande       │
S2 ─Original──┐
S2 ─3 options─┼─> S3 Espera (download do modelo + processamento, 10–90 s)
S2 ─3 Patterns┘       │ cancelar -> S2     │ falha -> E3 Erro de processamento
                      v                     │ lento (>60 s) -> estado S3b
S4 Resultados com marca d'água (1 ou 3 itens; escolher 1)
   │ "Try another option" -> S2
   v
S5 Aprovar + termos/consentimento (checkbox + Turnstile)
   │ falha Turnstile/rede -> E4 ; upload do arquivo aprovado -> S5b "Enviando"
   v
S6 Seletor de produto (produtos da hellominton.com + mockup 2D)
   v
S7 Variante/quantidade -> "Add to cart" -> S8 Carrinho (confirmação + link p/ carrinho)
```

| ID | Estado | Entra quando | Sai para | Observação |
|---|---|---|---|---|
| S0 | Início | Página "Create" carrega | S1 | Só o botão; zero modelo baixado |
| S1 | Validando | Arquivo escolhido/solto | S2, E1, E2 | Lê tipo, peso, dimensões localmente |
| S2 | Escolha | Arquivo válido | S3 | 3 cards + miniatura do arquivo + "Choose another image" |
| S3 | Espera | Card tocado | S4, E3, S3b | Progresso em etapas honestas; cancelável |
| S3b | Espera longa | >60 s sem concluir | S4, E3, S2 | Oferece continuar, tentar opção mais leve ou usar desktop |
| S4 | Resultados | Processamento ok | S5, S2 | Marca d'água; seleção única |
| S5 | Aprovação + termos | "Approve this one" | S5b, E4 | Checkbox não pré-marcado; Turnstile só aqui |
| S5b | Enviando aprovado | Termos aceitos | S6, E4 | Só o arquivo aprovado sobe ao R2 |
| S6 | Seletor de produto | Aprovado | S7 | Lista vinda das settings do bloco (D8) |
| S7 | Variante | Produto escolhido | S8 | Mockup 2D com a imagem aprovada |
| S8 | Carrinho | "Add to cart" ok | Checkout da loja | Ajax Cart API; `_i2i_asset_id` oculto |
| E1 | Arquivo inválido | Formato/peso/resolução fora | S0 | Mensagem diz o que fazer |
| E2 | HEIC/iPhone | HEIC não decodificável | S1 | Ver 1.1 |
| E3 | Falha de processamento | Memória/WebGPU/WASM falhou | S2 | Sugere opção mais leve ou desktop |
| E4 | Falha de rede/Turnstile | Aprovação ou upload falhou | S5 | Estado preservado, sem reenvio de formulário |

### 1.1 Regra HEIC/iPhone
- `<input type="file">` com `accept="image/jpeg,image/png,image/webp"`: no iOS, o seletor tende a converter HEIC para JPEG ao entregar o arquivo `[unverified: confirmar em iPhone real no G2]`.
- Se ainda chegar HEIC (arquivo `.heic`/`image/heic`, ou tipo vazio): tentar decodificar nativamente (Safari costuma decodificar HEIC `[unverified]`). Se falhar, **carregar sob demanda** um decodificador HEIC em WASM (megabytes, fora dos 30 KB; **verificar licença comercial** — libheif é LGPL `[unverified]`, auditar no G2/G6). Se também falhar, E2 com instrução manual: Ajustes > Câmera > Formatos > "Mais compatível", ou compartilhar a foto como JPEG.
- Nunca enviar o HEIC ao servidor (nada sai do dispositivo antes da aprovação).

### 1.2 Limites de entrada `[premissa, calibrar no G2]`
Máx. 25 MB e 12 MP de entrada; mínimo 800 px no lado maior (abaixo: aviso, não bloqueio). iOS: saída de impressão pode ficar em ~4096 px por limite de canvas `[unverified]`; mostrar aviso de tamanho máximo de impressão no S7 quando o arquivo ficar abaixo da spec do produto.

### 1.3 Marca d'água
Aplicada só no canvas de **preview** (diagonal repetida, "PREVIEW" + hellominton, opacidade ~30%). O arquivo limpo é gerado após aprovação. Fato do desenho: como o processamento é local, a marca d'água é dissuasão fraca, não proteção (ver pergunta Q3).

---

## 2. Wireframes mobile-first (360 px de largura)

Convenção: `[ ]` botão, `(•)` rádio/seleção, `[x]` checkbox, `▓` progresso.

**S0 Início**
```
+----------------------------+
| Create something yours     |
| Turn your photo into a     |
| print-ready design.        |
|                            |
|  [  UPLOAD YOUR IMAGE  ]   |
|  or drop a file here       |
|                            |
| JPG, PNG or WebP · up to   |
| 25 MB · stays on your      |
| device until you approve   |
+----------------------------+
```

**S2 Escolha**
```
+----------------------------+
| [thumb]  photo.jpg         |
| Choose another image       |
|----------------------------|
| What would you like?       |
| +------------------------+ |
| | Original, ready to     | |
| | print                  | |
| | Clean cut-out, sharper | |
| +------------------------+ |
| +------------------------+ |
| | See 3 cool options     | |
| | Three graphic styles   | |
| +------------------------+ |
| +------------------------+ |
| | See 3 Patterns         | |
| | Repeating designs      | |
| +------------------------+ |
+----------------------------+
```
Cards em coluna, altura mínima 64 px, largura total. Cada card é um `<button>` com título + descrição de uma linha.

**S3 Espera**
```
+----------------------------+
| Working on your image...   |
| ▓▓▓▓▓▓░░░░░░  Step 2 of 3  |
| Cutting out the subject    |
| Usually 10 to 90 seconds.  |
| First time is slower: we   |
| download the tools once.   |
|                            |
| [ Cancel ]                 |
+----------------------------+
```
Etapas: 1 "Getting tools ready" (download do modelo; só na 1ª vez), 2 "Processing your image", 3 "Preparing previews". Barra determinada só quando há dado real (bytes baixados, tiles concluídos); caso contrário, indeterminada com texto de etapa. Sem tempo restante falso.

**S4 Resultados (opções 2 e 3: 3 itens; opção 1: 1 item)**
```
+----------------------------+
| Pick your favorite         |
| +------+ +------+ +------+ |
| | (•)A | | ( )B | | ( )C | |
| +------+ +------+ +------+ |
| (preview grande da seleção |
|  com marca d'água)         |
| Preview only. Clean file   |
| after you approve.         |
| [   Approve this one   ]   |
| Try another option         |
+----------------------------+
```
Miniaturas em grupo de rádio, alvo ≥ 44 px.

**S5 Aprovação + termos**
```
+----------------------------+
| One last check             |
| [thumb]                    |
| [ ] I own this image or    |
|     have the right to use  |
|     it, and I allow         |
|     hellominton to print   |
|     it on the products I   |
|     order. Terms · Privacy |
| (Turnstile, se exigido)    |
| [ Approve and continue ]   |
| (desabilitado até [x])     |
| Back to previews           |
+----------------------------+
```

**S6 Seletor de produto**
```
+----------------------------+
| Put it on something        |
| +----------+ +----------+  |
| | mockup   | | mockup   |  |
| | Tote bag | | T-shirt  |  |
| | from $xx | | from $xx |  |
| +----------+ +----------+  |
| (grade 2 colunas, role)    |
+----------------------------+
```
**S7 Variante**
```
+----------------------------+
| < Back     T-shirt         |
| [ mockup 2D grande ]       |
| Size  [S][M][L][XL]        |
| Color (•) White ( ) Black  |
| Qty   [-] 1 [+]            |
| Print area is approximate. |
| [   Add to cart · $xx   ]  |
+----------------------------+
```
**S8 Carrinho**
```
+----------------------------+
| Added to your cart         |
| [thumb] T-shirt · M · x1   |
| [ View cart and checkout ] |
| Make another design        |
+----------------------------+
```
Desktop: mesmo fluxo; S2 em 3 colunas, S4/S6 com preview ao lado da grade (≥ 768 px).

---

## 3. Microcopy (inglês)

| Estado | Texto |
|---|---|
| S0 título/ajuda | "Create something yours" / "Turn your photo into a print-ready design." |
| S0 botão | **UPLOAD YOUR IMAGE** |
| S0 nota | "JPG, PNG or WebP, up to 25 MB. Your image stays on your device until you approve it." |
| S1 | "Checking your image..." |
| S2 título | "What would you like?" |
| S2 cards | "Original, ready to print" — "A clean cut-out, sharpened for print." · "See 3 cool options" — "Three graphic styles to choose from." · "See 3 Patterns" — "Three repeating designs from your image." |
| S2 troca | "Choose another image" |
| S3 | "Working on your image..." / "Usually 10 to 90 seconds." / "First time is slower. We download the tools once." / etapas listadas em 2 / botão "Cancel" |
| S3b | "Taking longer than usual. Your phone is working hard." Botões: "Keep waiting", "Try a lighter option", "Start over". Dica: "A computer is usually faster." |
| S3 concluído (anúncio SR) | "Your previews are ready." |
| S4 | "Pick your favorite" / "Preview only. You get the clean file after you approve." / "Approve this one" / "Try another option" |
| S5 título | "One last check" |
| S5 checkbox | "I own this image or have the right to use it, and I allow hellominton to print it on the products I order. Terms · Privacy" `[texto final depende de D5/D6 e de advogado licenciado]` |
| S5 botão | "Approve and continue" |
| S5 aviso | "Only the image you approve is uploaded. We review each order before printing." |
| S5b | "Saving your approved image..." |
| S6 | "Put it on something" / "From $xx" `[data needed: preços da loja]` |
| S7 | "Print area is approximate." / "Add to cart" |
| S7 aviso de resolução | "Your image may look soft on this size. Try a smaller product or a bigger photo." |
| S8 | "Added to your cart" / "View cart and checkout" / "Make another design" |
| E1 formato | "We can't use this file. Please choose a JPG, PNG or WebP." |
| E1 peso | "This file is too large (over 25 MB). Try a smaller version." |
| E1 baixa resolução (aviso) | "This image is small and may print soft. You can continue or choose another." |
| E2 HEIC | "This looks like an iPhone HEIC photo and we couldn't open it. On iPhone: Settings > Camera > Formats > Most Compatible, or share the photo as JPEG. Then try again." Botão "Choose another image" |
| E3 | "Something went wrong while processing. Try a lighter option or use a computer." Botões "Try again", "Choose another option" |
| E4 | "We couldn't save your image. Check your connection and try again. Your previews are still here." Botão "Try again" |
| Cancelamento | "Cancelled. Your image is still on your device." |

Tom: direto, frases curtas, sem promessa de qualidade ("perfect", "AI magic"); alinhado à regra de provar, não prometer.

---

## 4. Acessibilidade (WCAG 2.2 AA) e peso

### 4.1 Regras de acessibilidade
1. **Teclado (2.1.1, 2.4.3, 2.4.7):** todo fluxo operável sem mouse; ordem lógica; foco visível. **2.4.11:** o foco não pode ficar escondido sob cabeçalho fixo do tema.
2. **Upload sem arrastar (2.5.7):** o botão `UPLOAD YOUR IMAGE` é o caminho principal; drag-and-drop é só atalho.
3. **Alvos (2.5.8):** mínimo 24×24 CSS px; meta do projeto 44 px para botões, cards e miniaturas.
4. **Contraste (1.4.3, 1.4.11):** texto ≥ 4,5:1; bordas de controles, foco e barra de progresso ≥ 3:1. Marca d'água não pode ser a única forma de distinguir preview de final (o texto "Preview only" fica fora do canvas).
5. **Mensagens de status (4.1.3):** região `aria-live="polite"` para progresso por etapa e "previews ready"; erros em `role="alert"`. Não anunciar porcentagem a cada tick (máx. a cada etapa ou ~10 s).
6. **Foco ao trocar de tela:** mover o foco para o título (`h2` com `tabindex="-1"`) de cada estado; ao fechar erro, devolver ao botão de origem.
7. **Alternativas (1.1.1):** cada preview com `alt` descritivo ("Style A: halftone pop-art"); mockups com `alt` ("T-shirt mockup with your design").
8. **Formulário (1.3.1, 3.3.1, 3.3.2, 4.1.2):** checkbox com `<label>` visível e links de Terms/Privacy distinguíveis; erro identifica o campo e o que fazer; botão desabilitado explica por que (texto associado via `aria-describedby`).
9. **Autenticação acessível (3.3.8):** Turnstile no modo não interativo/gerenciado; se pedir desafio, deve haver alternativa sem teste cognitivo `[unverified: conferir comportamento do Turnstile contra 3.3.8]`.
10. **Redundant entry (3.3.7):** voltar de S5 a S4 ou de S7 a S6 preserva seleção e aceite; nada é pedido duas vezes.
11. **Movimento (2.3.3 é AAA, adotado como boa prática):** respeitar `prefers-reduced-motion`; progresso sem animação decorativa. Sem timeout que expire a sessão (2.2.1); a espera é cancelável (2.2.2).
12. **Reflow e zoom (1.4.10, 1.4.4):** sem rolagem horizontal a 320 px e 400% de zoom; texto escalável.
13. **Idioma (3.1.1):** `lang` herdado do tema; widget em inglês, conferir `lang="en"` em trechos se o tema for outro idioma.

### 4.2 Regras de peso
- **Orçamento do widget: ≤ 30 KB gzip** (JS + CSS + ícones inline) para o estado S0 até S2, medido no pacote entregue pela Theme App Extension. `fato do plano`.
- **Fora do orçamento, sempre sob demanda e só após o toque no card:** modelos de recorte/upscale, runtime ONNX/Transformers.js, decodificador HEIC, shaders pesados. Documentar o peso de cada um no G2.
- Sem framework de UI; sem bibliotecas de ícones (SVG inline mínimo); sem fontes próprias (usar as do tema).
- Imagens do seletor (S6) com `loading="lazy"`; miniaturas de mockup em WebP/AVIF vindas do CDN da Shopify.
- **Medição:** build falha se o pacote de S0–S2 passar de 30 KB gz; relatar peso por estágio no G3/G4. Meta de apoio `[premissa]`: S0 interativo em < 2 s em 4G médio.
- Cache: modelos em Cache Storage; avisar quando o download inicial for grande ("tools are about X MB, one time" — `[data needed: peso real dos modelos, G2]`), com opção de cancelar.

---

## 5. Protocolo de 5 testes rápidos de usabilidade (sem recrutar ninguém)

**Premissa:** não há recrutamento. Participantes = pessoas que já estão no entorno do projeto (Igor, familiares/amigos escolhidos pelo Igor, equipe), **nenhum que tenha visto os wireframes**. `[premissa: Igor consegue indicar 5 pessoas; ver Q6]`. Limite honesto: amostra de conveniência não representa o público; serve para achar problemas de fluxo, não para estimar conversão. Cada sessão ~15 min, remota ou presencial, com protótipo clicável ou o build do G3.

**Composição desejada (se possível):** 2 em iPhone, 2 em Android médio, 1 em desktop; ao menos 1 com leitor de tela ou zoom alto `[data needed: quem está disponível]`.

**Roteiro (não induzir; falar o mínimo)**
1. Abertura (1 min): "Estamos testando a página, não você. Pense em voz alta. Não posso ajudar durante a tarefa." Pedir consentimento para anotar/gravar a tela; sem dados pessoais nas notas.
2. Tarefa 1: "Você quer estampar uma foto sua numa camiseta. Mostre como começaria." Observar: acha o botão inicial?
3. Tarefa 2: "Use esta foto" (fornecer 1 JPG normal e, para 1–2 pessoas de iPhone, uma foto HEIC). Observar: entende as 3 escolhas? Qual escolhe e por quê?
4. Tarefa 3: durante a espera (real ou simulada de 45 s): "O que está acontecendo? O que você faria?" Observar: espera, cancela ou abandona?
5. Tarefa 4: "Escolha o resultado de que mais gosta e siga." Observar: entende que é preview? Percebe a marca d'água?
6. Tarefa 5: "Prossiga até colocar no carrinho." Observar: lê o termo? entende o que está aceitando? acha o produto e o mockup?
7. Perguntas finais (3 min, só depois): "Com suas palavras, o que você aprovou?" "O que aconteceria com sua foto?" "Algo confuso ou que te deixou inseguro?" Evitar perguntas de sim/não sobre o desenho.

**Critérios de sucesso (por teste, agregados em 5)**

| Métrica | Sucesso | Falha que exige redesenho |
|---|---|---|
| Acha o botão inicial sem ajuda | 5 de 5 | ≤ 3 de 5 |
| Explica a diferença entre as 3 escolhas com as próprias palavras | ≥ 4 de 5 | ≤ 2 de 5 |
| Não abandona na espera de 45 s simulada | ≥ 4 de 5 | ≥ 2 abandonam |
| Entende que o resultado é preview (marca d'água) | ≥ 4 de 5 | ≤ 2 de 5 |
| Explica corretamente o que aceitou nos termos e para onde vai a foto | ≥ 4 de 5 | ≤ 2 de 5 |
| Chega ao carrinho sem ajuda | ≥ 4 de 5 | ≤ 3 de 5 |
| Erros graves (travou sem saber o que fazer) | 0 | ≥ 2 |
| Tempo da tarefa 1 a 5, sem contar a espera | mediana ≤ 3 min `[premissa]` | > 5 min |

**Registro:** tabela simples por participante (dispositivo, tarefa, sucesso/falha, citação literal, severidade 0–3). Corrigir tudo de severidade 3 e repetir só a tarefa afetada com 2 novas pessoas antes do G1/G3. Resultados vão para o Head; **não** registrar em DECISIONS.md neste estágio.

---

## 6. Perguntas em aberto para o Igor

1. **Q1 (bloqueia o seletor, D8):** hellominton.com roda em Shopify? Quais produtos entram na primeira lista e com quais preços (S6/S7)? `[data needed]`
2. **Q2:** O botão deve ficar fixo na página "Create" oculta, ou também em páginas de produto ("Customize this")? Muda o ponto de entrada de S0.
3. **Q3:** A marca d'água é dissuasão fraca porque tudo roda localmente. Aceita esse risco na Fase 0 (a revisão manual por pedido já existe), ou prefere limitar o preview a baixa resolução também?
4. **Q4:** Texto dos termos (S5): quer um rascunho curto para advogado licenciado revisar (D5/D6), e quem é a "controladora" nomeada (hellominton ou outra entidade)?
5. **Q5:** Pode uma pessoa aprovar sem produto e voltar depois? Hoje o fluxo manda direto ao seletor; o arquivo aprovado sem pedido é retido 14–30 dias (D9).
6. **Q6:** Quem são as 5 pessoas para os testes (idealmente 2 iPhone, 2 Android, 1 desktop), e pode fornecer uma foto HEIC real de iPhone para o teste de E2?
7. **Q7:** Idioma: só inglês na Fase 0, ou o público de hellominton.com exige pt-BR ou outros desde já? (Afeta microcopy e peso.)
8. **Q8:** Para o "cool options" feito por filtro (Fase 0), prefere ver os 3 estilos nomeados ("Pop Art", "Duotone", "Sketch") ou rótulos neutros "Style A/B/C"? Nomes criam expectativa generativa que os filtros não cumprem.
9. **Q9:** Aceita que, em celular fraco, a opção 1 (upscale) seja sugerida apenas no desktop (E3/S3b)?

---

## Próximos passos (para o Head)
- Entregar este spec ao `ui-designer` (vestir) e ao `ux-research` (rodar os 5 testes).
- Insumos que o G2 precisa devolver a este spec: peso real dos modelos, tempos por dispositivo, comportamento de HEIC no iOS, teto de canvas no iOS.
- Itens `[unverified]` acima não devem virar requisito até serem confirmados em dispositivo real.
