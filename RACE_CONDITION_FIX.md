# Race Condition Fix for AIR Tool Calls

## Problem
When backend returns actions to open an AIR and populate it with items in one response:
```json
[
  {"action":"message","id":"assistant","props":{"attachment":{"id":"tasks-air"}}},
  {"action":"call_tool","id":"tasks-air","tool":"create_task","props":{"title":"flour"}},
  {"action":"call_tool","id":"tasks-air","tool":"create_task","props":{"title":"sugar"}}
]
```

The tool calls (`create_task`) would execute **before** the TasksAIR component mounted, causing Flux messages to be missed.

## Root Cause
React state updates (`setMessages`) are asynchronous. When processing actions sequentially:
1. Attachment triggers `setMessages()` - queued for next render
2. Tool calls execute immediately - dispatch Flux messages
3. TasksAIR mounts in next render - subscribes to Flux
4. **Result**: TasksAIR missed all the messages that were already dispatched

## Solution
File: `src/components/chat/ChatInterface.tsx` (Lines 272-470)

### Key Changes
1. Track newly spawned AIRs in `spawnedThisLoop` Set
2. Defer tool calls for new AIRs into `toolCallsToDefer` array
3. Execute deferred calls after 100ms delay to allow mounting
4. Immediate execution for AIRs already open

```typescript
const spawnedThisLoop = new Set<string>();
const toolCallsToDefer: any[] = [];

actions.forEach((action: any) => {
    // Process attachments FIRST
    if (action.id === 'assistant' && action.props?.attachment) {
        if (!activeAIRs.includes(attachment.id)) {
            spawnedThisLoop.add(attachment.id);
            setMessages(/* open AIR */);
        }
        return;
    }

    // Defer tool calls for newly spawned AIRs
    if (action.action === 'call_tool') {
        if (spawnedThisLoop.has(action.id)) {
            toolCallsToDefer.push(action);
        } else {
            // Execute immediately for already-open AIRs
            manifest.logic.handleRequest(action.tool, action.props);
        }
    }
});

// Execute deferred calls after components mount
if (toolCallsToDefer.length > 0) {
    setTimeout(() => {
        toolCallsToDefer.forEach((action) => {
            manifest.logic.handleRequest(action.tool, action.props);
        });
    }, 100);
}
```

## Verification
Console logs now show correct order:

**BEFORE (broken):**
```
[Chat] Routing to tasks-air Kitchen
[Flux] Dispatch: ADD_TASK listeners: 6
[TasksAIR] Flux Msg: SYNC_CHAT_STATE  ← Missed ADD_TASK!
[TasksAIR] Adding items: []  ← EMPTY
```

**AFTER (fixed):**
```
[Chat] Deferring tool call create_task on tasks-air
[TasksAIR] Flux Msg: SYNC_CHAT_STATE  ← Mounted
[Chat] Calling deferred tool create_task
[Flux] Dispatch: ADD_TASK listeners: 7  ← Now subscribed!
[TasksAIR] Flux Msg: ADD_TASK  ← Received!
[TasksAIR] Adding 1 items: [flour]
```

## Impact
- ✅ Items now populate correctly when AIR opens
- ✅ Works for ALL AIRs (not just tasks-air)
- ✅ No breaking changes to existing code
- ✅ Already-open AIRs still work immediately (no delay)

## Testing
Run Playwright tests to verify:
```bash
cd aura-stack/aura-starter
npx playwright test --grep "full task workflow"
```

Expected: Tasks appear in TasksAIR immediately after opening.
