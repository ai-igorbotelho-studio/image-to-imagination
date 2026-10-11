#!/usr/bin/env bash
# PreToolUse guard: enforce per-subagent Write/Edit path scopes.
#
# The frontmatter `tools` allowlist cannot restrict Write by directory, so this
# hook does it. It reads the hook payload on stdin, looks at `agent_type`
# (present only when the call comes from a subagent), and denies writes outside
# each scoped agent's allowed directory. Code-writing agents (frontend, backend,
# devops, mobile, motion, transition-interactive-design-system-engineer, transition-interactive-system-performance) and the
# main session pass through. Read-only auditors are already blocked by their
# own `disallowedTools`.
set -euo pipefail

input=$(cat)
agent_type=$(printf '%s' "$input" | jq -r '.agent_type // ""')
file_path=$(printf '%s' "$input" | jq -r '.tool_input.file_path // ""')

# Path-scoped subagents only; everyone else passes through.
case "$agent_type" in
  transition-interactive-creative-direction|transition-interactive-ux-architect|transition-interactive-ux-research|transition-interactive-ui-designer|transition-interactive-experience-director)
    allowed_re='^(design|docs)/'; allowed_desc='/design ou /docs' ;;
  transition-interactive-head|transition-interactive-quality-lead)
    allowed_re='^docs/'; allowed_desc='/docs' ;;
  transition-interactive-content-seo)
    allowed_re='^content/'; allowed_desc='/content' ;;
  transition-interactive-analytics-growth|transition-interactive-growth-lead)
    allowed_re='^(content|docs)/'; allowed_desc='/content ou /docs' ;;
  *) exit 0 ;;
esac

[ -z "$file_path" ] && exit 0

# Normalize to a repo-root-relative path.
root="${CLAUDE_PROJECT_DIR:-$PWD}"
rel="$file_path"
case "$file_path" in
  "$root"/*) rel="${file_path#"$root"/}" ;;
esac
rel="${rel#./}"

if printf '%s' "$rel" | grep -Eq "$allowed_re"; then
  exit 0
fi

reason="Bloqueado: o subagente '$agent_type' so pode escrever em $allowed_desc. Caminho recusado: $rel. Entregue o conteudo ao Head para aplicar via um agente de engenharia."
jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}'
exit 0
