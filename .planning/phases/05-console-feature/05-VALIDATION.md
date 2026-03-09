---
phase: 5
slug: console-feature
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-10
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts (existing) |
| **Quick run command** | `npm test -- --run` |
| **Full suite command** | `npm test -- --run --coverage` |
| **Estimated runtime** | ~8 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --run`
- **After every plan wave:** Run `npm test -- --run --coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 8 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | CONS-01 | unit | `npm test -- --run console-input` | ❌ W0 | ⬜ pending |
| 05-01-02 | 01 | 1 | CONS-02 | unit | `npm test -- --run console-input` | ❌ W0 | ⬜ pending |
| 05-01-03 | 01 | 1 | CONS-03 | unit | `npm test -- --run model-json-panel` | ❌ W0 | ⬜ pending |
| 05-02-01 | 02 | 1 | CONS-04 | unit | `npm test -- --run config-panel` | ❌ W0 | ⬜ pending |
| 05-02-02 | 02 | 1 | CONS-05 | integration | `npm test -- --run console-execution` | ❌ W0 | ⬜ pending |
| 05-03-01 | 03 | 2 | CONS-06 | unit | `npm test -- --run result-display` | ❌ W0 | ⬜ pending |
| 05-03-02 | 03 | 2 | CONS-07 | unit | `npm test -- --run metrics-panel` | ❌ W0 | ⬜ pending |
| 05-03-03 | 03 | 2 | CONS-08 | unit | `npm test -- --run tool-timeline` | ❌ W0 | ⬜ pending |
| 05-04-01 | 04 | 2 | CONS-09 | unit | `npm test -- --run artifacts-list` | ❌ W0 | ⬜ pending |
| 05-04-02 | 04 | 2 | CONS-10 | unit | `npm test -- --run debug-output` | ❌ W0 | ⬜ pending |
| 05-04-03 | 04 | 2 | CONS-11 | unit | `npm test -- --run raw-json-viewer` | ❌ W0 | ⬜ pending |
| 05-05-01 | 05 | 3 | CONS-12 | integration | `npm test -- --run use-console-execution` | ❌ W0 | ⬜ pending |
| 05-05-02 | 05 | 3 | CONS-13 | unit | `npm test -- --run flow-state-indicator` | ❌ W0 | ⬜ pending |
| 05-06-01 | 06 | 3 | CONS-14 | unit | `npm test -- --run error-display` | ❌ W0 | ⬜ pending |
| 05-06-02 | 06 | 3 | CONS-15 | unit | `npm test -- --run clarification-prompt` | ❌ W0 | ⬜ pending |
| 05-06-03 | 06 | 3 | CONS-16 | unit | `npm test -- --run report-summary` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `frontend/tests/components/console/` — test directory for console components
- [ ] `frontend/tests/hooks/use-console-execution.test.ts` — test for console execution hook
- [ ] Add shadcn/ui `checkbox` component (for configuration options)
- [ ] Add shadcn/ui `collapsible` component (for model JSON panel)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| SSE streaming real-time updates | CONS-12 | Requires live EventSource connection | Execute request, verify status updates in real-time |
| Cross-tab state sync | CONS-17 | Browser storage events | Open two tabs, verify state consistency |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 8s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
