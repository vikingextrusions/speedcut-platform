# .agent/rules/global.md — Global Agent Rules
**Version:** 1.0.0  
**Authority:** @manager  
**Applies to:** All agents — @architect, @engineer, @tester, @manager  
**Last updated:** 2026-04-22

---

## Purpose

These rules govern all agent behaviour and inter-agent communication on the Speedcut platform. They are non-negotiable and take precedence over any model-specific defaults. Special attention is given to **Mixed-Brain communication** — ensuring Claude-family (Anthropic) and Gemini-family (Google) agent outputs remain semantically compatible, structurally consistent, and mutually interpretable.

---

## Part 1: Universal Rules (All Agents)

### RULE-001: Epic ID Citation
Every document, commit message, and inter-agent message **MUST** reference a valid Epic ID (`EP-001` through `EP-005`). Undocumented work does not exist.

```
✅ VALID:   "feat(EP-001.1.9): implement S3 multipart upload"
❌ INVALID:  "feat: implement file upload"
```

### RULE-002: No Autonomous Scope Expansion
Agents MUST NOT expand their task scope beyond what is defined in the current `BRIEF.md`. If additional work is identified, create a new task entry in the sub-plan and notify @manager. Do not implement undocumented features.

### RULE-003: Single Source of Truth
| Document | Single Owner | Others May |
|---|---|---|
| `ROOT_PLAN.md` | @manager | Read only |
| `BRIEF.md` | @architect | Read + implement |
| `src/**/*` | @engineer | Read |
| `TEST_REPORT.md` | @tester | Read |
| `docs/plans/*/status` | @manager | Read + trigger |

### RULE-004: No Secrets in Source
**NEVER** commit API keys, passwords, JWTs, or database connection strings to any file. Use environment variables exclusively. Any agent detecting a secret in source must immediately raise a P0 finding.

### RULE-005: Structured Logging Only
All agent internal state changes must be logged to `.agent/logs/` in JSON Lines format:
```jsonl
{"timestamp":"2026-04-22T10:30:00Z","agent":"@engineer","action":"mark-complete","epic":"EP-001","task":"1.8","sha":"a1b2c3d"}
```

### RULE-006: Graceful Degradation on Uncertainty
When an agent is uncertain about scope, architecture, or behaviour, it **MUST**:
1. STOP current operation
2. Document the uncertainty in a `CLARIFICATION-{task_id}.md` file
3. Tag the relevant upstream agent
4. Await explicit resolution before proceeding

Guessing is forbidden.

---

## Part 2: Mixed-Brain Communication Protocol

This section resolves the fundamental incompatibilities between Claude (Anthropic) and Gemini (Google) agent families.

### The Problem

| Dimension | Claude (Opus/Sonnet) | Gemini (Flash/Pro) |
|---|---|---|
| Reasoning style | Explicit `<thinking>` blocks | Internal chain-of-thought |
| Context handling | Conservative, citation-heavy | Aggressive full-load (2M) |
| Output format preference | Structured markdown | Mixed markdown/prose |
| Uncertainty behaviour | Verbose hedging | Confident shorthand |
| Error communication | Detailed trace | Summary + code |

Without a shared protocol, a Claude-authored `BRIEF.md` may be misinterpreted by Gemini's @engineer, and a Gemini `TEST_REPORT.md` may confuse Claude's @tester.

### RULE-MB-001: Canonical Message Format

**All inter-agent messages must use the Canonical Envelope:**

```yaml
# AGENT MESSAGE ENVELOPE v1.0
---
from: "@architect"           # Sender agent handle
to: "@engineer"              # Recipient agent handle
type: "BRIEF"                # BRIEF | BLOCKER | TEST_REPORT | STATUS_UPDATE | CLARIFICATION
epic_id: "EP-001"            # Required Epic reference
sprint: "S01"                # Sprint identifier
timestamp_iso: "2026-04-22T10:00:00Z"
priority: "HIGH"             # HIGH | MEDIUM | LOW
payload_path: "docs/plans/EPIC-001/BRIEF.md"
requires_acknowledgement: true
# Claude agents: include reasoning_summary below
# Gemini agents: include context_tokens_loaded below
model_metadata:
  sender_model: "claude-opus-4-6"
  context_strategy: "targeted"   # targeted | full_load
---
# Payload (markdown body follows)
```

### RULE-MB-002: Claude Agents — Output Requirements

Claude agents (@architect, @tester) **MUST**:

1. **Explicit `<thinking>` blocks:** Open a reasoning block before any substantive decision. The thinking block must be present in outputs shared with Gemini agents so they can trace the decision rationale.
   ```
   <thinking>
   I need to design the S3 upload API. Key considerations:
   1. File size limits (100MB max per BRIEF.md)
   2. Multipart for files > 5MB (AWS requirement)
   3. Presigned URL pattern vs direct proxy...
   [reasoning continues]
   </thinking>
   
   ## Decision: Presigned URL Pattern
   ...
   ```

2. **Hedge markers:** When uncertain, Claude agents must use explicit hedge markers that Gemini can parse:
   ```
   ⚠️ UNCERTAIN: The Redis caching strategy for geometry results is unclear.
   🔴 ASSUMPTION: Assuming TTL = 24h based on similar platforms.
   📋 REQUIRES: Confirmation from @architect before implementation.
   ```

3. **Schema-first contracts:** All API contracts in BRIEF.md must use TypeScript interface syntax (not prose), enabling @engineer (Gemini) to implement without ambiguity:
   ```typescript
   // REQUIRED FORMAT for all API contracts in BRIEF.md
   interface GeometryAnalysisResult {
     file_id: string;
     volume_mm3: number;
     surface_area_mm2: number;
     bounding_box: BoundingBox;
     wall_thickness_min_mm: number;
     recommended_process: "CNC" | "SHEET_METAL" | "3DP" | "CASTING";
     confidence_score: number; // 0.0 - 1.0
   }
   ```

### RULE-MB-003: Gemini Agents — Output Requirements

Gemini agents (@engineer, @manager) **MUST**:

1. **Structured completion signals:** Gemini's terse output style can be ambiguous to Claude agents. Use explicit completion markers:
   ```
   ## COMPLETION SIGNAL
   - Status: DONE
   - Tasks completed: EP-001.1.8, EP-001.1.9
   - SHAs: a1b2c3d, b2c3d4e
   - Tests passing: 47/47
   - Next required action: @tester review TEST_REPORT.md
   ```

2. **No implicit assumptions from context:** Even with 2M context loaded, @engineer must not implement undocumented behaviour inferred from existing code patterns. If a pattern is observed but not specified in BRIEF.md, raise a clarification.

3. **Explicit context declaration:** When @manager or @engineer loads a large context, they must declare what was loaded:
   ```
   ## Context Loaded (2M window)
   - Full src/ directory (847 files, ~1.2M tokens)
   - docs/plans/EPIC-001-geometry-analysis.md
   - docs/plans/EPIC-001/BRIEF.md
   - ROOT_PLAN.md
   - AGENTS.md
   ```

4. **Avoid markdown prose explanations for errors:** Use structured error objects that Claude agents can parse reliably:
   ```yaml
   error:
     type: "GATE_FAILURE"
     stage: "stage-2-engineering"
     task: "EP-001.1.9"
     reason: "S3 presigned URL generation returns 403"
     severity: "BLOCKER"
     requires: "@architect clarification on IAM permissions"
   ```

### RULE-MB-004: Status Vocabulary Standard

All agents must use **exactly** this vocabulary for task/epic states. Custom status labels are forbidden.

| Status | Symbol | Meaning | Who Can Set |
|---|---|---|---|
| `PLANNED` | 🔵 | Not started, no sprint assigned | @manager |
| `IN PROGRESS` | 🟡 | Active sprint, work underway | @manager |
| `COMPLETE` | ✅ | All tasks done, SHA verified | @manager |
| `BLOCKED` | 🔴 | Cannot proceed without resolution | Any agent |
| `TODO` | ⬜ | Task in scope, not started | Any agent |
| `IN PROGRESS` | 🔄 | Task actively being worked | @engineer |
| `DONE` | ✅ | Task complete, SHA appended | @engineer |
| `TESTED` | 🧪 | Passed @tester adversarial review | @tester |

**Forbidden vocabulary:** `complete`, `finished`, `wip`, `done-ish`, `needs review` (without severity)

### RULE-MB-005: Capability Boundary Enforcement

This table is the authoritative capability boundary reference. Any agent acting outside its column is in violation.

| Action | @architect | @engineer | @tester | @manager |
|---|:---:|:---:|:---:|:---:|
| Write `src/**/*` | ❌ | ✅ | ⚠️ tests only | ❌ |
| Write `ROOT_PLAN.md` | ❌ | ❌ | ❌ | ✅ |
| Write `BRIEF.md` | ✅ | ❌ | ❌ | ❌ |
| Approve `BRIEF.md` | ❌ | ❌ | ❌ | ✅ |
| Write `TEST_REPORT.md` | ❌ | ❌ | ✅ | ❌ |
| Approve merge | ❌ | ❌ | ❌ | ✅ |
| Create ADR | ✅ | ❌ | ❌ | ❌ |
| Mark task DONE | ❌ | ✅ | ❌ | ❌ |
| Block a task | ✅ | ✅ | ✅ | ✅ |
| Update Epic status | ❌ | ❌ | ❌ | ✅ |

### RULE-MB-006: Handoff Confirmation

Before consuming a handoff artefact (BRIEF, TEST_REPORT, etc.), the receiving agent **must** echo a confirmation in its first output:

```
## Handoff Acknowledgement
- Received: BRIEF.md from @architect
- Epic: EP-001
- Sprint: S01
- Timestamp: 2026-04-22T10:00:00Z
- Contract verified: ✅ (all required sections present)
- Beginning: Stage 2 — Implementation
```

This confirmation prevents Gemini agents from silently operating on stale or incomplete handoffs.

---

## Part 3: Security & Compliance Rules

### RULE-SEC-001: No Cross-Tenant Data Access
@engineer must implement and @tester must verify: customer data is always scoped by `customer_id`. No query may return rows belonging to a different tenant. Row Level Security (RLS) must be enabled on all Supabase tables containing customer data.

### RULE-SEC-002: Auth on Every Route
Every HTTP route in the application must have explicit auth middleware. @tester must verify that removing an auth token returns `401`, not a redirect or `200`.

### RULE-SEC-003: Input Validation at the Boundary
All user inputs (file uploads, form data, query params) must be validated and sanitised at the API boundary before touching the database. Zod schemas are the standard.

### RULE-SEC-004: Dependency Audit
@engineer must run `npm audit` before every handoff to @tester. Any `critical` or `high` severity CVE blocks the handoff until patched.

---

## Part 4: Code Quality Standards

### RULE-CODE-001: TypeScript Strict Mode
`tsconfig.json` must have `"strict": true`. No exceptions. @tester blocks any PR where strict mode has been weakened.

### RULE-CODE-002: No `console.log` in Production Code
Use the structured logger (`lib/logger.ts`). Console statements are a P3 finding that must be cleared before merge.

### RULE-CODE-003: Database Migrations, Not Direct Edits
All schema changes go through Supabase migrations. Direct SQL editing in production is forbidden.

### RULE-CODE-004: Conventional Commits
```
feat(EP-001.1.9): implement S3 multipart upload API
fix(EP-001.1.8): resolve STL parser memory leak
docs(EP-001): update BRIEF.md acceptance criteria
test(EP-001.1.7): add adversarial tests for process recommendation
```

---

## Part 5: Escalation Protocol

When any rule is violated, the detecting agent follows this escalation chain:

```
Severity P0 (data/security) → @manager immediately → pause pipeline
Severity P1 (functional)    → @manager within 1h → assess impact
Severity P2 (moderate)      → log + continue → @manager reviews in sprint close
Severity P3 (cosmetic)      → log only → address in next sprint
```

Escalation DOES NOT mean @manager fixes the issue — only that @manager is informed and decides routing.

---

*These rules are authoritative and versioned. Any proposed changes must be reviewed by @manager and @architect jointly before taking effect. Changes are recorded in `.agent/rules/CHANGELOG.md`.*
