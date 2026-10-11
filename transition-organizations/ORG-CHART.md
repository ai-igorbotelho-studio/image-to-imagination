# Org Chart — TRANSITION-ORGANIZATIONS

```mermaid
flowchart TD
    BOARD["Board of Directors<br/>(board — 12 chairs, advisory + deliberative)"]
    CEO["CEO<br/>(orchestrator)"]
    COS["Office of the CEO<br/>(cos — Chief of Staff & Strategy)"]
    CCERT["Certifications & Assurance Office<br/>(ccert, cross-cutting)"]
    DA["Bitcoin and Digital Assets Specialist<br/>(digital-assets)"]
    CULTURE["Chief Culture Officer<br/>(cculture)"]

    BOARD -.advises/deliberates.-> CEO
    CEO --> COS
    CEO --> CCERT
    CEO --> DA
    CEO --> CULTURE

    subgraph GATE["Sustainability Gate — CSusO"]
      CSUSO["Chief Sustainability Officer<br/>(csuso)"]
    end

    CEO ==goes through==> GATE

    CEO --> COO["COO — Operations<br/>(coo)"]
    CEO --> CFO["CFO — Finance<br/>(cfo)"]
    CEO --> CHRO["CHRO — People<br/>(chro)"]
    CEO --> CRO["CRO — Commercial<br/>(cro)"]
    CEO --> CMO["CMO — Marketing<br/>(cmo)"]
    CEO --> CLO["CLO — Legal/GRC<br/>(clo)"]
    CLO -.regulated sectors only.-> CRCO["CRCO — Risk & Compliance<br/>(crco, splits off clo)"]
    CEO --> CTO["CTO — Technology<br/>(cto)"]
    CEO --> CPO["CPO — Product<br/>(cpo)"]
    CEO --> CDAIO["CDAIO — Data & AI<br/>(cdaio)"]
    CEO --> CINO["CInO — Innovation<br/>(cino)"]
    CEO --> CSUSO

    COO --> CSCO["CSCO — Supply Chain<br/>(csco, reports to COO)"]
    CHRO --> HH["Head of Holistic Health<br/>(holistic-health)"]
    CINO --> RND["Head of R&D<br/>(rnd)"]

    CSUSO -.final opinion.-> CEO
```

## Notes

- `csco` reports to `coo` in the narrative organizational hierarchy, but is its own agent in
  Claude Code due to its technical depth (Section 1.1 of the specification).
- `rnd` reports to `cino`; `holistic-health` reports to `chro`. Both are their own subagents,
  triggered by the CEO when the owning C-Level requests it in the RETURN (or alongside it) — the
  hierarchy is preserved by the request flow, not by subagent nesting.
- `digital-assets` reports to the CEO, with a dotted line to `cfo`, `clo`, `csuso`, `cto`, and
  `board`.
- `cculture` reports to the CEO.
- `csuso` is the Sustainability Gate: every decision goes through it before being final.
- `board` is always accessible to the CEO in advisory mode, and deliberates on one-way doors.
- `crco` (Chief Risk & Compliance Officer) is activated only for regulated sectors (financial
  services, healthcare, energy) per `company-profile.md`; when inactive, its duties (integrity,
  enterprise risk) stay inside `clo`.
