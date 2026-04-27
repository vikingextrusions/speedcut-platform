# ROOT_PLAN.md — Speedcut Platform

> **Platform:** Xometry-class instant quoting & manufacturing marketplace  
> **Managed by:** @manager (`gemini-2.0-pro`)  
> **Last synced:** 2026-04-22  
> **Version:** 1.0.0

---

## Platform Vision

Speedcut is an AI-powered digital manufacturing platform specialising in CNC machining (milling & turning) and Wire EDM (wire erosion & spark erosion). Customers upload STEP/STL files, receive instant geometry-driven quotes, and place orders fulfilled through in-house capacity and a curated partner network. The platform encompasses customer, partner, and admin portals with full lifecycle management from RFQ to delivery.

---

## Epic Registry

| ID | Epic Name | Status | Owner | Progress |
|---|---|---|---|---|
| [EP-001](#ep-001-geometry-analysis-engine) | Geometry Analysis Engine | 🟡 IN PROGRESS | @engineer | 0% |
| [EP-002](#ep-002-dynamic-pricing-engine) | Dynamic Pricing Engine | 🔵 PLANNED | @architect | 0% |
| [EP-003](#ep-003-supplier-portal) | Supplier Portal | 🔵 PLANNED | @architect | 0% |
| [EP-004](#ep-004-order-lifecycle-management) | Order Lifecycle Management | 🔵 PLANNED | @architect | 0% |
| [EP-005](#ep-005-ai-dfm-advisor) | AI DFM Advisor | 🔵 PLANNED | @architect | 0% |

**Overall Platform Completion:**

```
EP-001 █████████░░░░░░░░░░░  45.0%
EP-002 ░░░░░░░░░░░░░░░░░░░░  0.0%
EP-003 ░░░░░░░░░░░░░░░░░░░░  0.0%
EP-004 ░░░░░░░░░░░░░░░░░░░░  0.0%
EP-005 ░░░░░░░░░░░░░░░░░░░░  0.0%
──────────────────────────────
TOTAL  █░░░░░░░░░░░░░░░░░░░  8.0%
```

---

## EP-001: Geometry Analysis Engine

**Status:** 🟡 IN PROGRESS  
**Sprint:** S01  
**Owner:** @engineer  
**Architect:** @architect  
**Sub-plan:** [`docs/plans/EPIC-001-geometry-analysis.md`](docs/plans/EPIC-001-geometry-analysis.md)  
**ADR:** [`docs/adr/ADR-001-geometry-stack.md`](docs/adr/ADR-001-geometry-stack.md)

### Description
Build a robust STEP/STL geometry analysis pipeline that extracts manufacturing-relevant data from uploaded CAD files: volume, surface area, bounding box, wall thickness, feature count, and process recommendations (CNC, sheet metal, 3DP).

### Progress
```
██████████████████░░░░░░░░░░░░░░░░░░░░░░  45.0% Complete
9 of 20 tasks complete
```

### Milestones
| # | Task | Status | SHA | Agent |
|---|---|---|---|---|
| 1.1 | FastAPI geometry service scaffold | ✅ DONE | `fce5ae8` | @engineer |
| 1.2 | PythonOCC STEP parser integration | ✅ DONE | `e5bbc12` | @engineer |
| 1.3 | Volume & surface area extraction | ✅ DONE | `6ab28e7` | @engineer |
| 1.4 | Bounding box & aspect ratio calc | ✅ DONE | `9432512` | @engineer |
| 1.5 | Wall thickness heatmap analysis | ✅ DONE | `2212ba6` | @engineer |
| 1.6 | Feature count & thread detection | ✅ DONE | `2212ba6` | @engineer |
| 1.7 | Process recommendation algorithm | ✅ DONE | `2212ba6` | @engineer |
| 1.8 | STL parser fallback | ✅ DONE | `623600a` | @engineer |
| 1.9 | Async job processing — replace sync endpoint | ✅ DONE | `35bc63c` | @engineer |
| 1.10 | S3 file upload API (multipart, presigned URLs) | ⬜ TODO | — | @engineer |
| 1.11 | Geometry results persistence to Supabase | ⬜ TODO | — | @engineer |
| 1.12 | Redis caching for analysis results (by file hash) | ⬜ TODO | — | @engineer |
| 1.13 | WebSocket progress updates for async jobs | ⬜ TODO | — | @engineer |
| 1.14 | Customer portal: STEP upload UI on `quotes/new` | ⬜ TODO | — | @engineer |
| 1.15 | Customer portal: Analysis results display card | ⬜ TODO | — | @engineer |
| 1.16 | Three.js 3D model viewer (basic, STEP→mesh) | ⬜ TODO | — | @engineer |
| 1.17 | Unit tests: geometry calculation accuracy | ⬜ TODO | — | @tester |
| 1.18 | Integration tests: upload → analyse → persist flow | ⬜ TODO | — | @tester |
| 1.19 | Load test: 20 concurrent uploads (revised down from 50) | ⬜ TODO | — | @tester |
| 1.20 | @manager sign-off & Epic close | ⬜ TODO | — | @manager |

### Definition of Done
- [ ] All file formats (STEP, STL, IGES) parsed without error
- [ ] Analysis completes < 30s for files up to 100MB
- [ ] All geometry data persisted to Supabase
- [ ] TEST_REPORT.md shows zero P0/P1 findings
- [ ] @manager has verified Git SHAs for all tasks

---

## EP-002: Dynamic Pricing Engine

**Status:** 🔵 PLANNED  
**Sprint:** S02  
**Owner:** TBD  
**Architect:** @architect  
**Sub-plan:** [`docs/plans/EPIC-002-pricing-engine.md`](docs/plans/EPIC-002-pricing-engine.md) *(not yet created)*  
**ADR:** [`docs/adr/ADR-002-pricing-model.md`](docs/adr/ADR-002-pricing-model.md) *(not yet created)*

### Description
Implement a geometry-aware dynamic pricing engine that produces instant quotes based on: material selection, manufacturing process, complexity score, volume (batch economics), lead time tier, and supplier margin rules. Must support customer-facing instant quotes and internal cost modelling.

### Progress
```
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0% Complete
0 of 22 tasks complete
```

### Planned Milestones (High Level)
| # | Task | Status |
|---|---|---|
| 2.1 | Pricing model ADR & schema design | ⬜ PLANNED |
| 2.2 | Material database & cost lookup tables | ⬜ PLANNED |
| 2.3 | Base cost calculation (volume × material) | ⬜ PLANNED |
| 2.4 | Complexity multiplier from geometry score | ⬜ PLANNED |
| 2.5 | Batch discount curve implementation | ⬜ PLANNED |
| 2.6 | Lead time tier pricing (standard/express/urgent) | ⬜ PLANNED |
| 2.7 | Supplier margin rule engine | ⬜ PLANNED |
| 2.8 | Real-time quote API endpoint | ⬜ PLANNED |
| 2.9 | Quote PDF generation | ⬜ PLANNED |
| 2.10 | Price history & audit trail | ⬜ PLANNED |
| ... | *Full breakdown in sub-plan* | ⬜ PLANNED |

> 📄 **@architect:** Create `docs/plans/EPIC-002-pricing-engine.md` before S02 kickoff.

---

## EP-003: Supplier Portal

**Status:** 🔵 PLANNED  
**Sprint:** S03  
**Owner:** TBD  
**Architect:** @architect  
**Sub-plan:** [`docs/plans/EPIC-003-supplier-portal.md`](docs/plans/EPIC-003-supplier-portal.md) *(not yet created)*  
**ADR:** [`docs/adr/ADR-003-multi-tenancy.md`](docs/adr/ADR-003-multi-tenancy.md) *(not yet created)*

### Description
Build a dedicated supplier-facing portal enabling manufacturing partners to: receive RFQ packages (geometry + spec), submit competitive bids, manage capacity calendars, accept/decline orders, upload delivery documents, and track payment status. Multi-tenant with strict data isolation per supplier.

### Progress
```
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0% Complete
0 of 28 tasks complete
```

### Planned Milestones (High Level)
| # | Task | Status |
|---|---|---|
| 3.1 | Supplier auth & multi-tenancy isolation | ⬜ PLANNED |
| 3.2 | RFQ inbox with geometry viewer | ⬜ PLANNED |
| 3.3 | Bid submission workflow | ⬜ PLANNED |
| 3.4 | Capacity calendar integration | ⬜ PLANNED |
| 3.5 | Order acceptance & fulfilment tracking | ⬜ PLANNED |
| 3.6 | Document upload (certs, delivery notes) | ⬜ PLANNED |
| 3.7 | Supplier payment dashboard | ⬜ PLANNED |
| ... | *Full breakdown in sub-plan* | ⬜ PLANNED |

> 📄 **@architect:** Create `docs/plans/EPIC-003-supplier-portal.md` before S03 kickoff.

---

## EP-004: Order Lifecycle Management

**Status:** 🔵 PLANNED  
**Sprint:** S04  
**Owner:** TBD  
**Architect:** @architect  
**Sub-plan:** [`docs/plans/EPIC-004-order-lifecycle.md`](docs/plans/EPIC-004-order-lifecycle.md) *(not yet created)*  
**ADR:** [`docs/adr/ADR-004-state-machine.md`](docs/adr/ADR-004-state-machine.md) *(not yet created)*

### Description
Design and implement a comprehensive order state machine covering the full lifecycle: `QUOTE_REQUESTED → QUOTED → ACCEPTED → IN_PRODUCTION → QC → SHIPPED → DELIVERED → INVOICED → PAID`. Includes customer notifications, admin oversight dashboard, and Stripe payment integration.

### Progress
```
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0% Complete
0 of 25 tasks complete
```

### Planned Milestones (High Level)
| # | Task | Status |
|---|---|---|
| 4.1 | Order state machine design (ADR) | ⬜ PLANNED |
| 4.2 | Supabase order schema & transitions | ⬜ PLANNED |
| 4.3 | Customer order tracking dashboard | ⬜ PLANNED |
| 4.4 | Real-time status notifications (email + in-app) | ⬜ PLANNED |
| 4.5 | Stripe payment integration | ⬜ PLANNED |
| 4.6 | Admin order management hub | ⬜ PLANNED |
| 4.7 | Delivery tracking integration | ⬜ PLANNED |
| 4.8 | Automated invoice generation | ⬜ PLANNED |
| ... | *Full breakdown in sub-plan* | ⬜ PLANNED |

> 📄 **@architect:** Create `docs/plans/EPIC-004-order-lifecycle.md` before S04 kickoff.

---

## EP-005: AI DFM Advisor

**Status:** 🔵 PLANNED  
**Sprint:** S05  
**Owner:** TBD  
**Architect:** @architect  
**Sub-plan:** [`docs/plans/EPIC-005-dfm-advisor.md`](docs/plans/EPIC-005-dfm-advisor.md) *(not yet created)*  
**ADR:** [`docs/adr/ADR-005-ai-integration.md`](docs/adr/ADR-005-ai-integration.md) *(not yet created)*

### Description
Integrate an AI-powered Design for Manufacturability (DFM) advisor that analyses uploaded geometry and provides actionable feedback: detected manufacturability issues (thin walls, unsupported overhangs, sharp internal corners), suggested design modifications, alternative process recommendations, and cost-saving opportunities. Powered by a multi-modal LLM with geometry context injection.

### Progress
```
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0% Complete
0 of 18 tasks complete
```

### Planned Milestones (High Level)
| # | Task | Status |
|---|---|---|
| 5.1 | DFM rules engine (geometry constraints) | ⬜ PLANNED |
| 5.2 | LLM integration with geometry context | ⬜ PLANNED |
| 5.3 | Issue detection & classification | ⬜ PLANNED |
| 5.4 | 3D visualisation of DFM warnings | ⬜ PLANNED |
| 5.5 | Suggested fix generation | ⬜ PLANNED |
| 5.6 | DFM report PDF export | ⬜ PLANNED |
| 5.7 | A/B testing: DFM vs no-DFM conversion | ⬜ PLANNED |
| ... | *Full breakdown in sub-plan* | ⬜ PLANNED |

> 📄 **@architect:** Create `docs/plans/EPIC-005-dfm-advisor.md` before S05 kickoff.

---

## Dependency Graph

```
EP-001 (Geometry Analysis)
  └──► EP-002 (Dynamic Pricing) — requires geometry scores
         └──► EP-004 (Order Lifecycle) — requires pricing engine
                └──► EP-003 (Supplier Portal) — requires order state machine
EP-001 (Geometry Analysis)
  └──► EP-005 (AI DFM Advisor) — requires geometry parsing
```

---

## Sprint Calendar

| Sprint | Epics | Target Start | Target End |
|---|---|---|---|
| S01 | EP-001 | 2026-04-22 | 2026-05-06 |
| S02 | EP-002 | 2026-05-07 | 2026-05-20 |
| S03 | EP-003 | 2026-05-21 | 2026-06-03 |
| S04 | EP-004 | 2026-06-04 | 2026-06-17 |
| S05 | EP-005 | 2026-06-18 | 2026-07-01 |

---

*This document is managed exclusively by @manager. All progress bar updates must be accompanied by verified Git SHAs. See `.agent/skills/task-manager/SKILL.md` for update protocol.*
