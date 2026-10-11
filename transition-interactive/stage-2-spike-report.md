# Estágio 2 — Relatório do teste técnico (spike) no navegador, custo zero

**Dono:** Engineering Lead · **Data:** 2026-10-11 · **Status:** PARCIAL. Desktop (Chromium headless) e emulação móvel medidos; **iPhone Safari real e Android médio NÃO medidos** (roteiro na seção 9).
**Convenção:** `medido` (rodei aqui) · `fato` (verificado em fonte nesta sessão) · `estimativa` · `[unverified]` (conhecimento prévio, conferir) · `[não medido]`.
**Escopo respeitado:** nenhuma conta criada, nada pago, loja não tocada, `DECISIONS.md` não alterado. Só downloads públicos gratuitos.

## 0. Resumo

1. **Recorte de fundo é viável no navegador com licença comercial limpa.** Melhor resultado: **ISNet general-use fp16 (84 MB, Apache-2.0 na origem)**. Fallback leve: **U²-Netp (4,4 MB, Apache-2.0)**. `medido`
2. **BiRefNet-lite (MIT) NÃO roda** no ONNX Runtime Web (WASM) nem em desktop com 16 GB: `std::bad_alloc` na entrada fixa de 1024 px. Só vale re-testar com WebGPU em GPU real. `medido`
3. **Upscale por modelo é lento demais em WASM para o tamanho de impressão.** Real-ESRGAN compacto x4 (4,9 MB, BSD-3-Clause): ~200 s por megapixel de origem no desktop; ~850 s/MP com CPU 4x mais lenta. Chegar a 4500×5400 por modelo levaria **~5 min no desktop e ~20+ min no celular** `estimativa` a partir do medido. Swin2SR (Apache-2.0) é ainda pior (~460–700 s/MP). `medido`
4. **Teto no iPhone:** canvas de ~16,7 MP `[unverified]` limita a ~3739×4487 px (83% do alvo, ~249 DPI em 15×18 pol) sem exportação por faixas. O desktop aloca até 16384×16384 `medido` (Chromium).
5. **Filtros e patterns em canvas são triviais de performance:** 16–26 ms por estilo em 360×450 e 32–45 ms por pattern 2000×2000 `medido`.
6. **Recomendação Fase 0:** ISNet fp16 como padrão, U²-Netp de fallback, **sem upscale por modelo como caminho padrão** (upscale por canvas de alta qualidade + aviso de DPI; Real-ESRGAN só como botão opcional "Melhorar", só desktop). Detalhes na seção 7.

## 1. Ambiente do teste (limites da medição)

| Item | Valor |
|---|---|
| Navegador | Chromium 141 headless (`/opt/pw-browsers/chromium`), Linux x64, 4 vCPU, 16 GB RAM, `crossOriginIsolated=true` (threads WASM ativas) |
| Runtime | onnxruntime-web **1.30.0** (MIT), backend WASM. WebGPU: o adaptador existe (software/SwiftShader), **sem GPU real**, então **WebGPU `[não medido]`** |
| "Móvel" | Emulação Chromium: viewport iPhone 13 + `CPU throttle 4x` (CDP). **É Chromium, não WebKit.** Serve só como ordem de grandeza de CPU lenta; **não substitui iPhone/Android real** |
| Rede | Modelos lidos do disco local: o tempo de carga **não inclui download**. Download estimado = peso ÷ banda `estimativa` (84 MB a 20 Mbps ≈ 34 s) |
| Memória | `performance.memory.usedJSHeapSize` (heap JS). **Não captura a memória WASM nem o RSS do processo** `[limite da medição]`; o pico real é maior |
| Imagens de teste | 4 fotos de bancada baixadas de um dataset público de exemplos do Transformers.js (retrato, tigre, gatos, pão), 360×450 a 640×480. **Poucas e pequenas; não são as 20 fotos reais do G2**; não commitadas |
| Repetição | 1 rodada fria + 1 quente por combinação; sem estatística (sem variância). Tratar como ordem de grandeza |

## 2. Candidatos de remoção de fundo

Licenças: `fato` verificado em LICENSE do repositório de origem ou ficha do Hugging Face nesta sessão, salvo indicação. **Licença do peso treinado é a do repositório; a licença dos dados de treino (DUTS, DIS5K, outros) NÃO foi verificada** `[unverified]`, e isso vai para o G6 (jurídico).

| Candidato | Arquivo testado | Licença (origem / repack) | Peso | Tempo de inferência quente, desktop WASM (retrato / tigre / gatos / pão) | Móvel emulado (retrato) | Heap JS | Qualidade observada (`medido`, olho nu, 4 fotos) | Veredito |
|---|---|---|---|---|---|---|---|---|
| **ISNet general-use fp16** (DIS) | `Ko033/isnet-general-use-onnx` | **Apache-2.0** (DIS) / Apache-2.0 na ficha | **84,1 MB** | 4,1 / 4,2 / 3,9 / 4,1 s | **14,4 s** | ~40–115 MB | **Melhor das 4 fotos**: bordas limpas, sujeito inteiro, sem halo nos gatos/pão; fundo rosa removido | **Padrão recomendado** |
| ISNet q8 | idem, `model_quantized` | idem | 43,8 MB | ~3,2 s | `[não medido]` | ~30–90 MB | **Ruído/halo magenta no retrato e tigre**; pior que fp16 | Rejeitar (q8 degrada) |
| **U²-Net** | `BritishWerewolf/U-2-Net` | **Apache-2.0** | 167,8 MB | 1,8 / 2,0 / 1,7 / 1,8 s | 5,3 s | ~185–200 MB | Boa, quase igual ao ISNet fp16; resíduo leve no pão | Alternativa se o peso de 168 MB for aceitável (não é, para celular) |
| **U²-Netp** | `BritishWerewolf/U-2-Netp` | **Apache-2.0** | **4,4 MB** | 0,64 / 0,67 / 0,90 / 0,71 s | **2,0 s** | ~20–130 MB | Aceitável em retrato e tigre; **halo rosado nos gatos, resíduo no pão** | **Fallback leve** (celular fraco, aviso de qualidade) |
| MODNet fp16 | `Xenova/modnet` | **Apache-2.0** | 12,4 MB | 1,4 / 0,5 / 0,5 / 0,6 s | 6,7 s | ~17–56 MB | Ótimo em retrato (cabelo); tigre com halo verde; **falha em gatos (mantém o sofá) e pão (apaga o sujeito)** | Só retrato. Não serve como único modelo |
| MODNet q8 | idem | Apache-2.0 | 6,3 MB | ~1,2 s | `[não medido]` | ~20–37 MB | Resíduo rosa no retrato; pior que fp16 | Rejeitar |
| **BiRefNet-lite** fp16 / fp32 | `onnx-community/BiRefNet_lite-ONNX` | **MIT** (BiRefNet) / MIT | 109,2 MB / 213,6 MB | **FALHA**: `std::bad_alloc` (fp16, fp32, e com WebGPU de software). Entrada fixa 1024: 512 é recusado | — | — | `[não medido]` | **Bloqueado em WASM.** Re-testar só com WebGPU em GPU real (item do roteiro manual) |
| BiRefNet (completo) | `onnx-community/BiRefNet-ONNX` | MIT | 467 MB (fp16) / 928 MB | `[não testado]` | — | — | — | Inviável para navegador (peso), não testado |
| **Excluídos por licença (instrução do Igor)** | RMBG-1.4/2.0 (`license: other`, não comercial), `@imgly/background-removal` (AGPL) | — | — | **não testados** | — | — | — | Fora |

**Alerta de licença (achado desta sessão):** o repack `onnx-community/ISNet-ONNX` está marcado **AGPL-3.0** no Hugging Face, enquanto o DIS original é Apache-2.0 (LICENSE verificado em `xuebinqin/DIS`). O arquivo que testei (`Ko033/...`) declara Apache-2.0 e cita a origem `rembg`/DIS, mas **é um repack de terceiro**. Antes de produção: converter nós mesmos o ONNX a partir dos pesos oficiais do DIS, ou obter parecer jurídico sobre o repack. Vale também para qualquer ONNX de terceiros abaixo. O `imgly/isnet-general-onnx` (marcado MIT) **não foi usado** por ser do mesmo ecossistema excluído.

Evidência visual: `/home/user/image-to-imagination/spike/results/contact_sheet_seg.jpg` (linhas: retrato, tigre, gatos, pão; colunas: MODNet fp16, U²-Netp, U²-Net, ISNet q8, ISNet fp16; fundo magenta = transparente).

## 3. Candidatos de upscale

| Candidato | Arquivo | Licença | Peso | Tempo `medido` (desktop WASM) | Móvel emulado | Qualidade observada | Veredito |
|---|---|---|---|---|---|---|---|
| **Real-ESRGAN general-x4v3** (compacto, x4) | `tamnvcc/Real-ESRGAN-General-x4v3_float` | **BSD-3-Clause** (repo `xinntao/Real-ESRGAN`, LICENSE verificado). **O repack não declara licença** `[unverified]` | **4,9 MB** | 360×450 → 1440×1800 em **33 s** (20 blocos de 112 px; ~200 s/MP de origem) | **138 s** (~850 s/MP) | **Limpa e nítida, sem emendas visíveis entre blocos**; textura de pele um pouco "pintada" | **Melhor custo/qualidade**, mas lento. Entrada **fixa 128×128** (tiling obrigatório) |
| Swin2SR classical x2 (q8) | `Xenova/swin2SR-classical-sr-x2-64` | **Apache-2.0** (`mv-lab/swin2sr` LICENSE e `caidas/` na ficha) | 20,5 MB (q8) / 51,9 MB | 128×128 → 256×256 em **11,5 s**; 360×450 → 720×900 em 74 s (~460 s/MP) | `[não medido]` (≥ 4x pior, `estimativa`) | Mais nítido que bicúbico, ganho moderado | **Rejeitar** (muito lento para o ganho) |
| Swin2SR x2 fp16 | idem | Apache-2.0 | 30,9 MB | **Erro de kernel** no WASM | — | — | Não funciona em WASM |
| Real-ESRGAN x4plus (completo) | vários repacks | BSD-3 | ~64 MB `[unverified]` | `[não testado]` | — | — | Provavelmente mais lento; só WebGPU |
| UpscalerJS (`upscaler`) | npm 1.0.0 | MIT | — | `[não testado]` | — | — | Biblioteca de tiling sobre modelos de terceiros; avaliar só se WebGPU/WebGL render ganho |
| **Baseline sem modelo** | `drawImage` com `imageSmoothingQuality='high'` | — | 0 | ~ms | ~ms | Borrado em ampliação >2x, mas sem custo | **Padrão Fase 0** |

Evidência: `/home/user/image-to-imagination/spike/results/desktop_up_realesr_general_x4v3_t256.png`, `desktop_crop_up_swin2sr_x2_q_t128.png` vs `desktop_crop_bicubic_x2.png`.

## 4. Filtros e patterns por canvas (`medido`, sem modelo, sem dependência)

| Item | Tempo (retrato 360×450 / saída 2000×2000) | Observação |
|---|---|---|
| halftone / duotone / posterize / sketch (Sobel) | 21 / 19 / 26 / 16 ms | Determinísticos; funcionam sobre a imagem com alpha. Amostras: `results/desktop_style_*.png`. **Qualidade estética não avaliada pelo Igor** (é o risco da opção 2) |
| pattern grid / half-drop / mirror | 45 / 32 / 40 ms | Emenda por construção (repetição do mesmo bloco). Amostra: `results/desktop_pattern_halfdrop.png` |

Custo é desprezível; o teto real é a **resolução do canvas** (seção 5) e o PNG de saída. Em 4500×5400 a conta muda: a mesma operação sobre 24,3 MP leva ordem de segundos `estimativa`.

## 5. Limites de canvas

| Plataforma | Limite | Fonte |
|---|---|---|
| Chromium desktop (este teste) | Alocou e leu pixel de **16384×16384 (268 MP)**, 10000×10000, 8192², 5000², **4500×5400 (24,3 MP)**, 4096² | `medido` (`probeCanvas()` em `results/desktop.json`) |
| **iOS Safari (iPhone)** | Área máxima **~16.777.216 px (4096×4096)** por canvas e um orçamento total de memória de canvas por aba; acima disso o canvas fica em branco ou a aba recarrega | `[unverified]` (conhecimento prévio; não deu para confirmar em fonte nesta sessão, a lib `canvas-size` do GitHub não traz a tabela) |
| Safari desktop | ~16384×16384 / ~268 MP | `[unverified]` |
| Android Chrome | Depende da GPU e da RAM; costuma permitir ≥ 8192 de lado, mas morre por memória antes | `[unverified]` |

**Como medir:** botão "Probe canvas limits" do bench (`index.html`) no aparelho real; ele testa 4096², 4500×5400, 5000², 8192², 10000² e 16384² e confere a leitura do pixel final (um canvas pode "alocar" e devolver preto).

## 6. Resolução final alcançável vs. 4500×5400 px

Alvo: 4500×5400 = **24,3 MP** (15×18 pol a 300 DPI).

| Cenário | Resolução final | % do alvo (linear) | Base |
|---|---|---|---|
| Desktop, canvas único, upscale por canvas | **4500×5400 completo** | 100% | `medido` (alocação ok) |
| iPhone, canvas único (limite 16,7 MP) | **≈ 3739×4487** (mesma proporção 5:6) | 83% (~249 DPI na peça de 15×18) | cálculo sobre limite `[unverified]` |
| iPhone, exportação por faixas (sem canvas único) | Pode chegar a 4500×5400, mas exige encoder PNG próprio em JS (fflate/pako, MIT) e 97 MB de buffer RGBA | 100% | `[não medido]`; risco de memória no Safari |
| Real-ESRGAN x4 até o alvo | Origem precisa ter ≥ **1125×1350 (1,5 MP)** | 100% | **~5 min desktop / ~20+ min celular** `estimativa` a partir de 200 e 850 s/MP medidos |
| Upload típico de celular (12 MP) | Já passa de 24 MP só com ampliação de 1,4x por canvas, sem modelo | — | `estimativa` |

Leitura de produto: **o alvo de 4500×5400 é atingível em desktop e em foto grande; em foto pequena + iPhone não é**, e o modelo de upscale não resolve isso dentro de tempo aceitável em WASM. Mitigação: aviso de resolução mínima, arquivo exportado no máximo suportado e revisão manual do Igor (já no plano, seção c).

## 7. Recomendação para a Fase 0 (o Head decide o trade-off)

| Peça | Recomendação | Trade-off sacrificado |
|---|---|---|
| Recorte (padrão) | **ISNet general-use fp16** (84 MB), carregado só após o upload, cache do navegador | Download de 84 MB (≈ 34 s a 20 Mbps `estimativa`) e 4 s no desktop / ~14 s no celular lento |
| Recorte (fallback) | **U²-Netp** (4,4 MB) quando o aparelho for fraco ou a banda baixa; mensagem "qualidade menor" | Halo e resíduos em fundos coloridos |
| Recorte (descartados) | MODNet (só retrato), BiRefNet-lite (não roda), ISNet q8 (ruído) | — |
| Upscale | **Sem modelo como padrão:** ampliação por canvas + checagem de DPI + export no teto do aparelho. **Botão opcional "Melhorar" (Real-ESRGAN compacto x4, 4,9 MB), só desktop, com barra de progresso honesta**, limitado a origens pequenas | Nitidez menor que Real-ESRGAN; espera de minutos se o cliente usar o botão |
| Estilos / patterns | Canvas puro (seção 4), sem modelo | "Efeito gráfico", não generativo (já aceito no plano) |
| Pendência para destravar | Rodar o roteiro da seção 9 em iPhone e Android; se WebGPU em GPU real der ≥ 10x, reabrir BiRefNet-lite e o upscale por modelo | — |

**Gate G2 (parte técnica):** a evidência desktop está pronta; **falta evidência de iPhone/Android reais** e a avaliação do Igor em 20 fotos reais. Não declarar G2 aprovado antes disso.

## 8. Riscos

| Risco | Prob. | Impacto | Mitigação | Sinal de reversão |
|---|---|---|---|---|
| Licença do repack ONNX de terceiros (AGPL no repack `onnx-community/ISNet-ONNX`; Real-ESRGAN repack sem licença; dados de treino não verificados) | Média | Alto | Converter do peso oficial; parecer jurídico no G6; manter lista de licenças no repositório | Qualquer arquivo AGPL/NC no bundle |
| Memória no iPhone derruba a aba (ISNet 84 MB + WASM + canvas) | Média-alta | Alto | Fallback U²-Netp; processar em 1024 px e só então ampliar a máscara; liberar sessões; medir no aparelho | Falha > 10% no móvel (gatilho do plano) |
| Qualidade do recorte em fundos complexos | Alta | Médio | Revisão manual do Igor; botão "tentar outro modelo"; linha de base de 20 fotos | Igor reprova > 30% |
| Upscale lento frustra o cliente | Alta | Médio | Não é o padrão; botão opcional com ETA | Cliente abandona durante o "Melhorar" |
| Teto de 16,7 MP no iOS | Média `[unverified]` | Médio | Aviso, export por faixas ou limitar produtos grandes ao desktop | Pedido de produto grande vindo de iPhone com arquivo abaixo da spec |
| Resultados deste relatório com amostra pequena e sem GPU | Alta | Médio | Roteiro manual; não generalizar | — |
| Peso dos modelos fora do limite de 30 KB do widget | Baixa | Médio | Carga sob demanda (já no plano); modelos ficam fora do bundle do tema | — |

**Dívida técnica aceita (nomeada):** ORT-web vendorizado sem pipeline de build; pré/pós-processamento escrito à mão (sem Transformers.js) por controle de medição; memória medida só pelo heap JS; sem fixture de qualidade automática (comparação visual).

## 9. Roteiro de teste manual para o Igor (iPhone Safari real e Android médio)

Tempo: ~20 min por aparelho. Nada é enviado para fora; tudo roda local. Não precisa de conta.

**Preparação (uma vez, no computador):**
1. Em `/home/user/image-to-imagination/spike/` rode `./fetch-models.sh` (baixa ~450 MB; os testes abaixo só usam ISNet fp16, U²-Netp, Real-ESRGAN).
2. Rode `node serve.mjs` e descubra o IP do computador na rede Wi-Fi (por exemplo `http://192.168.0.10:8765`). Celular e computador na mesma rede.
   - Observação: Safari/Chrome móvel exigem contexto seguro para algumas APIs (WebGPU); em HTTP por IP o WebGPU pode não aparecer. Se for o caso, anote "WebGPU indisponível via HTTP" e, para testar WebGPU, use um túnel HTTPS gratuito de sua escolha (**sem criar conta paga**) ou peça ajuda ao coordenador.
3. Tenha 3 fotos: pequena (~800 px), média (~2000 px) e grande (foto de celular, 12 MP).

**No celular (anote o modelo do aparelho, iOS/Android e versão, bateria e se o modo de economia está ligado):**

| # | Passo | O que anotar |
|---|---|---|
| 1 | Abrir a URL. Tocar **Probe canvas limits** | Copiar o JSON do log (ou foto da tela): quais tamanhos deram `ok:true, readback:true`. É o número que fecha a seção 5 |
| 2 | Escolher a foto média. Modelo **u2netp**, backend **wasm**, threads **1**. Tocar **Remove background** | `inferMs`, `heapAfterMB`, se o recorte ficou ok, se a aba recarregou |
| 3 | Mesmo passo com **isnet_fp16**, threads **1** e depois **4** | `loadMs`, `inferMs`; a aba travou, recarregou ou o Safari mostrou "ocorreu um problema"? |
| 4 | Backend **webgpu** com **isnet_fp16** (se a opção funcionar) | Tempo; erro; se `navigator.gpu` aparece |
| 5 | Foto grande (12 MP): repetir passo 3 | Se falha por memória; tempo |
| 6 | Foto pequena + **Upscale** com `realesr_general_x4v3` | `inferMs` e o que acontece em 1–2 minutos (travou? esquentou?) |
| 7 | Tocar **Apply style** (4 estilos) e **Apply pattern** (3) | Aparência no aparelho e se há atraso perceptível |
| 8 | Qualidade: salvar prints do recorte de 3 fotos diferentes | Enviar ao coordenador para entrar na linha de base do G2 |

**Critério de decisão pós-teste (proposta):** ISNet fp16 vira padrão se o tempo for ≤ 20 s e sem recarga de aba em ≥ 8 de 10 tentativas no celular médio; senão o padrão móvel passa a ser U²-Netp. Se `readback:true` falhar abaixo de 4096², reduzir o teto de export no celular.

## 10. Artefatos

| Caminho | Conteúdo |
|---|---|
| `/home/user/image-to-imagination/spike/index.html`, `bench.js` | Bancada: carregar imagem, rodar modelo, medir tempo e heap, estilos, patterns, sonda de canvas |
| `/home/user/image-to-imagination/spike/serve.mjs` | Servidor estático Node sem dependências (COOP/COEP para threads WASM) |
| `/home/user/image-to-imagination/spike/run-spike.mjs` | Execução automática Playwright (desktop e emulação móvel com CPU 4x) |
| `/home/user/image-to-imagination/spike/fetch-models.sh`, `README.md`, `.gitignore` | Como reproduzir; modelos e amostras ficam fora do controle de versão |
| `/home/user/image-to-imagination/spike/vendor/` | onnxruntime-web 1.30.0 (MIT), arquivos de runtime |
| `/home/user/image-to-imagination/spike/results/` | `desktop.json`, PNGs de saída, `contact_sheet_seg.jpg` |

**Limitações de reprodução:** o `desktop.json` reflete a primeira rodada (parte dos erros iniciais de caminho do runtime já corrigidos); os números finais deste relatório vêm das rodadas posteriores registradas no log da sessão, não de um JSON único consolidado `[limite]`. Repetir `node run-spike.mjs desktop` regenera os dados.
