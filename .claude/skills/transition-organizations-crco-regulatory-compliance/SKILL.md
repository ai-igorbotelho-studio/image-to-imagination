---
name: transition-organizations-crco-regulatory-compliance
description: Sector-specific regulatory regimes for regulated businesses — banking/insurance prudential rules, health authority licensing, energy market regulation, AML/KYC and sanctions. Load when crco needs depth on a specific regulatory regime.
---
# Sector Regulatory Compliance — TRANSITION-ORGANIZATIONS

Owner: `crco` · Collaborates with: `clo` (non-prudential legal matters), `cfo` (capital/solvency
and reporting), `cto` (model risk and regulatory technology), `csuso` (climate-related financial
disclosure regimes)

## Mission

Translate the specific regulatory regime a business is licensed under — banking or insurance
prudential rules, health-sector licensing, energy market regulation, or a cross-sector AML/KYC and
sanctions regime — into concrete, dated obligations, and flag the gap between what the business
does today and what the regime requires.

This is the sector-specific complement to `transition-organizations-clo-grc-enterprise-risk`
(the general enterprise risk register) and `transition-organizations-clo-compliance-ethics`
(integrity and whistleblowing): this skill is about the licensed regime itself.

## Scope

**Includes:**
- Identifying which regulator(s) and regime(s) apply, by jurisdiction and by activity (a
  multi-country or multi-license business can carry several at once).
- Prudential requirements for financial institutions: capital adequacy, solvency, liquidity,
  large-exposure limits, and reporting cadence to the regulator.
- Health-sector licensing and accreditation: facility and practitioner licensing, clinical data
  handling regimes (e.g., HIPAA-equivalent), and health-authority reporting obligations.
- Energy-sector market regulation: generation/distribution licensing, market conduct rules, and
  environmental-permit conditions tied to the license.
- AML/KYC and sanctions-screening program design and testing, where the sector or the payment
  rails involved require one.
- Building and maintaining the licensing and regulatory-filing calendar, with renewal dates and
  the owner accountable for each filing.
- Regulatory exam and audit readiness: mapping open findings, remediation deadlines and evidence
  trails.

**Does not include:**
- The general enterprise risk register and risk appetite statement (→
  `transition-organizations-clo-grc-enterprise-risk`).
- Whistleblower channel and general ethics program design (→
  `transition-organizations-clo-compliance-ethics`).
- Corporate, contractual, IP or non-regulatory privacy law (→ the relevant `clo-*` skill).
- Actually filing with a regulator, signing an attestation, or acting as the compliance officer
  of record where the jurisdiction requires a licensed individual in that role — this skill
  prepares the analysis; the filing and sign-off require explicit human approval by the
  accountable licensed individual.

## Methods and frameworks (when to use each one)

- **Regulatory mapping by jurisdiction and activity** — before anything else, list every
  regulator and regime that actually applies; do not assume a single home-country regime covers a
  multi-jurisdiction business.
- **Capital/solvency/liquidity adequacy frameworks** (e.g., Basel-style capital rules for
  banking, solvency regimes for insurance) — apply only the version and jurisdiction that
  actually govern this business; cite the specific regulator's current rulebook, not a generic
  summary.
- **Three-lines-of-defense model** — verify the independence of the compliance/risk function
  (second line) from the business line (first line) is real, not nominal.
- **AML/KYC risk-based approach (FATF-aligned)** — calibrate screening intensity to customer,
  product and geography risk rather than applying one uniform level to everything.
- **Regulatory exam readiness assessment** — walk through what an examiner would ask for, and
  identify the evidence gaps before the regulator does.

Each framework is applied with the Context Protocol (3.1): explicit assumptions in **bold**,
at most 3 questions per round, and the most likely scenario assumed when there is no answer.
- **Scenario simulation and systemic stress-testing** — model second- and third-order shocks and feedback loops across the portfolio, not just isolated single-point failures.

## Diligence checklist

1. Which regulator(s) and regime(s) apply, in which jurisdictions, for which specific activities?
2. What is the current capital/solvency/liquidity position versus the regulatory minimum, and
   the trend?
3. Is the compliance/risk function's independence from the business line real (reporting line,
   veto, budget) or nominal?
4. What open findings exist from the last regulatory exam, and are remediation deadlines being
   met?
5. Is the AML/KYC and sanctions-screening program risk-based and tested, or a checkbox exercise?
6. What is the licensing and filing calendar for the next 12 months, and who owns each item?
7. What would trigger a regulator-mandated remediation plan or a license condition, and how close
   is the business to that trigger?
8. What is the reversal or escalation trigger if a compliance gap is found mid-cycle?

## Deliverables

**Regulatory obligation map and exam-readiness report**, with a minimum structure:
- Context and labeled assumptions (`fact` / `estimate` / `assumption`).
- Regulator-by-regulator, regime-by-regime obligation list with dates and accountable owner.
- Gap analysis: what the regime requires versus what the business currently does.
- BLUF (Recommendation → Why → What needs to be true → Risks and reversal trigger → Next steps).
- Explicit flag on every item requiring sign-off by a licensed compliance officer, actuary, or
  outside counsel.
- Sustainability Lens block (Section 3.5 of the shared skill).
- State explicitly the resource saved (time, cost, rework avoided) by this deliverable and confirm the recommended option is actually implementable now with the company's real resources — not only theoretically optimal.

## Metrics

Regulatory-compliance metrics, always with numerator, denominator and period, labeled
`fact`/`estimate`/`assumption`: open findings past deadline, capital/solvency buffer above
minimum, AML/KYC alerts investigated within SLA, licenses in good standing versus total held, and
time-to-close on regulatory filings.

## Common pitfalls

- Assuming one regime covers a business that actually operates under several, across
  jurisdictions or licensed activities.
- Treating a compliance program as satisfied because a policy document exists, without testing
  whether it is followed.
- Letting the compliance/risk function report into the business line it is meant to oversee.
- Missing that a license condition (e.g., an environmental permit tied to an energy license) is
  itself a regulatory obligation, not just an operational one.
- Presenting a capital or solvency position without showing the trend and the buffer over time.

## Primary sources (verify validity and date before citing)

- The specific regulator's current rulebook, licensing conditions and exam findings — always cite
  the version and verification date from the official source; regulatory regimes change and a
  stale citation is worse than none.
- `transition-organizations/company-profile.md` for the business's actual sector, jurisdictions
  and licenses held.
- The `transition-organizations-shared-protocols` skill and its `references/sustainability-canon.md`
  for the sustainability canon shared by all agents.
