# Evaluation Scenarios (Evals) — TRANSITION-ORGANIZATIONS

Scenarios from Section 11 of the specification. Verification rule: all, except #8, must end with
the Sustainability Gate's opinion logged. Each row records the **expected** routing (from the
specification) and the **observed** routing (to be filled in when running the real scenario with
the orchestrating CEO in this Claude Code session).

| # | Test request | Expected routing | What must appear | Observed routing | Status |
|---|---|---|---|---|---|
| 1 | Is it worth getting B Corp certified in the next 12 months? | ceo → ccert + csuso + clo + cfo (+ chro) | New standards, gap per topic, bylaw amendment, total cost, trade-off | [to fill in] | pending |
| 2 | I want to convert the company to steward ownership. | ceo → csuso + clo + cfo + chro → board | Legal design per jurisdiction, impact on fundraising, one-way door, legal validation | [to fill in] | pending |
| 3 | We need to cut costs by 20%. | ceo → cfo + coo + chro (+ holistic-health) + csco + departments' AI specialists | Three Horizons, what not to cut (H3), social impact, sequencing | [to fill in] | pending |
| 4 | Can we announce that we're carbon neutral? | ceo → csuso + cmo + clo + ccert | Mitigation hierarchy, ISO 14068-1, VCMI, green-claims rules, likely recommendation not to use the claim without grounds | [to fill in] | pending |
| 5 | I want to issue a blue bond to finance aquaculture. | ceo → cfo + csuso (blue economy) + clo + ccert | ICMA/UNEP FI principles, eligibility, MSC/ASC, impact due diligence | [to fill in] | pending |
| 6 | How do we roll out AI in customer service? | ceo → cdaio + cro + cto + clo | ROI, governance, privacy, human-in-the-loop | [to fill in] | pending |
| 7 | What should the price of our new line be? | ceo → cfo + cro + cmo + cpo | Value-based pricing, margin, provable sustainable premium | [to fill in] | pending |
| 8 | What is the capital of New Zealand? | CEO answers directly, no delegation and no gate | Proportionality: no Executive Sprint for a simple question | [to fill in] | pending |
| 9 | How does a change of government in the country affect our expansion? | ceo → board (policy-geopolitics, economist, investor) + cos + cfo → csuso | Plural, nonpartisan scenarios, effects on regulation, FX, and demand | [to fill in] | pending |
| 10 | Should we put 10% of cash into Bitcoin? | ceo → digital-assets + cfo + clo → csuso → board (deliberation) | No personalized recommendation; stress scenarios; runway; custody; accounting/taxes; board-set limit; energy | [to fill in] | pending |
| 11 | Launch cosmetics with a traditional indigenous ingredient. | ceo → cino + rnd + csuso (Bioeconomy and Regeneration) + clo → board (communities) | FPIC, applicable biodiversity/traditional-knowledge law and the Nagoya Protocol, benefit sharing, biopiracy risk, `BLOCK` until consent is obtained | [to fill in] | pending |
| 12 | Team exhausted after three quarters of aggressive targets. | ceo → chro → holistic-health + cos + cfo → csuso | Holistic Health Lens, work-design change before well-being, turnover cost | [to fill in] | pending |
| 13 | Where can AI cut cost in finance? | ceo → cfo → cfo-ai-automation (+ cdaio) → csuso | Process map, business case with baseline, pilot, kill criterion | [to fill in] | pending |
| 14 | Is it worth building our own R&D lab? | ceo → cino → rnd + cfo + chro → csuso | Build vs. academic partnership, funding and incentives, TRL, portfolio, kill criteria | [to fill in] | pending |
| 15 | How are beverage consumption habits changing? | ceo → cculture + cmo + cpo + cino → csuso | Trends with evidence grade and counter-signals, differences by market, implications per department | [to fill in] | pending |
| 16 | Enter the Japanese market with our brand. | ceo → cculture (cross-cultural, semiotics) + cmo + cro + clo + cfo → csuso | Cultural due diligence, brand and product adaptation, stereotype risks | [to fill in] | pending |
| 17 | Merger with another company causing friction between teams. | ceo → cculture (organizational anthropology) + chro (+ holistic-health) + cos → csuso | Subculture diagnosis, integration rituals, effects on people's health | [to fill in] | pending |

## How to run

For each scenario, invoke `/ceo` with the test request in the main Claude Code session (the
`transition-organizations-ceo` agent as the primary agent), record in "Observed routing" the
C-Levels and skills actually triggered, and mark "Status" as `ok` (matches expectation), `partial`
(routed but missing a piece), or `adjust` (needs a change to some agent's/skill's `description` to
improve routing).

**Limitation of this delivery:** the 17 scenarios were designed and documented in this table, but
were not run end-to-end in this file-generation session (there is no "ceo" primary agent running
within this file-creation task — this work was done by a scaffolding agent). Running the
scenarios is the recommended next step, with the user invoking `/ceo` (or the configured primary
agent) in a real session, and updating this table with the results.
