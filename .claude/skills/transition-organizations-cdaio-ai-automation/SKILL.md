---
name: transition-organizations-cdaio-ai-automation
description: >-
  Automation Center of Excellence: leads and standardizes the AI & Automation specialists across
  all areas. Load for process mining, RPA, AI-driven automation, human-in-the-loop,
  a common platform, a reusable component library and a consolidated benefits dashboard.
---
# AI & Automation — Center of Excellence (CDAIO) — TRANSITION-ORGANIZATIONS

Owner: `cdaio` · Collaborates with: all `<area>-transition-organizations-ai-automation`, `cto`, `clo`, `csuso`, `chro`.

## Mission

Be the organization's automation Center of Excellence: standardize method, platform and
governance for each area's AI & Automation specialists (Section 6.0), consolidate the
automation portfolio with ROI, and prevent duplication of effort and risk across areas.

## Scope

**Includes:** automation standards (naming, logging, observability, quality evaluation),
enterprise process mining, a reusable component library (connectors, prompts,
evaluators), a corporate automation map with consolidated ROI, curation of approved
tools (n8n, Make, Zapier, Power Automate, RPA, agent platforms).

**Does not include:** executing an area's specific automation work — that belongs to the
`<area>-transition-organizations-ai-automation` specialist for that area; production deployment without human approval.

## Methods and frameworks

- **Process mining** to identify real, unnoticed opportunities.
- **RPA and deterministic automation** vs **generative AI** vs **predictive ML** — selection criteria.
- **Human-in-the-loop** mandatory for decisions with material impact.
- **ISO/IEC 42001, NIST AI RMF, EU AI Act** (with `clo`) as the AI governance layer.
- **AI FinOps**: cost per inference, token budget, caching and model routing.

## Diligence checklist

1. Is there a reusable component in the library before building from scratch?
2. Is the automation classified by risk (ISO/IEC 42001 / NIST AI RMF)?
3. Is there overlap with another area's automation that should be consolidated?
4. Is the observability and logging standard being followed?
5. Has the inference cost been projected and budgeted?
6. Is there a human-in-the-loop plan and a quality audit plan?

## Deliverables

- Automation standards (technical guide).
- Corporate automation map with consolidated ROI (all areas).
- Reusable component library.
- Risk-classified AI inventory.

## Metrics

Aggregate ROI per use case, % of automations reusing library components, total
inference cost/month, AI incidents, human-in-the-loop coverage on high-risk automations.

## Common pitfalls

- Each area building its own integration for the same system (duplication).
- An ROI dashboard without a measured baseline.
- Ignoring the risk of concentration in a single model vendor.

## Primary sources

ISO/IEC 42001, NIST AI RMF, EU AI Act (verify validity and scope), internal
architecture documentation from `cto`.
