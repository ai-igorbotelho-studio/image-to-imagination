---
name: transition-organizations-csco-supply-chain-management
description: Running and improving a supply chain that already exists — S&OP/IBP execution, supplier performance, inventory optimization, cost-to-serve. Load when csco needs depth on managing an established supply chain.
---
# Supply Chain Management (Steady-State Operations) — TRANSITION-ORGANIZATIONS

Owner: `csco` · Collaborates with: `coo` (operational excellence and quality), `cfo` (working
capital and cost-to-serve), `cdaio` (demand forecasting and analytics), `csuso` (supplier ESG
performance)

## Mission

Keep an already-built supply chain performing: balance service level, cost and working capital
day to day, run the S&OP/IBP cadence, manage supplier performance, and decide when the existing
network needs to evolve rather than be replaced.

This is distinct from `transition-organizations-csco-supply-chain-design` (zero-to-one network
design): this skill assumes the network, suppliers and facilities already exist and focuses on
running and continuously improving them.

## Scope

**Includes:**
- Sales & Operations Planning / Integrated Business Planning (S&OP/IBP) cadence: demand review,
  supply review, reconciliation, executive S&OP.
- Supplier performance management: SLAs, scorecards, business reviews, and escalation paths.
- Inventory policy: safety stock, ABC/XYZ segmentation, reorder points, and working-capital impact.
- Service-level management: OTIF, fill rate, order cycle time, and root-cause of misses.
- Cost-to-serve analysis by channel, customer or SKU, and continuous-improvement backlog
  (Lean/Kaizen) fed by it.
- Exception management: what triggers escalation to `csco` versus resolution at the operating
  level.
- Contract renewal cycles and supplier renegotiation triggers (cost, performance, risk).
- Deciding when steady-state tuning is no longer enough and the network needs to go back through
  `transition-organizations-csco-supply-chain-design`.

**Does not include:**
- Designing a new network, facility footprint or sourcing strategy from scratch (→
  `transition-organizations-csco-supply-chain-design`).
- Quantifying tail-risk exposure, disruption scenarios or resilience scoring (→
  `transition-organizations-csco-supply-chain-risk`).
- Piloting new technologies or business models in the chain (→
  `transition-organizations-csco-supply-chain-innovation`).
- Warehousing/inventory system detail already covered by
  `transition-organizations-csco-warehousing-inventory`, or transport network detail covered by
  `transition-organizations-csco-logistics-distribution` — this skill sits one level up, at the
  cross-functional planning and performance-management layer.

## Methods and frameworks (when to use each one)

- **S&OP / IBP (5-step cycle)** — the default monthly cadence for balancing demand and supply;
  escalate only true conflicts to executive S&OP.
- **ABC/XYZ inventory segmentation** — combine value (ABC) and demand variability (XYZ) to set
  differentiated safety-stock and review-frequency policies.
- **OTIF and fill-rate tracking with root-cause taxonomy** — never report a service metric without
  the taxonomy of why it missed (supplier, forecast, capacity, transport).
- **Supplier scorecards (cost, quality, delivery, responsiveness, ESG)** — reviewed on a cadence
  proportional to spend and criticality (Kraljic category).
- **Cost-to-serve analysis** — segment cost by customer/channel/SKU before deciding on pricing,
  service tiers or channel strategy with `cro`/`cfo`.
- **Theory of Constraints** — identify the one bottleneck actually limiting throughput before
  investing broadly across the chain.

Each framework is applied with the Context Protocol (3.1): explicit assumptions in **bold**,
at most 3 questions per round, and the most likely scenario assumed when there is no answer.
- **System Dynamics / network simulation** — model stocks, flows and delays across the network to anticipate bullwhip effects and second-order disruption impacts.

## Diligence checklist

1. What is the current OTIF/fill-rate, and what is the dominant root cause of misses?
2. What does the S&OP cadence actually decide today, and where does it stall or get skipped?
3. Which suppliers are under-performing against SLA, and what is the escalation or exit plan?
4. What is inventory doing to working capital (days of supply, carrying cost) versus the target?
5. Which cost-to-serve segments are structurally unprofitable, and why has that not been acted on?
6. Is the current performance gap a tuning problem (this skill) or a design problem (→
   `transition-organizations-csco-supply-chain-design`)?
7. What would need to be true for the current network to keep working for the next 12 months?
8. What is the reversal trigger if a supplier renegotiation or policy change underperforms?

## Deliverables

**S&OP operating model, supplier performance framework, cost-to-serve report**, with a minimum
structure:
- Context and labeled assumptions (`fact` / `estimate` / `assumption`).
- Current-state metrics (OTIF, inventory, cost-to-serve) with root-cause breakdown.
- BLUF (Recommendation → Why → What needs to be true → Risks and reversal trigger → Next steps).
- A prioritized improvement backlog with owner, deadline and expected impact per item.
- Sustainability Lens block (Section 3.5 of the shared skill).
- State explicitly the resource saved (time, cost, rework avoided) by this deliverable and confirm the recommended option is actually implementable now with the company's real resources — not only theoretically optimal.

## Metrics

Steady-state metrics, always with numerator, denominator and period, labeled `fact`/`estimate`/
`assumption`: OTIF %, fill rate %, inventory turns, days of supply, cost-to-serve per order/SKU,
supplier scorecard score, and forecast accuracy (MAPE/bias).

## Common pitfalls

- Running S&OP as a reporting ritual instead of a decision forum with real trade-offs.
- Treating every service miss as a supplier problem without checking forecast and capacity first.
- Optimizing inventory turns without checking the service-level trade-off it creates.
- Renewing an underperforming supplier contract by default because switching feels disruptive.
- Reaching for a full network redesign when the real fix is a tuning change to policy or cadence.

## Primary sources (verify validity and date before citing)

- Supplier contracts, SLAs and performance data internal to the business — verify recency before
  citing.
- `transition-organizations/company-profile.md` for business context.
- The `transition-organizations-shared-protocols` skill and its `references/sustainability-canon.md`
  for the sustainability canon shared by all agents.
