# Deploy & Creative-Direction Audit — `transition-interactive-commands.html`

Auditor: `transition-interactive-creative-direction`
Scope: read-only on code. This document is the spec; the Head assigns execution to `transition-interactive-frontend-multistack` / `transition-interactive-ui-designer` / `transition-interactive-audit-code` / `transition-interactive-audit-design` as appropriate.

---

## P0 — Blocking (fix before next deploy)

### P0-1. Missing document scaffold: no `<!DOCTYPE html>`, no `<html lang>`, no `<meta charset>`, no `<meta name="viewport">`
- **Element:** top of file — the document currently opens directly with `<title>` and `<style>`, no `<html>`/`<head>`/`<body>`.
- **Why it's blocking:** without `<!DOCTYPE html>` the page renders in quirks mode (box model, font metrics, and CSS parsing all become unreliable). Without `<meta name="viewport" content="width=device-width, initial-scale=1">` mobile browsers render at a virtual desktop width (~980px) and scale down — the entire "mobile 320px" design intent is defeated regardless of how good the CSS is. Without `lang="en"` (or `pt-BR` if that's the intended audience — copy is in English) screen readers use the OS default voice/pronunciation, and it's also an automated a11y-checker failure. Without `<meta charset="utf-8">` the `✓`, `—`, and smart-quote characters in the copy (`copied ✓`, "isso está... —") risk mojibake depending on server-sent headers.
- **Concrete change:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Team Commands</title>
  <meta name="description" content="Command menu for triggering the 23 subagents of the transition-interactive in Claude Code.">
  <style>...</style>
</head>
<body>
  ...existing .wrap...
</body>
</html>
```

### P0-2. `.agents a/span` (org-chart chips) overflow at 320px viewport
- **Element:** `.agents a, .agents span` — `white-space:nowrap` combined with long identifiers like `transition-interactive-design-system-engineer` (44 chars) inside `.map-rail` (`padding-left:20px`) at 320px width.
- **Why it's blocking:** at 320px the available content width inside `.wrap` (`padding-inline:20px`) minus the rail's own `padding-left:20px` is roughly 240–260px. A single nowrap chip at `.72rem` JetBrains Mono easily exceeds 300px, forcing the chip itself (not just the row) to overflow its container — this produces horizontal scroll/clipping on exactly the org-chart section that's supposed to be the page's orientation device for a cold visitor.
- **Concrete change:** drop `white-space:nowrap` on `.agents a, .agents span` (word-break is already handled fine by hyphens in the identifiers so it wraps cleanly at `-`), or truncate the visual label (see P1-4) so the chip never needs to hold the full 40+ character string.

### P0-3. Sticky nav height vs. `scroll-margin-top` mismatch on small screens
- **Element:** `.nav` (sticky, 6 links, `flex-wrap:wrap`) vs. `h2{scroll-margin-top:76px}` and `.cmd{scroll-margin-top:88px}`.
- **Why it's blocking:** `76px`/`88px` assume a single-row nav (~40–44px tall). At narrow widths the 6 nav links wrap to 2–3 rows, making the sticky band 80–130px tall. Any anchor jump (from the org-chart `.agent-link`s, from `#cmd-*` deep links shared externally, or from the nav itself) will land with the target heading/command partially or fully hidden behind the sticky band — a real, reproducible broken-anchor bug, not a style nitpick.
- **Concrete change:** either (a) measure nav height in JS on load/resize and set `--nav-h` as a custom property consumed by `scroll-margin-top:calc(var(--nav-h) + 16px)`, or (b) simpler and more robust: cap `.nav` to a horizontally-scrollable single row (`flex-wrap:nowrap; overflow-x:auto; -webkit-overflow-scrolling:touch`) so its height is always predictable — this also reads as more "console/command-palette" and fits the aesthetic better than a wrapping pill row.

---

## P1 — High priority

### P1-1. No search/filter across the 23 commands
- **Element:** `#agents` section — six `.group` blocks, 23 `.cmd` buttons, no way to jump to one by typing.
- **Why:** this is the page's core utility (copy the right phrase fast), and it's the longest scroll on the page. A user who knows they want `ai-security-review` still has to scan visually through Leadership → Design → Engineering → QA.
- **Concrete change:** add a single `<input type="search">` directly under the `#agents` heading, sticky-adjacent (not sticky itself, to avoid compounding P0-3), that filters `.cmd` elements by matching against `.name`/`.phrase` text and hides empty `.group`s. Respect keyboard: `/` focuses it (common command-palette convention), `Esc` clears. No animation needed beyond the existing `.14s` transitions — this is filtering, not decoration, and it's the single highest-leverage addition on the page.

### P1-2. No "copy all" / bulk action for the whole-team or a filtered group
- **Element:** `#whole-team` already has one long copy block; the 23 individual `.cmd`s have no group-level copy.
- **Concrete change:** add a small "copy group" affordance next to each `.group-head` `.chip` (e.g., a `.group-copy` button styled like `.copyhint`) that concatenates that group's phrases with a leading `Head:` framing line, for the (real) case of "I want to brief the whole Design & UX pod at once." Priority P1 not P0 because the whole-team block already covers the most common bulk need — this is a secondary but genuinely useful extension of the existing pattern, not new decoration.

### P1-3. No visible "current section" state in the nav (no scroll-spy)
- **Element:** `.nav a` — six links, no `aria-current` or active styling as the user scrolls through a ~620-line single-page doc.
- **Concrete change:** `IntersectionObserver` on each `h2[id]`/section, toggling `aria-current="location"` (or `.active` class) on the matching `.nav a`, styled with the existing `--accent` token (same treatment as `:hover`/`:focus-visible` already defined) so no new color is introduced. This is orientation, not decor — on a single long page with a sticky nav, "where am I" is a real usability gap.

### P1-4. Org-chart chips read as raw identifiers, not scannable labels
- **Element:** `.agents a` — full `transition-interactive-*` strings repeated 23 times across map + command list.
- **Why:** it's correct and searchable (good for the copy affordance) but it's visually noisy for "someone landing cold" trying to read the org chart as a *map*, which is the stated purpose of that section per its own `.section-sub` copy.
- **Concrete change:** keep the full string as the `href`/accessible name, but visually show only the suffix after `transition-interactive-` (e.g., `ux-architect`) with the common prefix implied by context (the map's own heading, plus a one-line legend). This also resolves P0-2's overflow risk without truncation tricks, since the visible string shortens dramatically (avg. ~14 chars vs. ~40).

### P1-5. `.cmd` full-string IDs generated only by JS (no HTML fallback ids)
- **Element:** inline script, `btn.id = 'cmd-' + nm.textContent.trim()` — the 23 `#cmd-transition-interactive-*` anchors referenced from `.agent-link href`s in the org chart exist **only** after JS runs.
- **Why P1 not P0:** JS is same-document and runs before any user interaction is possible (script is at the end of body, DOM already parsed), so in normal operation it's fine. But it's fragile: any JS error earlier in the file (there isn't one today, but this is a single self-contained doc with no test harness) silently breaks all 23 org-chart deep links with no fallback, and external deep links (e.g., someone bookmarks/shares `#cmd-transition-interactive-ai-engineer`) depend entirely on JS executing first, which is also true for no-JS/archive.org snapshots.
- **Concrete change:** hardcode `id="cmd-transition-interactive-x"` directly on each `<button class="cmd">` in the HTML; keep the JS as a defensive fallback only (`if(!btn.id){...}`, which is already how it's written — just also emit the ids server-side/statically).

---

## P2 — Nice to have

### P2-1. No "skip to main content" link
- **Element:** top of `<body>`, before `.topband`.
- **Change:** add a visually-hidden-until-focus `<a class="skip-link" href="#structure">Skip to content</a>` before the sticky nav, standard pattern, near-zero visual cost, real benefit for keyboard/screen-reader users navigating past the hero + 6-link nav on every page load.

### P2-2. Per-group collapse for the 23-command list
- **Element:** `.group` blocks in `#agents`.
- **Change:** optional, only after P1-1 (search) ships — if search already solves "find the right command fast," collapse is a smaller marginal win. If pursued, use native `<details>/<summary>` (free keyboard support, free `prefers-reduced-motion` compliance, no JS needed) rather than a custom disclosure widget.

### P2-3. Group dot contrast (WCAG 1.4.11 non-text contrast) unverified for `--g-content` and `--g-util` against `--surface`/`--header-bg`
- **Element:** `--g-content:#3d72a8`, `--g-util:#7a828c` used as small (6–8px) `.dot` backgrounds on `--surface`(`#FFFFFF`)/`--header-bg`(`#E8ECFA`) in light mode.
- **Why P2 not P0:** these dots are decorative/redundant with adjacent text labels (`.chip`/`.branch-label` text carries the same information), so they likely don't trigger a strict WCAG failure, but they're borderline (~2.8–3.2:1 by eye) against the 3:1 non-text contrast minimum for meaningful graphical objects. Hand to `transition-interactive-audit-design` for exact ratio measurement before shipping a brand-book update.
- **Change if confirmed failing:** darken `--g-content`/`--g-util` by ~10% luminance in light mode only (dark-mode variants already look fine, lighter tones against a dark ground).

### P2-4. `#toast` position risks overlapping the last `.reminders`/footer content on short viewports
- **Element:** `#toast{position:fixed; bottom:24px}`.
- **Change:** low risk since it's transient (1.4s) and `pointer-events:none` when hidden, but on very short mobile viewports mid-scroll it can visually collide with the last reminder card's text. Consider `bottom:max(24px, env(safe-area-inset-bottom))` for notched devices — copy the same safe-area pattern already used correctly on `.nav`.

---

## Information architecture note (not a code change — direction only)

The section order (hero → org chart → real slash commands → call-one-agent → whole-team → briefings → install → setup → reminders) is correct for a cold visitor: orientation (map) before action (copy commands) before advanced flows (install elsewhere). Two adjustments worth the Head's consideration:

1. **"Real slash commands" table is currently sandwiched between the org chart and the 23-agent list**, but it's the *least* used content on the page (3 rows, mostly meta) — it interrupts the map → commands flow. Consider moving it to a smaller, less prominent treatment (e.g., folded into the `.rule-note` or placed right before "Install," near `/hooks` which is install-adjacent) so the org chart flows directly into "Call one agent," the page's real payload.
2. **"How to set it up"** (`#setup`) is heavy (5 `.ctx` cards, each with steps + a ready prompt) and sits after Install, which already has 3 of its own copy blocks — there's real content duplication (the same "Copy the .claude/ folder..." command appears near-verbatim in `#install` and again inside `#setup` cards ①②③). This isn't wrong, but a single visible entry point that says "which of these 5 paths matches you" (a 2-second decision aid — new project vs. existing repo vs. claude.ai vs. Claude Design) before the wall of cards would reduce redundant reading for a repo that clearly already knows this content is dense enough to need six nav anchors.

Neither is a blocking issue; both are P2-tier structural refinements the Head can defer.

---

## Priority Summary Table

| ID | Priority | Element | Change |
|---|---|---|---|
| P0-1 | P0 | document root | Add `<!DOCTYPE html>`, `<html lang="en">`, `<meta charset>`, `<meta viewport>` |
| P0-2 | P0 | `.agents a, .agents span` | Remove `white-space:nowrap`; long chips overflow at 320px |
| P0-3 | P0 | `.nav` / `scroll-margin-top` | Nav wraps to multiple rows at small widths, breaking anchor offsets; make nav height predictable (single scrollable row) or compute offset dynamically |
| P1-1 | P1 | `#agents` section | Add search/filter input over the 23 commands |
| P1-2 | P1 | `.group-head` | Add per-group "copy group" action |
| P1-3 | P1 | `.nav a` | Add scroll-spy `aria-current`/active state |
| P1-4 | P1 | `.agents a` text | Shorten visible label to suffix after common prefix |
| P1-5 | P1 | `.cmd` ids | Hardcode ids in HTML, keep JS as fallback only |
| P2-1 | P2 | body start | Add skip-to-content link |
| P2-2 | P2 | `.group` | Optional `<details>` collapse per group (after P1-1) |
| P2-3 | P2 | `--g-content`, `--g-util` dots | Verify/adjust non-text contrast vs. surface |
| P2-4 | P2 | `#toast` | Respect `env(safe-area-inset-bottom)` |
