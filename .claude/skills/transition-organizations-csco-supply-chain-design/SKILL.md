---
name: transition-organizations-csco-supply-chain-design
description: Designing a supply chain from zero — network design, make-vs-buy, sourcing strategy, facility location and initial capacity. Load when csco needs depth on building a new supply chain (new product, new market, new business, greenfield).
---
# Supply Chain Design (Zero-to-One) — TRANSITION-ORGANIZATIONS

Owner: `csco` · Collaborates with: `cfo` (CAPEX/OPEX and WACC), `cpo` (product architecture and
BOM), `csuso` (sourcing footprint and EUDR/CSDDD exposure), `clo` (contracts and trade
compliance), `cino` (venture-building supply needs)

## Mission

Design a supply chain from a blank page: turn a product, a new market entry, or a new business
line into a sourcing, make/buy, network and capacity architecture that is fundable, resilient,
and ready to operate — before the first unit ships.

This is distinct from `transition-organizations-csco-supply-chain-management` (which runs a
chain that already exists): this skill is for the zero-to-one decision — what to build, where,
with whom, and at what minimum viable scale.

## Scope

**Includes:**
- Make-vs-buy and vertical-integration analysis for each stage of the value chain.
- Sourcing strategy design: single vs. dual vs. multi-sourcing, supplier archetype (contract
  manufacturer, distributor, direct mill/farm), and initial category strategy (Kraljic).
- Network design: number, size and location of facilities (plants, DCs, cross-docks), using
  center-of-gravity and total-landed-cost modeling.
- Initial capacity planning: minimum viable scale, ramp-up curve, and the CAPEX/OPEX trade-off
  with `cfo`.
- Technology stack selection for a new operation (ERP/WMS/TMS/control tower) sized to the
  company's actual porte (Section 1.4) — never over-engineered for a pre-seed business.
- RFP/RFQ design and supplier shortlisting criteria for first-wave sourcing.
- Incoterms and trade-lane selection for the initial network.

**Does not include:**
- Running day-to-day operations of an existing network (→
  `transition-organizations-csco-supply-chain-management`).
- Quantifying ongoing risk exposure of a live chain (→ `transition-organizations-csco-supply-chain-risk`).
- Scouting new technologies for an existing chain (→ `transition-organizations-csco-supply-chain-innovation`).
- Contract law and trade compliance drafting — see `transition-organizations-clo-contracts-commercial`
  and `transition-organizations-clo-ip-regulatory`.
- Operational execution, contract signing or financial commitments without explicit human approval.

## Methods and frameworks (when to use each one)

- **Make-vs-buy / vertical integration analysis** — use whenever a stage of the chain could be
  built internally or outsourced; quantify with total cost of ownership, not unit price alone.
- **Kraljic matrix** — classify each input category (leverage, strategic, bottleneck, routine)
  before deciding sourcing strategy for it.
- **Center-of-gravity / network optimization modeling** — for facility location when there are
  3+ candidate sites or demand is geographically distributed.
- **Total landed cost (TLC)** — freight, duties, inventory carrying cost and lead-time risk, not
  just FOB price, when comparing sourcing geographies.
- **Minimum viable scale / ramp-up curve** — size day-one capacity to funded demand plus a
  declared buffer, never to a five-year forecast.
- **Should-cost modeling** — build an independent cost estimate for a component or service before
  negotiating with a supplier, especially for strategic/bottleneck categories.
- **Digital twin / discrete-event simulation** — only justified above a complexity and capital
  threshold; flag as over-engineering below it.

Each framework is applied with the Context Protocol (3.1): explicit assumptions in **bold**,
at most 3 questions per round, and the most likely scenario assumed when there is no answer.
- **System Dynamics / network simulation** — model stocks, flows and delays across the network to anticipate bullwhip effects and second-order disruption impacts.

## Diligence checklist

1. What volume and service level must the network support at launch, and at what horizon (H1)?
2. Which stages are candidates for vertical integration, and what does total cost of ownership
   say versus outsourcing?
3. What is the minimum number of suppliers/facilities that avoids single-point-of-failure risk
   without over-capitalizing the network?
4. What jurisdictions, trade agreements, tariffs and compliance regimes (EUDR, CSDDD, sanctions)
   touch this network?
5. What is the CAPEX/OPEX split, and what does `cfo` need to see to size the funding ask?
6. What is the ramp-up curve, and what triggers the next capacity investment?
7. What would need to be true for this network design to fail within 18 months?
8. What is the reversal trigger if a sourcing or location decision turns out wrong?

## Deliverables

**Supply chain design memo**, with a minimum structure:
- Context and labeled assumptions (`fact` / `estimate` / `assumption`).
- Make-vs-buy decision per value-chain stage, with total-cost-of-ownership math shown.
- Proposed network (facilities, suppliers, trade lanes) with a map or table, and the
  center-of-gravity or TLC logic behind it.
- Capacity and ramp-up plan tied to funded demand.
- BLUF (Recommendation → Why → What needs to be true → Risks and reversal trigger → Next steps).
- Sustainability Lens block (Section 3.5 of the shared skill).
- State explicitly the resource saved (time, cost, rework avoided) by this deliverable and confirm the recommended option is actually implementable now with the company's real resources — not only theoretically optimal.

## Metrics

Design-stage metrics, always with numerator, denominator and period, labeled `fact`/`estimate`/
`assumption`: projected landed cost per unit, capital intensity (CAPEX per unit of capacity),
supplier concentration (% of spend with top supplier per category), time-to-first-shipment, and
break-even utilization.

## Common pitfalls

- Designing for a five-year demand forecast instead of funded, near-term volume.
- Choosing a sourcing geography on unit price alone, ignoring landed cost and lead-time risk.
- Single-sourcing a bottleneck or strategic category to save a small margin on price.
- Selecting an ERP/WMS/TMS stack sized for a much larger company than the one being served.
- Skipping trade-compliance screening (sanctions, forced labor, EUDR) before shortlisting suppliers.

## Primary sources (verify validity and date before citing)

- Trade agreements, tariff schedules and compliance regimes relevant to the candidate
  geographies — always cite the version and verification date from the official source.
- `transition-organizations/company-profile.md` for business context and funded scale.
- The `transition-organizations-shared-protocols` skill and its `references/sustainability-canon.md`
  for the sustainability canon shared by all agents.
