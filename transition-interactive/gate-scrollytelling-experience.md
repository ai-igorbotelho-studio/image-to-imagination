# Gate: Scrollytelling — Experience Director Review

**Subject:** `/home/user/CLAUDE-AGENTS/prototypes/transition-interactive-scrollytelling.html`
**Reviewer:** Experience Director (craft/concept gate — not the a11y audit, which runs separately)
**Verdict: PASS with required refinements.** No blocking craft issue. The concept is sound and worth building on; it currently reads as a well-executed *demo of technique* rather than a *felt* piece of storytelling. Close that gap before this ships as the reference the pod copies from.

---

## 1. Narrative clarity — partially earns its place

**Strong:** The six steps map 1:1 to the real pipeline (Briefing → Discovery → Design → Build → Audit → Ship), and the copy is specific to this org, not filler. The sticky panel swapping per step is the correct concept — a persistent "stage" that different content passes through is exactly how Apple/Rive product pages sell a process.

**Weak — this is the core issue:** the six SVG glyphs (dashed circle, triangle, rounded rect, heptagon, circle+checkmark, mountain+flag) don't carry the *meaning* of each step — they carry only its ordinal difference. A viewer scrolling past "02/Design → shape, motion, system" sees a rounded rectangle; nothing about that shape says "design system." Compare to the reference bar (Lusion, Rive): every scroll-linked shape shift is either (a) a literal diagram of the mechanism, or (b) a continuous morph from the previous shape, so the *transformation itself* is the information. Here, six unrelated shapes are swapped with a hard cross-fade — visually it's a slideshow, not a transformation.

**P1 — Fix the shape language.** Choose one geometric system and morph one shape through all six states rather than picking six visually unrelated glyphs. Options, cheapest to most ambitious:
- Same base shape (e.g., a ring/node graph) that gains a node/connection at each step, ending in a complete six-node pipeline — literally builds the diagram the copy describes.
- SVG path morph (shared point count) between steps so transitions animate as *shape change*, not swap.
Either reads as "the pipeline is being assembled in front of you," which is the actual narrative. The audit-step icon (checkmark) is the one glyph that already does this correctly — semantically tied to its copy. Use that as the bar for the other five.

## 2. Motion feel — tasteful, occasionally under-designed

**Strong:** Parallax restraint (line 342-344, `.parallax-caption`) is exactly right — two layers, one subtle, caption static, explicitly framed as atmosphere not message. This is the most premium-feeling piece in the file. Reduced-motion handling is a first-class citizen throughout (`prefers-reduced-motion` gates JS wiring at line 377, CSS fallback at 157-159, global kill-switch at 214) — correct engineering posture for this pod.

**Weak:**
- The step transition (`.step` opacity/translateY, lines 149-156, and the `@supports` scroll-timeline enhancement at 461-476) uses a flat `ease`/`linear` curve on a 14px nudge — too small and too linear to register as a "moment." At the reference bar, the entry of each new story beat has a distinct signature (slight overshoot, stagger between elements, or a scale cue) so the eye *feels* the beat change, not just notices new text appeared. Right now all six transitions feel identical because they use one keyframe for six different kinds of content (a milestone vs. a build step vs. a release).
- The sticky-graphic swap (`g-frame[data-shown]`, line 184) is a hard `display:none`/`display:grid` toggle — zero cross-fade or morph. This is the flattest moment in the whole piece and it's the one moment doing the most narrative work. Even a 150–200ms opacity cross-fade between outgoing/incoming frame would remove the "slide flip" feeling.

**P1 — Give the sticky-graphic transition a transition.** Cross-fade (or better, morph per item 1) between `.g-frame` states instead of the instant `display` swap.

**P2 — Vary the easing per step weight, not uniformly.** E.g., the Audit step (the gate) could hold a beat longer or ease with slightly more emphasis than Discovery, reinforcing hierarchy in the story rather than treating all six as interchangeable list items.

## 3. Visual craft — on-brand, not yet premium

Typography, spacing, and the JetBrains Mono step numbering are consistent with the rest of the transition-interactive family and read well. The `progress-rail` dot treatment (lines 133-140) is a nice quiet touch — scale + color, no gimmick.

**Weak:** the SVG icon set feels placeholder-grade next to the type system around it — thin uniform 4px strokes, generic geometric primitives, no relationship to the accent/highlight color logic beyond "cycle through three colors." This is the one element in the file that would look at home in a wireframe, not a shipped Apple/Rive-tier page. This is the same root cause as the P1 in section 1 — solving the shape-morph problem will very likely solve this too, since a designed, continuous icon system will look more crafted than six discrete stock shapes.

## 4. Restraint — what to cut

- The `topband` badges (lines 228-232, "Technique a / b / c") are useful as prototype-documentation but read as dev-tool chrome, not part of the experience — correctly excluded from the shippable version; flag explicitly so it isn't forgotten and carried into production by accident.
- `rule-note` box (lines 238-242) narrating "try it, scroll slowly" is appropriate for this internal reference build; cut for the real page — the interaction should be legible without an instruction label, or it's not intuitive enough.
- Parallax section is correctly minimal already — nothing to cut there. Resist the temptation to add a third layer or increase amplitude; 18px/-48px is close to the right restraint ceiling.

---

## Priority summary

| Priority | Item | Location |
|---|---|---|
| P1 | Replace six unrelated SVG glyphs with one morphing/building shape system so the sticky graphic *is* the pipeline, not a slideshow of it | `.sticky-graphic .g-frame` icons, lines 312-336 |
| P1 | Add a cross-fade/morph transition between `.g-frame` states instead of the hard `display:none/grid` toggle | `.sticky-graphic .g-frame[data-shown]`, line 184; JS `setActiveStep`, line 385-396 |
| P2 | Differentiate step-transition easing/emphasis by narrative weight (Audit and Ship deserve more presence than a generic beat) | `.step` transition, lines 149-156; `@keyframes step-reveal`, lines 471-474 |
| P2 | Strip dev-facing chrome (technique badges, "try it" instructional note) before this pattern is reused in production pages | `.badges`, lines 228-232; `.rule-note`, lines 238-242 |

Nothing here blocks handoff to `transition-interactive-scroll-motion` for build-out — the underlying technical approach (native scroll-timeline + IO fallback + reduced-motion-first) is exactly the right foundation. The craft gap is entirely in the *content of the motion* (what shape does what, and how it gets there), not the mechanism. Re-review after the icon/morph system and graphic-transition fade land, before this goes to `transition-interactive-audit-design` + `transition-interactive-qa-cross-browser` + `transition-interactive-system-performance`.

---

## Re-review — after P1 fix (assembling pipeline node-graph rebuild)

**Date:** 2026-09-21
**Scope:** Re-review of the rebuilt `.sticky-graphic` (single `.pipeline-graph` SVG, lines 199-238 CSS / 361-380 markup / 441-464 JS `setGraphState`/`setGraphStatic`), against the two P1s and two P2s above.

**Verdict: PASS — clear to proceed to `transition-interactive-qa-cross-browser` + `transition-interactive-system-performance`.** No blocking craft issue remains. This is a genuine fix, not a cosmetic patch — the graphic now does real narrative work.

### 1. Does the assembling graph resolve the P1?

Yes, cleanly. This is no longer six unrelated shapes cross-faded — it is one SVG (`#pipeline-graph`) whose 6 nodes and 5 edges persist across the whole scroll and accumulate: `data-state="pending|settled|active"` on each node/edge (lines 441-455, `setGraphState`) means nothing is ever removed or swapped out, only added and re-emphasized. At step 00 one node exists; by step 05 the full 6-node pipeline is standing, drawn edge by edge. That is a direct, literal enactment of "the pipeline is being assembled in front of you" — exactly the bar set in the original P1 (section 1). Each step's addition reads as meaningful because it's cumulative and spatially anchored: the new node appears where the previous edge points, so the eye's expectation (edge extends → node lands) is met every time. The audit-step "checkmark carries its own meaning" bar from the first review is now the standard applied uniformly, not the exception.

One nuance worth flagging as a non-blocking observation, not a P2: the node/edge shapes themselves (plain circles + straight connectors) are intentionally generic — the *system* (assembly) carries the meaning now, not individual iconography per step. That's the right trade for restraint; do not read this as "P1 only half-fixed." A literal per-step glyph (checkmark for Audit, rocket for Ship) layered onto this graph would very likely re-introduce the slideshow smell the rebuild just eliminated. Leave it alone.

### 2. Craft of the transition choreography

Tasteful, sits right at the restraint ceiling — does not overstep it. Specifically:
- Edge draw-on via `pathLength="1"` + `stroke-dasharray:1 1`/`stroke-dashoffset` (lines 213-219) is the correct technique for "wire extends," not "wire pops" — matches the parallax section's established quality bar.
- Node entrance (`transform:scale(.7)` → `scale(1)`/`scale(1.14)`, cubic-bezier(.2,.8,.3,1.15) at line 225) has a small, deliberate overshoot — exactly the "distinct signature so the eye feels the beat change" the original P2 asked for on the *step* transition, and it's landed here on the *graphic* transition too, which is the higher-leverage location since this is the panel doing the most narrative work.
- Settled-state dimming (opacity .5/.55, desaturated stroke) versus active-state emphasis (full opacity, node-color stroke, scale 1.14) gives clear figure/ground hierarchy at every step without needing more than two states plus the transient pending state. No gratuitous third color pass, no bounce-on-every-node — restrained.
- Nothing about the choreography reads as overdone: no stagger-cascade, no path morphing beyond what's needed, no competing motion on the same frame. This is the correct amount of sophistication for a decorative, `aria-hidden` panel.

### 3. Earlier P2s

- **Weight variation (Audit/Ship):** `highWeight = {4: true, 5: true}` (line 433) driving `.weight-high` on both node (scale 1.22, stroke-width 4, line 235) and edge (stroke-width 4, line 220) lands well — it's subtle enough not to look like a bug (not a jarring size jump) but present enough to register Audit and Ship as heavier beats, matching the copy's own framing ("the gate nobody skips," "the loop closes"). This directly satisfies the original P2. No note needed here beyond: kept it in the current file, good.
- **Dev-facing badges + "scroll slowly" note:** unchanged from the first pass, still correctly labeled as acceptable-for-internal-reference / cut-before-production. Reaffirming that call; no new information changes it.

### 4. New craft issues from the rebuild

None rise to blocking. Two residual P2s, both minor and non-blocking:

- **P2 (residual) — `setGraphStatic()` reduced-motion state skips the "why."** Under `prefers-reduced-motion: reduce` (lines 460-464), the graph renders fully assembled and static, which is correct (matches the fully-visible steps list). But because every node/edge jumps straight to `settled` (never `active`), the color-coded weight cues (`--node-color`, `.weight-high`) never apply in this state — the reduced-motion viewer sees a flat, monochrome-dimmed diagram with no visual trace of the Audit/Ship emphasis that motion users get. Consider giving Audit (node 4) and Ship (node 5) a static `.weight-high` class even in `setGraphStatic()` so the hierarchy information (not just the motion) survives for reduced-motion users. This is a nice-to-have, not blocking — the information is still fully present in the text captions.
- **P2 (residual) — settled-edge color is inconsistent with settled-node color logic.** Settled nodes always dim to a neutral `--ink-soft` stroke (line 231) regardless of which `--node-color` they were assigned, but settled edges keep `stroke:var(--line)` unconditionally too (line 218) — so the per-node/per-edge color variables set up at lines 200-211 (`--accent`, `--accent-2`, `--highlight` cycling) are visually spent the instant a node settles; only the single currently-active node/edge ever shows its assigned color. This is a legitimate minimalist choice (avoids a "confetti" pipeline once several nodes are settled) and reads fine at 6 nodes — flagging only so `transition-interactive-scroll-motion` doesn't accidentally "fix" this into full-color-retention later without checking with this pod first, since that would reduce restraint, not improve it.

### Verdict

**PASS.** The rebuilt `.pipeline-graph` fully resolves the P1 from the first review (genuine cumulative transformation, not a slideshow) and lands the transition choreography at the correct restraint ceiling — premium, not overdone. Both earlier P2s (weight variation, dev chrome) are confirmed landed/acceptable. Two new residual P2s noted above (reduced-motion weight-cue parity; settled-edge color intentionally flattened) are non-blocking polish items, not craft-gate blockers. Clear to proceed to `transition-interactive-qa-cross-browser` and `transition-interactive-system-performance`.
