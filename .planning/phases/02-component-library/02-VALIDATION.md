---
phase: 2
slug: component-library
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-09
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts (exists from Phase 1) |
| **Quick run command** | `npm test -- --run` |
| **Full suite command** | `npm test -- --run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --run`
- **After every plan wave:** Run `npm test -- --run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | COMP-01 | unit | `npm test -- button.test.tsx --run` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | COMP-03 | unit | `npm test -- input.test.tsx --run` | ❌ W0 | ⬜ pending |
| 02-01-03 | 01 | 1 | COMP-04 | unit | `npm test -- textarea.test.tsx --run` | ❌ W0 | ⬜ pending |
| 02-01-04 | 01 | 1 | COMP-05 | unit | `npm test -- select.test.tsx --run` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 2 | COMP-02 | unit | `npm test -- card.test.tsx --run` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 2 | COMP-06 | unit | `npm test -- dialog.test.tsx --run` | ❌ W0 | ⬜ pending |
| 02-02-03 | 02 | 2 | COMP-09 | unit | `npm test -- badge.test.tsx --run` | ❌ W0 | ⬜ pending |
| 02-03-01 | 03 | 2 | COMP-07 | integration | `npm test -- toast.test.tsx --run` | ❌ W0 | ⬜ pending |
| 02-03-02 | 03 | 2 | COMP-08 | unit | `npm test -- skeleton.test.tsx --run` | ❌ W0 | ⬜ pending |
| 02-04-01 | 04 | 3 | COMP-10 | integration | `npm test -- command-palette.test.tsx --run` | ❌ W0 | ⬜ pending |
| 02-04-02 | 04 | 3 | COMP-11 | unit | `npm test -- animations.test.ts --run` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/components/ui/button.test.tsx` — stubs for COMP-01 (sizes, variants)
- [ ] `src/components/ui/input.test.tsx` — stubs for COMP-03 (styling, focus states)
- [ ] `src/components/ui/textarea.test.tsx` — stubs for COMP-04
- [ ] `src/components/ui/select.test.tsx` — stubs for COMP-05
- [ ] `src/components/ui/card.test.tsx` — stubs for COMP-02
- [ ] `src/components/ui/dialog.test.tsx` — stubs for COMP-06 (focus trap)
- [ ] `src/components/ui/badge.test.tsx` — stubs for COMP-09
- [ ] `src/components/ui/toast.test.tsx` — stubs for COMP-07 (Sonner integration)
- [ ] `src/components/ui/skeleton.test.tsx` — stubs for COMP-08
- [ ] `src/components/ui/command.test.tsx` — stubs for COMP-10 (Cmd/Ctrl+K)
- [ ] `src/lib/animations.test.ts` — stubs for COMP-11 (micro-interactions)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Focus trap in Dialog | COMP-06 | Keyboard interaction timing | Tab through dialog, verify focus cycles within |
| Toast auto-dismiss timing | COMP-07 | Timing-based | Trigger toast, verify disappears after 4s |
| Command palette keyboard shortcut | COMP-10 | Global keyboard event | Press Cmd/Ctrl+K, verify palette opens |
| Micro-interaction smoothness | COMP-11 | Visual perception | Hover/click components, verify 150-200ms transitions |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
