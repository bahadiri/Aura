# Tasks AIR

An interactive Task Management AIR (Atmosphere Interface Resource) for Aura, featuring Firestore persistence and Chat integration.

## Features
- **Task Management**: specific allocation and tracking of tasks.
- **Persistence**: Automatically saves tasks to Firestore via Aura Space persistence.
- **Chat Integration**: 
  - Chat can allocate tasks directly.
  - Completing a task notifies the System/Chat for follow-up.
- **Theming**: Fully compatible with Aura's Dark/Light modes.

## Usage
The Tasks AIR is managed by the Controller.

### Props
```typescript
interface TasksAIRProps {
    initialTasks?: TaskItem[]; // { id, label, completed }
    title?: string;
}
```

## Screenshot
![Tasks AIR Screenshot](./screenshot.png)
