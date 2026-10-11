# Briefings — Coverage Certification & "Bundles of Actions" Taxonomy

Owner: Head (`transition-interactive-head`) · recommendation only; final approval + HTML reorg is the user's.
Source: `transition-interactive-commands.html` (h2 `#briefings`, 24 blocks) + `TRANSITION-INTERACTIVE.md` (33 roles, pipeline 00→07, 5 pods).

---

## 1. Coverage certification

### Against the pipeline (00→07)
| Stage | Covered by briefing(s) | Verdict |
|-------|------------------------|---------|
| 00 Intake | 3 New-project intake | OK |
| 01 Discovery & architecture | 20 User research, 22 Prove feasibility (spike) | OK |
| 02 Design | 1, 5, 7, 11, 12, 19 | OK |
| 03 Build | 6 (lean/perf), 9, 10, 18 mobile, 24 3D | OK |
| 04 Integration & data | 13 Backend/API, 14 AI feature | OK |
| 05 Audit | 2, 4, 8, 15 security, 21 accessibility | OK |
| 06 Deploy | 8 (gate→ship), 23 CI/CD & observability | OK |
| 07 Post-launch | 17 Success metrics + read post-launch | OK |
| Cross (Content/Growth 02–07) | 16 Content, SEO & conversion | OK |

### Against the 5 pods
- **Creative & UX** — covered (1, 5, 7, 11, 12, 19, 20).
- **Experience/Interactive** — covered (9, 10, 24). All 5 conditional specialists are routed in 9.
- **Engineering** — covered (frontend, backend 13, mobile 18, AI 14, devops 23, perf 6, 3D 24). Creative-technologist surfaces via 22.
- **Quality/Audit** — covered (audit-code 4, audit-design 2, security-privacy 15, qa-cross-browser 8/21). `ai-security-review` has no standalone briefing but is correctly folded into the AI feature (14) and pre-launch gate (8) — five-routes "eliminate": a dedicated briefing would duplicate the gate, so no new one is warranted.
- **Content & Growth** — covered (16, 17).

### Genuinely MISSING briefing (five-routes test applied)
**One gap, mapping to an existing agent that is otherwise unreachable from any briefing:**

- **25 — Sound / audio experience (conditional).** No current briefing invokes `transition-interactive-sound-designer`. A real team building audio-as-experience (UI sound, ambient, sonic branding) has no entry point. Maps to existing agents: `sound-designer` (lead) + `motion-designer` (sync to motion) + `frontend-multistack` (Web Audio integration, autoplay/mute policy, `prefers-reduced-motion`/muted defaults). Gate: `audit-design` + `qa-cross-browser`. Keep it conditional/tagged like 24 (3D), not a default step.

Five-routes on the gap: build (new briefing) beats eliminate because the capability (agent) already exists and is currently orphaned; borrow/automate/buy don't apply to an in-house agent. Everything else in the roster is already reachable — coverage is otherwise complete.

---

## 2. BUNDLES OF ACTIONS (6 bundles, ordered by workflow)

Each briefing lands in exactly one bundle. Numbering keeps the original 1–24 + new 25.

### A. Start & Discovery
*Frame the problem before building — intake, evidence, and cheap proof.*
- 3 New-project intake
- 20 User research & usability testing
- 22 Prove feasibility (spike / prototype)

### B. Design & UX
*Shape the look, flow, coherence and reusable system.*
- 1 Sophisticated, interactive UX/UI experience
- 5 Optimize UI · coherence, refined UX & memorable interaction
- 7 Modernize a dated site (modern)
- 11 Adaptive navigation & menu for every screen
- 12 Match the look & feel of a reference image
- 19 Create / consolidate a design system

### C. Interaction & Motion
*Add the justified experiential layer — motion, interactivity, immersion, sound.*
- 9 Add a memorable interactive experience
- 10 Implement animations, effects & transitions
- 24 3D / WebGL / immersive experience (conditional)
- 25 Sound / audio experience (conditional) — NEW

### D. Build & Integrate
*Turn spec into working, connected, performant product.*
- 6 Make it fast & lightweight (lean)
- 13 Backend, API & data contract
- 14 Build an AI feature (with guardrails)
- 18 Mobile / cross-platform delivery

### E. Quality & Launch
*Audit, gate, and ship — audit pod is always the last step before production.*
- 2 Audit a design/site before launch
- 4 Full code audit · optimize, clean up & verify responsiveness
- 8 Ship-ready pre-launch gate
- 15 Security & privacy review (LGPD/GDPR)
- 21 Accessibility pass (WCAG 2.2 AA)
- 23 Set up CI/CD & observability

### F. Grow & Measure
*Content, conversion, and closing the loop after launch.*
- 16 Content, SEO & conversion
- 17 Define success metrics & read post-launch

---

## 3. Named trade-offs in this taxonomy
- **6 (lean/perf) sits in Build & Integrate, not Quality.** Sacrificed: its adjacency to the audit pod. Rationale: it is an engineering optimization users reach for mid-build, not a launch gate.
- **1 (flagship experience) sits in Design & UX, not Interaction.** Sacrificed: surfacing it next to the additive motion briefings. Rationale: it is a full design→build experience, scanned by users starting a whole product, not bolting on a layer.
- **`ai-security-review` gets no standalone briefing.** Sacrificed: a dedicated discovery path. Rationale: five-routes "eliminate" — it is already carried by 14 and 8; a separate briefing would duplicate the gate.
