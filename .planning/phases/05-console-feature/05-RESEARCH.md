# Phase 5: Console Feature - Research

**Researched:** 2026-03-10
**Domain:** React console UI, SSE streaming visualization, form state management, timeline display
**Confidence:** HIGH

## Summary

This phase delivers the complete console experience using the established design system, component library, and state management infrastructure from Phases 1-4. The key challenge is refactoring the existing `AgentConsole` component (478 lines of monolithic code) into a modular, testable architecture while preserving all functionality.

**Primary recommendation:** Extract the existing monolithic AgentConsole into focused sub-components (EndpointSelector, MessageInput, ConfigPanel, ResultDisplay, TimelineDisplay, DebugOutput, StatusIndicator), leverage the existing Zustand store for state management, use the existing `useSSE` hook for streaming, and apply the established shadcn/ui component patterns throughout.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CONS-01 | Endpoint selection UI (agent-run, chat-message, chat-execute) | Existing AgentConsole pattern + shadcn/ui Select |
| CONS-02 | Mode selection UI (chat, execute, auto) | Existing AgentConsole pattern + shadcn/ui Select |
| CONS-03 | Message input area | Existing AgentConsole pattern + shadcn/ui Textarea |
| CONS-04 | Model JSON input area (collapsible) | Collapsible pattern + Textarea with monospace styling |
| CONS-05 | Configuration options panel (analysisType, reportFormat, reportOutput) | Existing AgentConsole pattern + shadcn/ui Select |
| CONS-06 | Checkbox group (includeModel, autoAnalyze, autoCodeCheck, includeReport) | Native checkbox or shadcn/ui Checkbox component |
| CONS-07 | Execute button (sync + SSE streaming) | shadcn/ui Button with loading state variants |
| CONS-08 | Execution result display (traceId, status, response) | Card component + Badge for status |
| CONS-09 | Metrics display (toolCount, durationMs, etc.) | Grid layout + formatted number display |
| CONS-10 | Tool call timeline (execution order, status, duration) | Custom Timeline component with vertical layout |
| CONS-11 | Artifacts list display | List component with format/path display |
| CONS-12 | SSE streaming execution support | Existing useSSE hook + reader-based streaming |
| CONS-13 | Flow state indicator (connecting, receiving, complete) | Badge variants + animation for live state |
| CONS-14 | Debug output panel (Raw JSON + Stream Frames) | Card + pre/code blocks with monospace font |
| CONS-15 | Error state display | Destructive variant Badge + error message Card |
| CONS-16 | Clarification question display (missing parameter prompt) | Warning-style Card + structured missing fields list |
| CONS-17 | Report summary display | Card component with markdown rendering via react-markdown |
</phase_requirements>

## Standard Stack

### Core (Already in Project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| zustand | ^4.5.2 | Console state management | Already in project with Context pattern (Phase 4) |
| @tanstack/react-query | ^5.28.4 | API state caching | Already in project, use for sync requests |
| react-markdown | ^9.0.1 | Report markdown rendering | Already in project for CONS-17 |
| lucide-react | ^0.363.0 | Icons (status, timeline) | Already in project |
| sonner | ^2.0.7 | Toast notifications | Already in project for errors/success |
| date-fns | ^3.6.0 | Duration formatting | Already in project |

### Supporting (Already in Project)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @radix-ui/react-select | ^2.2.6 | Dropdown selections | Endpoint, mode, analysis type selectors |
| @radix-ui/react-dialog | ^1.1.15 | Modal dialogs | Future: full-screen result view |
| clsx + tailwind-merge | - | cn() utility | All component styling |
| class-variance-authority | ^0.7.1 | Variant styling | Timeline item variants, status badges |

### New Components Needed
| Component | Source | Purpose |
|-----------|--------|---------|
| Collapsible | shadcn/ui (add) | Model JSON expand/collapse |
| Checkbox | shadcn/ui (add) | Configuration options |

**Installation:**
```bash
# Add shadcn/ui collapsible and checkbox components
npx shadcn-ui@latest add collapsible checkbox
```

## Architecture Patterns

### Recommended Project Structure
```
frontend/src/
├── components/
│   └── console/
│       ├── index.ts                    # Barrel export
│       ├── endpoint-selector.tsx       # CONS-01, CONS-02
│       ├── message-input.tsx           # CONS-03
│       ├── model-json-panel.tsx        # CONS-04
│       ├── config-panel.tsx            # CONS-05, CONS-06
│       ├── execute-button.tsx          # CONS-07
│       ├── result-display/
│       │   ├── index.tsx
│       │   ├── status-header.tsx       # CONS-08
│       │   ├── metrics-grid.tsx        # CONS-09
│       │   └── report-summary.tsx      # CONS-17
│       ├── timeline/
│       │   ├── index.tsx               # CONS-10
│       │   └── timeline-item.tsx
│       ├── artifacts-list.tsx          # CONS-11
│       ├── debug-output.tsx            # CONS-14
│       ├── error-display.tsx           # CONS-15
│       ├── clarification-prompt.tsx    # CONS-16
│       └── status-indicator.tsx        # CONS-13
├── lib/
│   ├── stores/
│   │   └── slices/
│   │       └── console.ts              # Extend existing slice
│   └── api/
│       └── contracts/
│           └── agent.ts                # Type definitions for API
└── hooks/
    └── use-console-execution.ts        # Combines API + SSE + state
```

### Pattern 1: Extend Existing Console Slice

**What:** Extend the existing `ConsoleSlice` to include all console state (form inputs, execution state, results).

**When to use:** All console state should flow through Zustand for predictability.

**Example:**
```typescript
// Source: Existing lib/stores/slices/console.ts extended
import { type StateCreator } from 'zustand'

// Types from existing AgentConsole
export type Endpoint = 'agent-run' | 'chat-message' | 'chat-execute'
export type ChatMode = 'chat' | 'execute' | 'auto'
export type AnalysisType = 'static' | 'dynamic' | 'seismic' | 'nonlinear'
export type ReportFormat = 'json' | 'markdown' | 'both'
export type ReportOutput = 'inline' | 'file'

export interface AgentMetrics {
  toolCount?: number
  failedToolCount?: number
  totalToolDurationMs?: number
  averageToolDurationMs?: number
  maxToolDurationMs?: number
}

export interface AgentToolCall {
  tool: string
  status: 'success' | 'error'
  durationMs?: number
  errorCode?: string
  error?: string
}

export interface Clarification {
  question?: string
  missingFields?: string[]
}

export interface AgentResult {
  traceId?: string
  startedAt?: string
  completedAt?: string
  durationMs?: number
  success?: boolean
  needsModelInput?: boolean
  response?: string
  plan?: string[]
  toolCalls?: AgentToolCall[]
  metrics?: AgentMetrics
  clarification?: Clarification
  artifacts?: Array<{ format: string; path: string }>
  report?: { summary?: string; markdown?: string }
}

// Extended state interface
export interface ConsoleFormState {
  // Input controls (CONS-01 to CONS-04)
  endpoint: Endpoint
  mode: ChatMode
  message: string
  conversationId: string
  traceId: string
  modelText: string
  includeModel: boolean

  // Configuration (CONS-05, CONS-06)
  analysisType: AnalysisType
  reportFormat: ReportFormat
  reportOutput: ReportOutput
  autoAnalyze: boolean
  autoCodeCheck: boolean
  includeReport: boolean
}

export interface ConsoleExecutionState {
  // Execution state (CONS-07, CONS-12, CONS-13)
  loading: boolean
  isStreaming: boolean
  connectionState: 'idle' | 'connecting' | 'receiving' | 'complete' | 'error'

  // Results (CONS-08 to CONS-17)
  result: AgentResult | null
  rawResponse: string
  streamFrames: string[]
  error: string | null
}

export type ConsoleState = ConsoleFormState & ConsoleExecutionState
export type ConsoleSlice = ConsoleState & ConsoleActions

export const initialConsoleFormState: ConsoleFormState = {
  endpoint: 'chat-message',
  mode: 'auto',
  message: '',
  conversationId: '',
  traceId: '',
  modelText: '',
  includeModel: false,
  analysisType: 'static',
  reportFormat: 'both',
  reportOutput: 'inline',
  autoAnalyze: true,
  autoCodeCheck: true,
  includeReport: true,
}

export const initialExecutionState: ConsoleExecutionState = {
  loading: false,
  isStreaming: false,
  connectionState: 'idle',
  result: null,
  rawResponse: '',
  streamFrames: [],
  error: null,
}
```

### Pattern 2: useConsoleExecution Hook

**What:** Custom hook that encapsulates execution logic (sync + SSE streaming) and updates Zustand state.

**When to use:** Called by ExecuteButton, keeps execution logic testable.

**Example:**
```typescript
// Source: Based on existing AgentConsole runRequest/runStream patterns
// hooks/use-console-execution.ts
import { useCallback } from 'react'
import { useStore } from '@/lib/stores/context'
import { api } from '@/lib/api/client'
import type { AgentResult } from '@/lib/stores/slices/console'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export function useConsoleExecution() {
  const {
    endpoint, mode, message, conversationId, traceId,
    modelText, includeModel, analysisType,
    reportFormat, reportOutput, autoAnalyze,
    autoCodeCheck, includeReport,
    setLoading, setConnectionState, setResult,
    setRawResponse, setStreamFrames, setError,
  } = useStore((state) => ({
    // Form state
    endpoint: state.endpoint,
    mode: state.mode,
    message: state.message,
    conversationId: state.conversationId,
    traceId: state.traceId,
    modelText: state.modelText,
    includeModel: state.includeModel,
    analysisType: state.analysisType,
    reportFormat: state.reportFormat,
    reportOutput: state.reportOutput,
    autoAnalyze: state.autoAnalyze,
    autoCodeCheck: state.autoCodeCheck,
    includeReport: state.includeReport,
    // Actions
    setLoading: state.setLoading,
    setConnectionState: state.setConnectionState,
    setResult: state.setResult,
    setRawResponse: state.setRawResponse,
    setStreamFrames: state.setStreamFrames,
    setError: state.setError,
  }))

  const executeSync = useCallback(async () => {
    setLoading(true)
    setConnectionState('connecting')
    setError(null)
    setResult(null)
    setRawResponse('')
    setStreamFrames([])

    // Validate model JSON if included
    let modelPayload: Record<string, unknown> | undefined
    if (includeModel && modelText) {
      try {
        const parsed = JSON.parse(modelText)
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          setError('Model JSON must be an object')
          setLoading(false)
          return
        }
        modelPayload = parsed
      } catch (e) {
        setError(`Model JSON parse error: ${e instanceof Error ? e.message : 'Unknown'}`)
        setLoading(false)
        return
      }
    }

    const contextPayload = {
      model: modelPayload,
      modelFormat: 'structuremodel-v1',
      analysisType,
      autoAnalyze,
      autoCodeCheck,
      includeReport,
      reportFormat,
      reportOutput,
    }

    const body = endpoint === 'chat-execute'
      ? { message, conversationId: conversationId || undefined, traceId: traceId || undefined, context: contextPayload }
      : { message, mode, conversationId: conversationId || undefined, traceId: traceId || undefined, context: contextPayload }

    const endpointUrl = endpoint === 'agent-run'
      ? '/api/v1/agent/run'
      : endpoint === 'chat-execute'
        ? '/api/v1/chat/execute'
        : '/api/v1/chat/message'

    try {
      const response = await api.post<{ result?: AgentResult } & AgentResult>(
        endpointUrl,
        body
      )
      setRawResponse(JSON.stringify(response, null, 2))
      const normalized = response?.result || response
      setResult(normalized as AgentResult)
      setConnectionState('complete')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed')
      setConnectionState('error')
    } finally {
      setLoading(false)
    }
  }, [/* deps */])

  const executeStream = useCallback(async () => {
    // Similar to existing runStream() in AgentConsole
    // Uses reader-based streaming with manual frame parsing
    // Updates connectionState: connecting -> receiving -> complete
  }, [/* deps */])

  return { executeSync, executeStream }
}
```

### Pattern 3: Timeline Component for Tool Calls (CONS-10)

**What:** Vertical timeline visualization showing tool execution order, status, and duration.

**When to use:** Displaying AgentToolCall[] array from result.

**Example:**
```typescript
// Source: Based on existing AgentConsole timeline CSS classes
// components/console/timeline/timeline-item.tsx
import { cn } from '@/lib/utils'
import { CheckCircle2, XCircle, Clock } from 'lucide-react'
import type { AgentToolCall } from '@/lib/stores/slices/console'

interface TimelineItemProps {
  call: AgentToolCall
  index: number
}

export function TimelineItem({ call, index }: TimelineItemProps) {
  const isSuccess = call.status === 'success'

  return (
    <div className={cn(
      'flex items-start gap-3 pb-4',
      'relative before:absolute before:left-[11px] before:top-6 before:h-full before:w-px before:bg-border',
      'last:before:hidden'
    )}>
      {/* Status marker */}
      <div className={cn(
        'relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
        isSuccess ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'
      )}>
        {isSuccess ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <XCircle className="h-4 w-4" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm">
            {index + 1}. {call.tool}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {call.durationMs ?? '-'}ms
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          status: {call.status}
          {call.errorCode && ` | errorCode: ${call.errorCode}`}
        </p>
        {call.error && (
          <p className="text-xs text-destructive">{call.error}</p>
        )}
      </div>
    </div>
  )
}
```

### Pattern 4: Status Indicator with Connection State (CONS-13)

**What:** Visual indicator showing SSE connection state with appropriate styling and animation.

**When to use:** Real-time feedback during streaming execution.

**Example:**
```typescript
// components/console/status-indicator.tsx
import { cn } from '@/lib/utils'
import { Loader2, CheckCircle2, XCircle, Radio } from 'lucide-react'

type ConnectionState = 'idle' | 'connecting' | 'receiving' | 'complete' | 'error'

interface StatusIndicatorProps {
  state: ConnectionState
  className?: string
}

const stateConfig: Record<ConnectionState, {
  icon: typeof Loader2
  label: string
  className: string
  animate?: boolean
}> = {
  idle: {
    icon: Radio,
    label: 'Idle',
    className: 'text-muted-foreground bg-muted',
  },
  connecting: {
    icon: Loader2,
    label: 'Connecting...',
    className: 'text-amber-500 bg-amber-500/10',
    animate: true,
  },
  receiving: {
    icon: Radio,
    label: 'Receiving...',
    className: 'text-primary bg-primary/10',
    animate: true,
  },
  complete: {
    icon: CheckCircle2,
    label: 'Complete',
    className: 'text-emerald-500 bg-emerald-500/10',
  },
  error: {
    icon: XCircle,
    label: 'Error',
    className: 'text-destructive bg-destructive/10',
  },
}

export function StatusIndicator({ state, className }: StatusIndicatorProps) {
  const config = stateConfig[state]
  const Icon = config.icon

  return (
    <div className={cn(
      'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium',
      config.className,
      className
    )}>
      <Icon className={cn(
        'h-3.5 w-3.5',
        config.animate && 'animate-spin'
      )} />
      {config.label}
    </div>
  )
}
```

### Pattern 5: Collapsible Model JSON Panel (CONS-04)

**What:** Expandable panel for model JSON input using Radix Collapsible.

**When to use:** Optional model input that doesn't need to always be visible.

**Example:**
```typescript
// Source: Radix Collapsible pattern
// components/console/model-json-panel.tsx
'use client'

import { useState } from 'react'
import * as Collapsible from '@radix-ui/react-collapsible'
import { ChevronDown, ChevronRight, FileJson } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface ModelJsonPanelProps {
  value: string
  onChange: (value: string) => void
  included: boolean
  onIncludeChange: (included: boolean) => void
  error?: string
}

export function ModelJsonPanel({
  value,
  onChange,
  included,
  onIncludeChange,
  error,
}: ModelJsonPanelProps) {
  const [open, setOpen] = useState(false)

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={included}
            onChange={(e) => onIncludeChange(e.target.checked)}
            className="h-4 w-4 rounded border-input"
          />
          <FileJson className="h-4 w-4 text-muted-foreground" />
          Include Model JSON
        </label>

        {included && (
          <Collapsible.Trigger asChild>
            <Button variant="ghost" size="sm" className="h-7 gap-1">
              {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              {open ? 'Hide' : 'Show'} JSON
            </Button>
          </Collapsible.Trigger>
        )}
      </div>

      <Collapsible.Content className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        <div className="pt-3">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="StructureModel v1 JSON..."
            className={cn(
              'font-mono text-xs min-h-[200px]',
              error && 'border-destructive'
            )}
          />
          {error && (
            <p className="text-xs text-destructive mt-1">{error}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            modelFormat: structuremodel-v1
          </p>
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  )
}
```

### Anti-Patterns to Avoid

- **Monolithic component:** Do NOT keep all logic in one 478-line component - extract into focused sub-components
- **Inline fetch:** Do NOT use inline fetch() - use the existing api client from Phase 4
- **Local useState for shared state:** Do NOT use useState for form state that needs to be accessed by multiple components - use Zustand
- **Uncontrolled inputs:** Do NOT mix controlled and uncontrolled inputs - all form inputs should be controlled via Zustand

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Collapsible panel | Custom show/hide | @radix-ui/react-collapsible | Built-in accessibility, animations |
| Form state | Multiple useState | Zustand console slice | Already in project, SSR-safe |
| Streaming | Custom EventSource wrapper | Existing useSSE hook | Already tested with lifecycle management |
| Status badge | Custom div styling | shadcn/ui Badge with variants | Consistent with design system |
| Icons | Custom SVG | lucide-react | Already in project |
| Timeline layout | Custom CSS | Tailwind + existing patterns | Consistent styling |

**Key insight:** The project has invested heavily in infrastructure (Zustand stores, API client, useSSE hook, shadcn/ui components). Leverage these rather than building from scratch.

## Common Pitfalls

### Pitfall 1: Zustand State Not Updating in Components
**What goes wrong:** Components don't re-render when store state changes.
**Why it happens:** Selector returns new object reference on every call.
**How to avoid:** Use shallow comparison or select primitive values.
```typescript
// BAD - new object every render
const { endpoint, mode } = useStore((state) => ({ endpoint: state.endpoint, mode: state.mode }))

// GOOD - primitive values
const endpoint = useStore((state) => state.endpoint)
const mode = useStore((state) => state.mode)

// GOOD - multiple values with shallow
import { shallow } from 'zustand/shallow'
const { endpoint, mode } = useStore((state) => ({ endpoint: state.endpoint, mode: state.mode }), shallow)
```
**Warning signs:** Components not updating, stale form values.

### Pitfall 2: SSE Reader Not Properly Closed
**What goes wrong:** Streaming requests leave connections open after component unmount.
**Why it happens:** Missing cleanup in async reader loop.
**How to avoid:** Use AbortController and check for unmount.
```typescript
useEffect(() => {
  const controller = new AbortController()

  async function stream() {
    const response = await fetch(url, { signal: controller.signal })
    const reader = response.body.getReader()

    while (true) {
      const { done } = await reader.read()
      if (done || controller.signal.aborted) break
    }
  }

  stream()
  return () => controller.abort()
}, [])
```
**Warning signs:** Network tab shows pending connections after navigation.

### Pitfall 3: JSON Parse Errors Crashing UI
**What goes wrong:** Invalid model JSON crashes the application.
**Why it happens:** Not wrapping JSON.parse in try/catch.
**How to avoid:** Always validate JSON with try/catch and show user-friendly error.
**Warning signs:** Blank screen when submitting invalid JSON.

### Pitfall 4: Timeline Animation Jank
**What goes wrong:** Timeline items animate poorly when streaming.
**Why it happens:** React re-renders entire list on each frame.
**How to avoid:** Use key prop with stable IDs, consider React.memo for TimelineItem.
**Warning signs:** Choppy UI during streaming, high CPU usage.

## Code Examples

### Complete Console Page Integration

```typescript
// app/(console)/console/page.tsx
'use client'

import { SplitPanel } from '@/components/layout/split-panel'
import { EndpointSelector } from '@/components/console/endpoint-selector'
import { MessageInput } from '@/components/console/message-input'
import { ModelJsonPanel } from '@/components/console/model-json-panel'
import { ConfigPanel } from '@/components/console/config-panel'
import { ExecuteButton } from '@/components/console/execute-button'
import { ResultDisplay } from '@/components/console/result-display'
import { Timeline } from '@/components/console/timeline'
import { ArtifactsList } from '@/components/console/artifacts-list'
import { DebugOutput } from '@/components/console/debug-output'
import { StatusIndicator } from '@/components/console/status-indicator'
import { ErrorDisplay } from '@/components/console/error-display'
import { useStore } from '@/lib/stores/context'

export default function ConsolePage() {
  const { result, connectionState, error } = useStore((state) => ({
    result: state.result,
    connectionState: state.connectionState,
    error: state.error,
  }))

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Left Panel: Input Controls */}
      <SplitPanel
        defaultLayout={[40, 60]}
        left={
          <div className="p-4 space-y-4 overflow-auto h-full">
            <EndpointSelector />
            <MessageInput />
            <ModelJsonPanel />
            <ConfigPanel />
            <div className="flex items-center justify-between pt-2">
              <StatusIndicator state={connectionState} />
              <ExecuteButton />
            </div>
          </div>
        }
        right={
          <div className="p-4 space-y-4 overflow-auto h-full">
            {error && <ErrorDisplay />}
            {result && (
              <>
                <ResultDisplay result={result} />
                {result.toolCalls && <Timeline calls={result.toolCalls} />}
                {result.artifacts && <ArtifactsList artifacts={result.artifacts} />}
              </>
            )}
            <DebugOutput />
          </div>
        }
      />
    </div>
  )
}
```

### API Contract Types

```typescript
// lib/api/contracts/agent.ts
export interface ChatMessageRequest {
  message: string
  mode?: 'chat' | 'execute' | 'auto'
  conversationId?: string
  traceId?: string
  context?: {
    model?: Record<string, unknown>
    modelFormat?: string
    analysisType?: 'static' | 'dynamic' | 'seismic' | 'nonlinear'
    autoAnalyze?: boolean
    autoCodeCheck?: boolean
    includeReport?: boolean
    reportFormat?: 'json' | 'markdown' | 'both'
    reportOutput?: 'inline' | 'file'
  }
}

export interface ChatExecuteRequest {
  message: string
  conversationId?: string
  traceId?: string
  context?: ChatMessageRequest['context']
}

export interface AgentRunRequest {
  message: string
  conversationId?: string
  traceId?: string
  context?: ChatMessageRequest['context']
}

// Response types match AgentResult interface in console slice
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Monolithic console component | Modular sub-components | Phase 5 (this phase) | Testability, maintainability |
| useState for form | Zustand slice | Phase 4 | Shared state, SSR-safe |
| Custom fetch | api client | Phase 4 | Error handling, typing |
| Inline CSS classes | Tailwind + shadcn/ui | Phases 1-2 | Design consistency |

**Deprecated/outdated in existing AgentConsole:**
- Custom `.console-root`, `.console-card` CSS classes - use Tailwind utilities
- Inline `<select>` elements - use shadcn/ui Select component
- Inline `<textarea>` elements - use shadcn/ui Textarea component
- Local `useState` for all form fields - migrate to Zustand store

## Open Questions

1. **Should we use React Hook Form for validation?**
   - What we know: Form is relatively simple, validation is mostly JSON parsing
   - What's unclear: Whether future requirements will need complex validation
   - Recommendation: Start with Zustand + manual validation; add RHF if complexity grows

2. **Should Timeline support real-time updates during streaming?**
   - What we know: Current implementation shows toolCalls after completion
   - What's unclear: Whether users want to see tool calls as they happen
   - Recommendation: Start with post-completion display; add streaming timeline if requested

3. **Should we add shadcn/ui Checkbox or use native checkbox?**
   - What we know: Native checkbox works, shadcn/ui has consistent styling
   - What's unclear: Design preference for form controls
   - Recommendation: Add shadcn/ui Checkbox for visual consistency

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest ^4.0.18 |
| Config file | `frontend/vitest.config.ts` |
| Quick run command | `cd frontend && npm test` |
| Full suite command | `cd frontend && npm run test:run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CONS-01 | Endpoint selector renders all options | unit | `vitest run tests/components/console/endpoint-selector.test.tsx` | No - Wave 0 |
| CONS-01 | Endpoint selection updates store | unit | `vitest run tests/components/console/endpoint-selector.test.tsx` | No - Wave 0 |
| CONS-02 | Mode selector disabled for chat-execute | unit | `vitest run tests/components/console/endpoint-selector.test.tsx` | No - Wave 0 |
| CONS-03 | Message input updates store | unit | `vitest run tests/components/console/message-input.test.tsx` | No - Wave 0 |
| CONS-04 | Model JSON panel collapses/expands | unit | `vitest run tests/components/console/model-json-panel.test.tsx` | No - Wave 0 |
| CONS-04 | Model JSON validation on invalid JSON | unit | `vitest run tests/components/console/model-json-panel.test.tsx` | No - Wave 0 |
| CONS-05 | Config options update store | unit | `vitest run tests/components/console/config-panel.test.tsx` | No - Wave 0 |
| CONS-06 | Checkboxes toggle store values | unit | `vitest run tests/components/console/config-panel.test.tsx` | No - Wave 0 |
| CONS-07 | Execute button triggers sync request | unit | `vitest run tests/hooks/use-console-execution.test.ts` | No - Wave 0 |
| CONS-07 | Execute button triggers stream request | unit | `vitest run tests/hooks/use-console-execution.test.ts` | No - Wave 0 |
| CONS-07 | Execute button disabled during loading | unit | `vitest run tests/components/console/execute-button.test.tsx` | No - Wave 0 |
| CONS-08 | Result display shows traceId | unit | `vitest run tests/components/console/result-display.test.tsx` | No - Wave 0 |
| CONS-08 | Result display shows status badge | unit | `vitest run tests/components/console/result-display.test.tsx` | No - Wave 0 |
| CONS-09 | Metrics grid displays all metrics | unit | `vitest run tests/components/console/metrics-grid.test.tsx` | No - Wave 0 |
| CONS-10 | Timeline renders tool calls in order | unit | `vitest run tests/components/console/timeline.test.tsx` | No - Wave 0 |
| CONS-10 | Timeline shows success/error states | unit | `vitest run tests/components/console/timeline.test.tsx` | No - Wave 0 |
| CONS-11 | Artifacts list displays format/path | unit | `vitest run tests/components/console/artifacts-list.test.tsx` | No - Wave 0 |
| CONS-13 | Status indicator shows connection state | unit | `vitest run tests/components/console/status-indicator.test.tsx` | No - Wave 0 |
| CONS-14 | Debug output shows raw JSON | unit | `vitest run tests/components/console/debug-output.test.tsx` | No - Wave 0 |
| CONS-14 | Debug output shows stream frames | unit | `vitest run tests/components/console/debug-output.test.tsx` | No - Wave 0 |
| CONS-15 | Error display shows error message | unit | `vitest run tests/components/console/error-display.test.tsx` | No - Wave 0 |
| CONS-16 | Clarification prompt shows question | unit | `vitest run tests/components/console/clarification-prompt.test.tsx` | No - Wave 0 |
| CONS-16 | Clarification prompt shows missing fields | unit | `vitest run tests/components/console/clarification-prompt.test.tsx` | No - Wave 0 |
| CONS-17 | Report summary renders markdown | unit | `vitest run tests/components/console/report-summary.test.tsx` | No - Wave 0 |
| Integration | Full console flow with API mock | integration | `vitest run tests/integration/console-flow.test.tsx` | No - Wave 0 |

### Sampling Rate
- **Per task commit:** `cd frontend && npm test`
- **Per wave merge:** `cd frontend && npm run test:run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/components/console/endpoint-selector.test.tsx` - CONS-01, CONS-02
- [ ] `tests/components/console/message-input.test.tsx` - CONS-03
- [ ] `tests/components/console/model-json-panel.test.tsx` - CONS-04
- [ ] `tests/components/console/config-panel.test.tsx` - CONS-05, CONS-06
- [ ] `tests/components/console/execute-button.test.tsx` - CONS-07
- [ ] `tests/components/console/result-display.test.tsx` - CONS-08
- [ ] `tests/components/console/metrics-grid.test.tsx` - CONS-09
- [ ] `tests/components/console/timeline.test.tsx` - CONS-10
- [ ] `tests/components/console/artifacts-list.test.tsx` - CONS-11
- [ ] `tests/components/console/status-indicator.test.tsx` - CONS-13
- [ ] `tests/components/console/debug-output.test.tsx` - CONS-14
- [ ] `tests/components/console/error-display.test.tsx` - CONS-15
- [ ] `tests/components/console/clarification-prompt.test.tsx` - CONS-16
- [ ] `tests/components/console/report-summary.test.tsx` - CONS-17
- [ ] `tests/hooks/use-console-execution.test.ts` - execution hook
- [ ] `tests/integration/console-flow.test.tsx` - full flow
- [ ] Update `tests/stores/slices/console.test.ts` - extended state/actions
- [ ] Add @radix-ui/react-collapsible to package.json
- [ ] Add Collapsible component via `npx shadcn-ui@latest add collapsible`

## Sources

### Primary (HIGH confidence)
- Existing codebase: `frontend/src/components/console/agent-console.tsx` - Reference implementation
- Existing codebase: `frontend/src/lib/stores/slices/console.ts` - State patterns
- Existing codebase: `frontend/src/hooks/use-sse.ts` - SSE hook implementation
- Existing codebase: `frontend/src/lib/api/client.ts` - API client pattern

### Secondary (MEDIUM confidence)
- [Zustand Best Practices 2025 - Juejin](https://juejin.cn/post/7476357359843508263) - State management patterns
- [SSE in React - Medium](https://medium.com/@dlrnjstjs/implementing-react-sse-server-sent-events-real-time-notification-system-a999bb983d1b) - SSE patterns
- [shadcn/ui Accordion](https://ui.shadcn.com/docs/components/radix/accordion) - Collapsible patterns
- [CSS-Tricks - Editable Textarea with Syntax Highlighting](https://css-tricks.com/creating-an-editable-textarea-that-supports-syntax-highlighted-code/) - JSON editor patterns

### Tertiary (LOW confidence)
- [Agent Prism - Evil Martians](https://evilmartians.com/chronicles/debug-ai-fast-agent-prism-open-source-library-visualize-agent-traces) - Tool timeline visualization inspiration

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in project, patterns established in Phases 1-4
- Architecture: HIGH - Based on existing AgentConsole, extracting to modular components
- Pitfalls: HIGH - Well-documented React/Zustand patterns, existing test infrastructure

**Research date:** 2026-03-10
**Valid until:** 30 days (stable patterns, but verify shadcn/ui component updates)
