

> **💿 Aura Documentation**


# 🌌 Aura System Overview

Aura is a **spatial, agentic window manager** designed for the AI age. It rethinks the traditional desktop interface by replacing static windows with "Agentic Interactive Respondents" (AIRs) that live in a shared, reactive environment called **The Space**.

## Core Philosophy

Aura is built on three pillars:

1.  **The Space (Environment)**: A shared, limitless canvas where all applications coexist. Unlike a desktop, The Space is aware of the relationships between windows.
2.  **AIRs (Agentic Interactive Respondents)**: More than just "apps" or "components," AIRs are self-contained agents. They have their own UI, logic, and even "prompt libraries" that allow them to interact with LLMs autonomously.
3.  **Flux (Communication)**: The communication bus that binds the system together. It's a high-speed, holographic signaling protocol that allows AIRs to broadcast their state, intent, or data to any other AIR in The Space.

## Key Features

-   **Spatial Awareness**: Windows (AIRs) know where they are relative to others. They can avoid overlapping, snap to grids, or "Orbit" related content.
-   **Agentic Core**: Every AIR is designed to be AI-native. They expose standard interfaces (`instructions`, `static_code`) that allow the **Caster** (Central Intelligence) to control them programmatically.
-   **Extensibility**: The system is built on a dynamic `Atmosphere` (Registry). New AIRs can be added at runtime, similar to installing a plugin or an NPM package.

## Use Cases

-   **Creative Workflows**: A [Brainstorm AIR](documents/Developer-Guide.md#standard-aursbrainstorm) can spawn an [Image AIR](documents/Developer-Guide.md#standard-aursimage) to visualize ideas.
-   **Data Analysis**: A [Query AIR](documents/Developer-Guide.md#standard-aursquery) can broadcast a selected dataset via [Flux](documents/Architecture.md#data-flow-flux).
-   **Complex Dashboards**: Build mission-control style interfaces where every panel is aware of the others context.

## Documentation

Full documentation is available in the [Project Wiki](https://github.com/bahadiri/Aura/wiki).
