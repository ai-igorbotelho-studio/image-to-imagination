# Configuração do repositório no GitHub

Passos manuais (feitos pela UI do GitHub — não dá para automatizar de dentro do
ambiente do Claude Code, que bloqueia essas operações de escrita) para deixar
este repositório pronto para ser reutilizado como base da equipe de agentes.

---

## 1. Definir a `main` como branch padrão

Hoje o padrão pode ainda apontar para uma branch `claude/...`. Quem clonar sem
escolher branch precisa cair na `main` (onde vive a estrutura completa).

1. **Settings → General → Default branch**.
2. Troque para **`main`** e confirme.

> Efeito: `git clone <repo>` (sem `--branch`) passa a trazer os 33 agentes, o
> hook, o CI e a documentação. O `scripts/transition-interactive-instalar-equipe.sh` já força
> `--branch main`, então funciona independentemente disso.

---

## 2. Tornar o repositório um Template

Permite criar projetos novos já com a equipe, via botão **"Use this template"**.

1. **Settings → General**.
2. Marque **Template repository**.

Depois, para um projeto novo: abra a página do repo → **Use this template →
Create a new repository**. O novo repo nasce com `.claude/`, `TRANSITION-INTERACTIVE.md`,
`DECISIONS.md`, o CI e a documentação.

---

## 3. Limpar branches redundantes

Após o merge da estrutura na `main`, as branches de trabalho ficam obsoletas.

1. **Página de branches:** `.../branches`.
2. Apague **`claude/equipe-digital-development`** e
   **`claude/equipe-digital-development-pr`** (ícone de lixeira).

> A deleção de branch é bloqueada pelo proxy do ambiente do Claude Code, por isso
> é feita aqui na UI.

---

## 4. (Opcional) Proteger a `main`

Para exigir CI verde antes de merge:

1. **Settings → Branches → Add branch ruleset** (ou *Branch protection rule*).
2. Alvo: `main`.
3. Marque **Require status checks to pass** → selecione o check **CI**
   (`.github/workflows/ci.yml`).

---

## Rotas de instalação da equipe (resumo)

| Cenário | Como |
|---------|------|
| **Projeto novo (template)** | *Use this template* neste repo |
| **Projeto novo (script)** | `bash <(curl -fsSL https://raw.githubusercontent.com/ai-igorbotelho-studio/transition-interactive/main/scripts/transition-interactive-instalar-equipe.sh)` |
| **Projeto existente (PR)** | Numa sessão do Claude Code na web no seu repo, peça "instale a equipe e abra um PR"; faça merge na `main` |
| **Projeto existente (manual)** | Copie `.claude/`, `TRANSITION-INTERACTIVE.md`, `DECISIONS.md` para a raiz e comite |

Detalhes de acionamento e briefings: ver `transition-interactive-como-acionar.md` (e a página visual
`transition-interactive-commands.html`) na raiz do repositório.
