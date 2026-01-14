

> **💿 Aura Documentation**


# 🌌 Aura System Overview

Aura is a **spatial, agentic window manager** designed for the AI age. It rethinks the traditional desktop interface by replacing static windows with "Agentic Interface Respondents" (AIRs) that live in a shared, reactive environment called **The Space**.

## Core Philosophy

Aura is built on three pillars:

1.  **The Space (Environment)**: A shared, limitless canvas where all applications coexist. Unlike a desktop, The Space is aware of the relationships between windows.
2.  **AIRs (Agentic Interface Respondents)**: More than just "apps" or "components," AIRs are self-contained agents. They have their own UI, logic, and even "prompt libraries" that allow them to interact with LLMs autonomously.
3.  **Flux (Communication)**: The communication bus that binds the system together. It's a high-speed, holographic signaling protocol that allows AIRs to broadcast their state, intent, or data to any other AIR in The Space.

## Key Features

-   **Spatial Awareness**: Windows (AIRs) know where they are relative to others. They can avoid overlapping, snap to grids, or "Orbit" related content.
-   **Agentic Core**: Every AIR is designed to be AI-native. They expose standard interfaces (`instructions`, `static_code`) that allow the **Controller** (Central Intelligence) to control them programmatically.
-   **Extensibility**: The system is built on a dynamic `Atmosphere` (Registry). New AIRs can be added at runtime, similar to installing a plugin or an NPM package.

## Use Cases

-   **Creative Workflows**: A [Brainstorm AIR](documents/Developer-Guide.md#standard-aursbrainstorm) can spawn an [Image AIR](documents/Developer-Guide.md#standard-aursimage) to visualize ideas.
-   **Data Analysis**: A [Query AIR](documents/Developer-Guide.md#standard-aursquery) can broadcast a selected dataset via [Flux](documents/Architecture.md#data-flow-flux).
-   **Complex Dashboards**: Build mission-control style interfaces where every panel is aware of the others context.

## Configuration

When integrating Aura into a host application, the following environment variables should be configured:

### Firebase (Required for Persistence)
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### AIR-Specific Credentials

| AIR | Required Variables |
|-----|--------------------|
| **ImageAIR** | `VITE_GOOGLE_SEARCH_API_KEY`, `VITE_GOOGLE_SEARCH_CX` |
| **YoutubePlayerAIR** | Uses backend `/api/search/video` endpoint |
| **PlotAIR** | Uses backend `/api/search` endpoint (TMDB) |

### Backend Integration
Aura expects certain backend endpoints for AI features:
- `/api/chat/reflect` - AI reflection for intent detection
- `/api/search` - Movie/TV search (TMDB)
- `/api/search/video` - YouTube video search

> **Note**: The host app (e.g., Saga) must provide these endpoints. Aura handles Firebase Storage uploads directly.

## Documentation

Full documentation is available in the [Project Wiki](https://github.com/bahadiri/Aura/wiki).
