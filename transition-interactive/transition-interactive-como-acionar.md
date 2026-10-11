# Como acionar a equipe de agentes — cardápio de comandos

> **Regra de ouro:** subagente **não se chama por slash command**. Você fala com o
> **Head** (a sessão principal) em linguagem natural citando o nome do agente, e o
> Head faz o roteamento. A sintaxe é sempre:
> **`Use o subagente <nome> para <tarefa>.`**

---

## Comandos de barra reais (os únicos)

| Comando | O que faz |
|---------|-----------|
| `/agents` | Lista e gerencia os subagentes (ver, editar, criar) |
| `/hooks`  | Inspeciona/recarrega o hook de escopo de escrita |
| `/help`   | Ajuda do Claude Code |

Para confirmar que o time está carregado numa sessão nova, digite `/agents` — devem
aparecer os 33.

---

## Chamar 1 agente (frases prontas)

```
Use o subagente transition-interactive-head para planejar o pipeline deste projeto e rotear aos líderes de pod.
Use o subagente transition-interactive-explore para mapear a estrutura de arquivos deste projeto.
Use o subagente transition-interactive-creative-direction para definir o partido visual e a voz da marca (líder Creative & UX).
Use o subagente transition-interactive-experience-director para definir o conceito interativo e o "feel" premiado (líder Experience).
Use o subagente transition-interactive-scroll-motion para scrollytelling, parallax e scroll-spy.
Use o subagente transition-interactive-micro-interaction para hover, flip cards 3D, cursor customizado e botões magnéticos.
Use o subagente transition-interactive-interactive-dataviz para hotspots em imagens, mapas interativos e sliders antes/depois.
Use o subagente transition-interactive-gamification para quizzes, calculadoras/simuladores e drag-and-drop.
Use o subagente transition-interactive-dynamic-content para filtros facetados em tempo real e infinite scroll/load-more.
Use o subagente transition-interactive-engineering-lead para virar o design aprovado em plano técnico (líder Engineering).
Use o subagente transition-interactive-quality-lead para consolidar a auditoria em um veredito de gate (líder Quality).
Use o subagente transition-interactive-growth-lead para definir a métrica de sucesso por página (líder Content & Growth).
Use o subagente transition-interactive-ux-architect para desenhar o fluxo e a arquitetura de informação.
Use o subagente transition-interactive-ux-research para planejar pesquisa com usuários e sintetizar achados.
Use o subagente transition-interactive-ui-designer para transformar o fluxo em UI de alta fidelidade.
Use o subagente transition-interactive-motion-designer para propor as transições e animações.
Use o subagente transition-interactive-sound-designer para desenhar a identidade sonora e o feedback de áudio.
Use o subagente transition-interactive-design-system-engineer para criar os design tokens e componentes.
Use o subagente transition-interactive-frontend-multistack para implementar a interface em código.
Use o subagente transition-interactive-creative-technologist para prototipar a ideia e provar viabilidade técnica.
Use o subagente transition-interactive-system-performance para otimizar renderização e Core Web Vitals.
Use o subagente transition-interactive-3d-immersive para construir a camada 3D/WebGL/XR imersiva.
Use o subagente transition-interactive-mobile-crossplatform para a entrega mobile.
Use o subagente transition-interactive-backend-integration para a API e o contrato de dados.
Use o subagente transition-interactive-ai-engineer para construir a feature de IA/ML com evals e guardrails.
Use o subagente transition-interactive-devops-deploy para o pipeline de CI/CD e o deploy.
Use o subagente transition-interactive-audit-code para auditar o código.
Use o subagente transition-interactive-audit-design para auditar acessibilidade e usabilidade.
Use o subagente transition-interactive-security-privacy para revisar segurança e privacidade.
Use o subagente transition-interactive-qa-cross-browser para testar responsividade e cross-browser.
Use o subagente transition-interactive-ai-security-review para red-team de features de IA.
Use o subagente transition-interactive-content-seo para escrever copy e metatags.
Use o subagente transition-interactive-analytics-growth para definir e ler as métricas de sucesso.
```

---

## Chamar o time todo (pipeline completo)

Você não dispara os 33 em paralelo — o valor está na **ordem dos gates**. Um comando só:

```
Head: rode o pipeline completo neste projeto — descoberta (transition-interactive-explore, transition-interactive-ux-architect),
design (transition-interactive-creative-direction, transition-interactive-ui-designer, transition-interactive-motion-designer, transition-interactive-design-system-engineer),
implementação (transition-interactive-frontend-multistack, transition-interactive-backend-integration), auditoria
(transition-interactive-audit-design, transition-interactive-audit-code, transition-interactive-qa-cross-browser, transition-interactive-security-privacy) e, se aprovado,
deploy (transition-interactive-devops-deploy). Registre trade-offs em DECISIONS.md e não avance nenhum
gate sem minha aprovação.
```

---

## Briefings prontos por objetivo

**Auditar um design/site antes de lançar:**
```
Head: audite [tela/arquivo/link]. Rode transition-interactive-audit-design (WCAG 2.2 AA, contraste,
hierarquia, estados, conversão) e me devolva achados bloqueantes vs. não-bloqueantes,
com elemento específico + métrica.
```

**Melhorar a partir da auditoria:**
```
Head: com base nos achados, acione transition-interactive-creative-direction + transition-interactive-ui-designer para propor as
correções como spec em /design e /docs. Eu aprovo antes de aplicar.
```

**Intake de projeto novo:**
```
Head: intake do briefing — objetivo [X], público [Y], restrições [prazo/orçamento/stack].
Rode a descoberta com transition-interactive-ux-architect.
```

---

## Como levar a equipe para um projeto novo

**Um comando só** (na raiz do projeto novo):

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/ai-igorbotelho-studio/transition-interactive/main/scripts/transition-interactive-instalar-equipe.sh)
```

O script copia `.claude/` (33 subagentes + hook + settings), `TRANSITION-INTERACTIVE.md`,
`DECISIONS.md` e `transition-interactive-como-acionar.md`, e cria as pastas `design/`, `docs/`, `content/`.
Não sobrescreve arquivos existentes — use `--force` se quiser. Também aceita um
diretório de destino: `... instalar-equipe.sh) meu-projeto`.

**Ou manualmente:**

```bash
git clone --depth 1 --branch main https://github.com/ai-igorbotelho-studio/transition-interactive /tmp/agentes
cp -r /tmp/agentes/.claude .        # 33 subagentes + hook + settings
cp /tmp/agentes/TRANSITION-INTERACTIVE.md .         # pipeline, DACI, gates
cp /tmp/agentes/DECISIONS.md .      # registro de decisões
mkdir -p design docs content        # pastas de escrita dos agentes
```

Depois abra o projeto no Claude Code e rode `/agents` para confirmar.

### Fiação (auto-load do Head)
O Claude Code só auto-carrega um arquivo chamado exatamente `CLAUDE.md`. Como o doc do time é `TRANSITION-INTERACTIVE.md`, adicione **uma linha** ao `CLAUDE.md` do repo de destino (ou crie um só com ela) para o Head ler o pipeline/gates em toda sessão nova:

```
For the Transition Interactive team of subagents (Head, pipeline, DACI, gates), read TRANSITION-INTERACTIVE.md and act as the Head.
```

Comando pronto (cole na sessão do Claude Code no repo de destino):
```
Copy the .claude/ folder, the TRANSITION-INTERACTIVE.md and the DECISIONS.md from ai-igorbotelho-studio/transition-interactive (main branch) into this repo, without overwriting anything without showing me the conflict first. Then, if this repo has a CLAUDE.md, append this line to it (or create one with just this line): "For the Transition Interactive team of subagents (Head, pipeline, DACI, gates), read TRANSITION-INTERACTIVE.md and act as the Head." Then commit.
```

---

## Como implementar (passo a passo)

### ① Incluir a equipe numa conversa do Claude Code já rodando em outro repo
1. Peça na conversa: *"rode `bash <(curl -fsSL https://raw.githubusercontent.com/ai-igorbotelho-studio/transition-interactive/main/scripts/transition-interactive-instalar-equipe.sh)`"* — copia `.claude/`, `TRANSITION-INTERACTIVE.md`, `DECISIONS.md`, `transition-interactive-como-acionar.md` sem sobrescrever.
2. Comite: `git add .claude TRANSITION-INTERACTIVE.md DECISIONS.md transition-interactive-como-acionar.md && git commit && git push`.
3. Subagentes carregam **no início da sessão** → abra uma **sessão nova** nesse repo (ou reabra `/agents`) para os 33 aparecerem.
4. Confirme com `/agents` e comece com `Use o subagente transition-interactive-explore para mapear este projeto.`

### ② Começar um repo novo no GitHub já com a equipe
1. **Template (mais rápido):** em `github.com/ai-igorbotelho-studio/transition-interactive` → **Use this template → Create a new repository**.
2. Pré-requisito único: marcar este repo como *Template* (Settings → General — ver `docs/transition-interactive-github-setup.md`).
3. **Sem template:** crie o repo vazio, abra no Claude Code na web, rode o instalador e `commit`/`push` na `main`.
4. Toda sessão nova nesse repo carrega os 33 automaticamente.

### Claude Code · projeto novo
1. `mkdir meu-projeto && cd meu-projeto`
2. Rode o instalador de um comando (seção acima).
3. Abra no Claude Code → `/agents` (confirme os 33).
4. Se o hook não ativar, abra `/hooks` uma vez.
5. Cole um briefing começando com `Head:`.

### Claude Code · projeto que já existe
1. Na raiz do projeto, rode o instalador — **não sobrescreve** nada (`--force` se quiser).
2. Versione: `git add .claude TRANSITION-INTERACTIVE.md DECISIONS.md && git commit`.
3. `/agents` para confirmar.
4. Acione normalmente. Dica: comece com `Use o subagente transition-interactive-explore` para o time entender o projeto.

### Via GitHub
1. **Projeto novo:** em `github.com/ai-igorbotelho-studio/transition-interactive` clique em **"Use this template"** (ou faça *Fork*) — o repo já nasce com os 33 agentes.
2. **Projeto existente:** numa sessão do Claude Code na web apontando para o seu repo, peça *"instale a equipe e abra um PR"* — ou copie `.claude/`, `TRANSITION-INTERACTIVE.md` e `DECISIONS.md` e faça commit.
3. Revise e faça **merge do PR na `main`**.
4. Toda sessão nova nesse repo (Claude Code na web) carrega os 33 automaticamente.
5. **Opcional:** o `.github/workflows/ci.yml` valida os agentes e o hook a cada PR.

> Defina a `main` como branch padrão do repositório para quem clonar sem escolher branch já pegar a equipe.

### Chats do Claude (claude.ai)
> Subagentes de verdade só existem no Claude Code. No chat comum você reproduz o Head manualmente.
1. Crie um **Project** no claude.ai (ou use instruções personalizadas).
2. Cole o `TRANSITION-INTERACTIVE.md` como instrução/knowledge do Project.
3. Peça: *"Aja como o Head e coordene os papéis descritos; quando eu citar um papel, incorpore o perfil dele."*
4. Use as frases `Use o subagente X para…` — o Claude simula o papel.

**Limite:** sem execução isolada, sem hook de escopo, sem gates automáticos — é orquestração conversacional.

### Claude Design
1. Finalize o design no canvas.
2. **Export → PNG/PDF** de cada artboard (ou baixe o `.dc.html`).
3. Abra uma sessão do Claude Code com a equipe e arraste os arquivos para `/design`.
4. Cole o briefing de auditoria (seção "Auditar um design/site").
5. O time devolve achados + spec de correção em `/design` e `/docs`.
6. Aplique de volta no canvas (manual ou re-semeando via skill `design`).

---

## Lembretes

- **Você não chama os auditores para "resolver" o que produziram** — o parecer da
  auditoria só é resolvido pelo **Head** (você), decidindo corrigir e reenviar.
- **`quality-audit`/pod de auditoria é sempre a última etapa antes de produção** —
  nunca pulada por prazo.
- Os agentes de design/conteúdo só escrevem nas pastas do escopo (`/design`, `/docs`,
  `/content`) — imposto pelo hook `PreToolUse`.
