# Grow & Measure — transition-interactive-commands.html

Author: transition-interactive-growth-lead
Date: 2026-09-22

## 0. What this page actually is

`transition-interactive-commands.html` is a **private, static reference artifact** — a command
palette for one user (the person operating Claude Code) to find and copy the right
natural-language trigger for one of 33 subagents, 7 briefing bundles, plus install/setup
instructions. There is no server, no audience beyond its owner, no traffic acquisition,
and no conversion in the commercial sense. Treating it like a marketing landing page would
be a category error. The job below is scoped to that reality.

## 1. Success = job-to-be-done for a command palette

**Primary JTBD:** "I know roughly what I want the team to do — let me find the exact
command, in the right form (single agent vs. bundle vs. full pipeline), and get it into my
clipboard, without re-reading the whole page or picking the wrong scope."

A good version of this page succeeds on:

1. **Time-to-correct-command** — how many seconds/scans from landing (or from the filter
   box) to copying the command that actually matches intent. Filter-first flows should
   resolve in under ~10s; browse flows (no filter used) should resolve within one section
   scroll.
2. **Copy-success on first pick (no immediate re-copy of a different command)** — a proxy
   for "did the user grab the right granularity the first time" (single agent vs. bundle
   vs. whole-pipeline vs. A→G master command). A same-session re-copy of a *different*
   command right after the first is a signal the first one was wrong for the job.
3. **Web-vs-app and invocation-level comprehension without scrollback** — can a first-time
   reader, using only the hero + `webapp-note` + golden-rule box (i.e., without scrolling
   up again later), correctly answer: (a) is this a slash command or natural language? (b)
   do I need bundle A–F or bundle G? This is testable qualitatively (5-second/first-view
   test) even without instrumentation — see improvement #2 below.
4. **Zero wrong-tool copies** — the user never copies `/command-name` syntax expecting it
   to invoke a subagent (the page explicitly corrects this misconception in the "Real slash
   commands" section and the golden-rule note) — i.e., the page prevents a known
   misuse-of-the-tool failure mode, not just informs.

These are the "North Star + inputs" for a tool page: the North Star is *time-to-correct-
command*; the others are leading indicators/guardrails for it.

## 2. What does NOT apply, and why

- **GA4 / event analytics** — no backend, no hosting with a request log, single known user.
  There is no population to aggregate; an "event" would just be a diary entry about oneself.
- **Funnels / conversion rate** — there is no multi-step commercial funnel (visit → signup →
  purchase). The only "funnel" is find → copy → paste into Claude Code, which happens
  outside the page (in the chat), so it's unobservable from the artifact itself.
- **Retention / DAU-MAU / cohort metrics** — a single operator reopens this page on their
  own cadence; retention curves are meaningless at n=1 with no session boundary definition.
- **SEO ranking / organic traffic** — the file is not published, not indexed, not linked
  from anywhere crawlable. Keyword/meta strategy has no audience to reach.

Calling these out explicitly matters because it would be easy to cargo-cult "add GA4 +
Search Console" onto any HTML file; doing so here would be pure vanity instrumentation with
no decision attached to it.

## 3. If this page ever became public — minimal "if public" instrumentation note

Not to build now; only relevant if the artifact is exposed (e.g., published as a public
reference for other Claude Code users of this agent pack).

- **Events (client-side, privacy-light):**
  - `filter_used` (query length bucket, whether it ended in 0 results)
  - `command_copied` (command id/group, whether via filter or browse, position in page)
  - `bundle_expanded` (which bundle A–G)
  - `nav_section_clicked` (which of Structure/Agents/Whole team/Briefings/Install/Setup)
- **Minimal funnel:** `page_view → (filter_used | nav_section_clicked) → command_copied`.
  The single conversion event worth tracking is `command_copied`; everything else is a
  leading signal toward it.
- **One useful public-only metric:** rate of `filter_used` sessions that end in
  `no_hits_shown` with no subsequent copy — a direct signal of missing/mis-named agents or
  vocabulary mismatch between what users search and how agents are named.
- Keep it to a single lightweight, cookie-less, self-hosted or privacy-respecting event
  pipe (e.g., Plausible custom events) — no full GA4 stack for a page this narrow in scope.

## 4. Concrete improvements to raise the signals in (1)

1. **Make the filter box the primary retrieval path and default to it.** It already exists
   and is the fastest path to "time-to-correct-command," but the page currently gives equal
   visual weight to browsing the org chart first. Two cheap wins: (a) autofocus the filter
   on load (or at least move it above the "Team structure" org-chart section, since a user
   who already knows the agent name shouldn't have to scroll past a diagram to reach the
   search), and (b) make the `no-hits` state suggest the nearest bundle or the Head fallback
   command instead of a dead end — this directly protects signal (1) and (4).

2. **Add one explicit "which command size do I want?" decision aid near the top** (before
   Structure), e.g., a 3-line decision list: "One task → single agent below. A phase of work
   → a Briefing bundle. Everything, gated → the A→G master command." This is the single
   highest-leverage change for signal (3): right now that distinction is implicit across
   three separate sections (Agents / Whole team / Briefings) and a first-time reader has to
   infer it by scrolling through all three before choosing correctly, which is exactly the
   scrollback failure this page should prevent.

## Scope note

This document is a recommendation only; the growth-lead pod does not modify
`transition-interactive-commands.html`. Implementation is the Head's/design-eng's call.
