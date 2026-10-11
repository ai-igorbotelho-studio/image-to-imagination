# SETUP PROMPT — paste into Claude Code

> Use this prompt in a Claude Code session opened at the **root of the repository**
> `ai-igorbotelho-studio/transition-brands`, where the GLOBAL TEAM already lives.

---

You are setting up the **TRANSITION BRANDS GLOBAL TEAM** of Active Transition in this repository. I am Igor Botelho, the
Founder. Follow these steps in order and stop to ask me whenever a step says so.

**Rules for this session**
- Never delete, move or overwrite any existing file without showing me the exact change and asking first.
- Never delete files anywhere; if something looks wrong, list it and ask me.
- Do not change the content of the agent files unless a validation error requires it; if so, show me
  the diff first.

**Step 1 — Inspect**
1. Confirm you are at the repository root (`git remote -v` shows `ai-igorbotelho-studio/transition-brands`).
2. Confirm the current branch and working tree status (`git status`). Report both.
3. Confirm the repository root contains: `CLAUDE.md`, `README.md`, `SETUP-PROMPT.md`,
   `.claude/agents/transition-brands/` (54 `.md` files, each named `transition-brands-<function>.md`), `studio/active-transition-context.md`,
   `studio/founder-decisions.md`, `templates/brief.md`, `projects/.gitkeep`.
   If anything is missing, stop and tell me.

**Step 2 — Validate the organization**
1. For every file in `.claude/agents/transition-brands/`, check that the YAML frontmatter is the first thing in
   the file and parses, and that `name` and `description` exist. `name` must match the file name, and
   both must carry the `transition-brands-` prefix.
2. Check that the 54 names are unique and include exactly these five leaders:
   `transition-brands-executive-creative-director`, `transition-brands-chief-strategy-officer`, `transition-brands-cfo`, `transition-brands-chief-commercial-officer`,
   `transition-brands-general-counsel`.
3. Check that every subagent name mentioned in `CLAUDE.md` (org chart and flows) exists as a file.
4. Report the results as a table: check · result · action needed.

**Step 3 — Discovery**
Claude Code discovers `CLAUDE.md` and `.claude/agents/transition-brands/` from the directory where a session starts.
1. Explain to me in two sentences how to start the team: `cd transition-brands && claude`.
2. Ask me whether I also need the team available when sessions start elsewhere (for example,
   another repository, or Claude Code on the web against a different repo). If I say yes, propose the
   least invasive option, show exactly what would be created, and wait for my approval before creating
   anything.

**Step 4 — Commit and push (only with my approval)**
1. Show me the list of files to be committed.
2. Ask me which branch to use.
3. After I approve, commit with a clear message describing the change.
4. Ask for explicit confirmation before `git push`. Use my existing git credentials; never ask me to paste
   tokens or passwords into the chat.

**Step 5 — First run check**
Tell me the exact command to start the team and suggest this first command to the CEO:
"Read the canonical context, confirm the organization is complete, and list the open items that need my
decisions, ranked by business impact."
