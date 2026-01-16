# Tasks AIR

An interactive Task Management AIR (Atmosphere Interface Resource) for Aura.

## Features
- **Task Management**: Create, toggle, and track tasks.
- **Persistence**: Tasks are automatically saved to the Project state in Firestore (via Window Properties).
- **Chat Integration**: 
  - **Add Tasks**: Chat can create tasks directly (listens for `ADD_TASK` events).
  - **Notifications**: Completing a task broadcasts an event (`TASK_COMPLETED`) to the Assistant.
- **Theming**: Fully compatible with Aura's Dark/Light modes.

## Usage
The Tasks AIR is typically managed by the Controller but can be operated manually.

### Props
```typescript
interface TasksAIRProps {
    initialTasks?: TaskItem[]; // { id, label, completed }
    title?: string;
}
```

## Screenshot
![Tasks AIR Screenshot](./screenshot.png)
