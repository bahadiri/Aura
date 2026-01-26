# MCP Clean Architecture

## Overview
TasksAIR now uses a **pure MCP architecture** with NO legacy Flux message types.

## Architecture Flow

```
Backend LLM Response
    ↓
ChatInterface.tsx receives actions:
[
  {"action":"message","attachment":{"id":"tasks-air"}},
  {"action":"call_tool","id":"tasks-air","tool":"create_task","props":{"title":"flour"}},
  {"action":"call_tool","id":"tasks-air","tool":"create_task","props":{"title":"sugar"}}
]
    ↓
ChatInterface defers tool calls for new AIRs (100ms)
    ↓
handler.ts (Kitchen) forwards MCP tools via Flux:
flux.dispatch({
    type: 'create_task',        // ✓ Uses MCP tool name
    payload: { title: "flour" },
    to: 'tasks-air'
})
    ↓
logic.ts listens for MCP tool names:
if (msg.type === 'create_task') {
    const newTask = { id: uuid(), label: msg.payload.title, completed: false };
    setTasks(prev => [...prev, newTask]);
    persist(newTasks);
}
```

## Files Changed

### handler.ts - The Kitchen
**Before:**
```typescript
flux.dispatch({ type: 'ADD_TASK', payload: { task: title } });  // ❌ Legacy
flux.dispatch({ type: 'TOGGLE_TASK', payload: { task: id } });  // ❌ Legacy
```

**After:**
```typescript
flux.dispatch({ type: 'create_task', payload: args });    // ✓ MCP tool name
flux.dispatch({ type: 'complete_task', payload: args });  // ✓ MCP tool name
```

### logic.ts - The UI Logic
**Before:**
```typescript
if (msg.type === 'ADD_TASK') { ... }       // ❌ Legacy
if (msg.type === 'TOGGLE_TASK') { ... }    // ❌ Legacy
flux.dispatch({ type: 'TASK_ADDED' });     // ❌ Legacy event
flux.dispatch({ type: 'TASK_COMPLETED' }); // ❌ Legacy event
```

**After:**
```typescript
if (msg.type === 'create_task') { ... }    // ✓ MCP tool name
if (msg.type === 'complete_task') { ... }  // ✓ MCP tool name
// No legacy event dispatches - clean and simple!
```

## MCP Tools Definition

Defined in `aura.manifest.json`:

```json
{
  "tools": [
    {
      "name": "create_task",
      "description": "Create a new task in the user's list",
      "inputSchema": {
        "type": "object",
        "properties": {
          "title": { "type": "string", "description": "Title of the task" }
        },
        "required": ["title"]
      }
    },
    {
      "name": "complete_task",
      "description": "Mark a task as completed",
      "inputSchema": {
        "type": "object",
        "properties": {
          "id": { "type": "string", "description": "The ID of the task to complete" }
        },
        "required": ["id"]
      }
    },
    {
      "name": "list_tasks",
      "description": "Get all tasks. Use this before modifying to check state.",
      "inputSchema": { "type": "object", "properties": {} }
    }
  ]
}
```

## Benefits

1. **Single Source of Truth**: MCP tool names used everywhere
2. **No Translation Layer**: handler.ts simply forwards, doesn't translate
3. **Clean Code**: Removed ~100 lines of legacy message handling
4. **Future-Proof**: Easy to add new MCP tools without legacy baggage
5. **Testable**: Clear, simple message flow

## Removed Legacy Types

### Command Messages (Removed)
- `ADD_TASK` → replaced by `create_task`
- `TOGGLE_TASK` → replaced by `complete_task`
- `UPDATE_TASK` → not needed (use delete + create)

### Event Messages (Removed)
- `TASK_ADDED` → not needed (state updates are sufficient)
- `TASK_COMPLETED` → not needed (state updates are sufficient)

If other AIRs need to know about task changes, they can use:
- `REQUEST_CONTEXT` to fetch current state
- State injection (T34.3) for LLM context

## Testing

After rebuild, test with:
```bash
cd aura-stack/aura-starter
npx playwright test --grep "grocery list"
```

Expected console logs:
```
[Chat] Deferring tool call create_task on tasks-air
[TasksAIR inline] Flux Msg: create_task  ← MCP tool name!
[TasksAIR] Creating task: flour
```

## Next Steps

Other AIRs should follow this pattern:
1. Define MCP tools in `aura.manifest.json`
2. handler.ts forwards tools using MCP names
3. logic.ts listens for MCP tool names
4. Remove all legacy message types
