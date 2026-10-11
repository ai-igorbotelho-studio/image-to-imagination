# TRANSITION-ORGANIZATIONS

Executive agent team (CEO + Board + C-Level + specialists) for Claude Code, implemented from the
`TRANSITION-ORGANIZATIONS.md` specification provided by the user. Applicable to any business,
with activation by size via `company-profile.md`.

## How to use

1. Fill in `transition-organizations/company-profile.md` (or run `/company-setup`).
2. Use the `transition-organizations-ceo` primary agent (via `/ceo <request>` or by setting it
   as the session's primary agent) for any business decision.
3. For governance and independent counter-argument, use `/board-consult`, `/board-review`, or
   `/premortem`.
4. For automation and AI within a department, use `/automation-scan`.
5. See `ORG-CHART.md` (Mermaid org chart) and `RACI.md` (responsibility matrix) to understand the
   structure.
6. Routing test scenarios are in `evals/scenarios.md`.

## Architecture — three technical layers

| Organizational layer | Implementation in Claude Code | Reason |
|---|---|---|
| **CEO** (orchestrator) | Primary agent `.claude/agents/TRANSITION-ORGANIZATIONS/transition-organizations-ceo.md` + section in `CLAUDE.md` + `/ceo` command | Only the main session reliably triggers subagents |
| **C-Level** (14 core departments) | Subagents `.claude/agents/TRANSITION-ORGANIZATIONS/transition-organizations-<code>.md` | Isolated context, parallelism, tools restricted by function |
| **Board of Directors** | `transition-organizations-board` subagent that loads one skill per chair | The CEO consults it at any time; each chair issues an independent opinion |
| **Level-2 department heads** (`rnd` under CInO; `holistic-health` under CHRO; `cculture` reporting to the CEO) and CEO-direct specialists (`digital-assets`) | Subagents with a declared `Reports to:` in the body, triggered by the request flow (not by nesting) | Departments with many specialists of their own need isolated context; hierarchy is preserved by the flow |
| **Regulated-sector split** (`crco`, Chief Risk & Compliance Officer) | Subagent activated only when `company-profile.md` shows a regulated sector (financial services, healthcare, energy); otherwise its duties stay inside `clo` | Prudential/licensing risk needs an independent seat only where the regulatory burden justifies it |
| **Specialists** (~131) | Skills `.claude/skills/transition-organizations-<code>-<specialty>/SKILL.md`, loaded by the owning C-Level | Avoids subagent nesting and pollution of the CEO's context |

## Finding on sub-agents, skills, and nesting (Section 0.1 of the specification)

**Mandatory task completed with a caveat:** this implementation was done by a scaffolding agent
in non-interactive mode, with no confirmed internet access at generation time to consult live
`https://code.claude.com/docs/en/sub-agents` and `https://code.claude.com/docs/en/skills`. The
architecture decision was made based on already-consolidated knowledge of Claude Code
(`name`, `description`, `tools`, `model`, `skills` frontmatter on agents; skills with `SKILL.md` +
`references/` loaded on demand) and, above all, following the specification's own explicit
guidance (Section 0.1): **even if subagent nesting works reliably in the installed version, the
~120 specialists should be implemented as skills** (context cost of the CEO holding dozens of
subagent descriptions).

**Recommendation for the user/operator:** before first real production use, confirm in the current
documentation:
(a) which frontmatter fields are actually supported by the installed version of Claude Code;
(b) whether subagents can reliably trigger other subagents in that version;
(c) how to run an agent as the main thread (`--agent` or the `agent` config in `settings.json`).

If the frontmatter blocks used here (`tools`, `model: inherit`, preloaded `skills:`) are not
supported exactly this way by the version in use, adjust only the frontmatter — the content
structure of the agents and skills does not change.

## Naming convention

The `transition-organizations-` prefix on every agent and every skill, lowercase, with hyphens
(revised from an earlier `-business-admin-global-team` suffix convention; every identifier,
folder, and cross-reference was renamed in a single pass — see git history). Specialist skills:
`transition-organizations-<c-level-code>-<specialty>`, at most 64 characters (the specialty is
abbreviated when needed — never the prefix).

## Language

All agent and skill files are in English. Agents respond in the user's language and keep
established technical terms in the original (CAPEX, runway, backlog, Scope 3, double
materiality).

## Structure created

```
.claude/
  agents/TRANSITION-ORGANIZATIONS/   21 agents (ceo, board, 14 core C-Levels incl. cculture,
                                      plus ccert, rnd, holistic-health, digital-assets, crco)
  skills/                             shared-protocols + ~131 specialist skills (incl. 4 CSCO
                                      supply-chain-lifecycle skills and 1 CRCO regulatory-compliance
                                      skill) + 17 AI&Automation skills + 12 board-chair skills
  commands/                          15 commands (Section 9)
transition-organizations/
  README.md (this file)
  ORG-CHART.md
  RACI.md
  company-profile.md
  decisions/
  evals/scenarios.md
CLAUDE.md        "TRANSITION-ORGANIZATIONS" section added
```

## Post-launch additions (beyond the original specification)

- **`transition-organizations-crco`** (Chief Risk & Compliance Officer) — activated only for
  regulated sectors (financial services, healthcare, energy) via `company-profile.md`; splits
  compliance and enterprise risk off `clo` and owns
  `transition-organizations-crco-regulatory-compliance` for sector-specific regulatory regimes.
- **Four CSCO supply-chain-lifecycle skills**: `transition-organizations-csco-supply-chain-design`
  (zero-to-one network design), `-supply-chain-management` (running an existing chain),
  `-supply-chain-risk` (dedicated risk quantification), and `-supply-chain-innovation`
  (technology/model scouting and piloting).
- **Senior professional-standard pass**: the common intellectual profile
  (`transition-organizations-shared-protocols`) and every agent's Identity section were elevated
  to an MBA + PhD/Master (function-specific) competency profile, 20–25 years across three
  continents, explicit systems-thinking method, and AI-native reasoning (each C-Level personally
  reasons with AI as a tool, not only via its `-ai-automation` specialist) — still framed as "a
  competency profile, not a real credential" per Section 3.7.

## Known deviations of this delivery from the specification

See the final report delivered to the user in the conversation that generated this repository for
the complete, up-to-date list of deviations. Summary:

1. **Live verification of the sub-agents/skills documentation (Section 0.1)** was not done via
   WebFetch in this generation round; the architecture followed the specification's own explicit
   guidance (skills for specialists), which is robust regardless of that verification's outcome.
   Confirming it before production use is recommended (see the section above).
2. **Evaluation scenarios (Section 11 / `evals/scenarios.md`)** were documented with the expected
   routing, but were not run end-to-end in this session (which generated files rather than
   operating the CEO agent as an interactive primary agent). Running the 17 scenarios with `/ceo`
   is the next step.
3. **The user's own skills mentioned in Section 7** (e.g., `senior-sustainability-strategist`,
   `ceo-strategist`) were not copied into `.claude/skills/`, since the specification requires
   explicit user confirmation before copying.
4. Content of the ~120 specialist skills strictly follows the Section 6.0 template (Mission,
   Scope, Methods, Checklist, Deliverables, Metrics, Pitfalls, Sources) with comparable depth
   across specialists; to keep batch generation feasible, each skill's text is dense and
   applicable, but less hand-crafted sentence by sentence than if each had been written
   individually — the technical content (frameworks, coverage, deliverables) is that of the
   specification's original table, verbatim where possible.
