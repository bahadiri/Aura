

> **💿 Aura Documentation**
> [🏠 Home](README.md) &nbsp; • &nbsp; [🏗️ Architecture](documents/Architecture.md) &nbsp; • &nbsp; [👩‍💻 Developer Guide](documents/Developer-Guide.md)

# 🌌 Aura System Overview

Aura is a **spatial, agentic window manager** designed for the AI age. It rethinks the traditional desktop interface by replacing static windows with "Adaptive User Representatives" (AURs) that live in a shared, reactive environment called **The Space**.

## Core Philosophy

Aura is built on three pillars:

1.  **The Space (Environment)**: A shared, limitless canvas where all applications coexist. Unlike a desktop, The Space is aware of the relationships between windows.
2.  **AURs (Adaptive User Representatives)**: More than just "apps" or "components," AURs are self-contained agents. They have their own UI, logic, and even "prompt libraries" that allow them to interact with LLMs autonomously.
3.  **HU (Hyper-Update)**: The communication bus that binds the system together. It's a high-speed, holographic signaling protocol that allows AURs to broadcast their state, intent, or data to any other AUR in The Space.

## Key Features

-   **Spatial Awareness**: Windows (AURs) know where they are relative to others. They can avoid overlapping, snap to grids, or "Orbit" related content.
-   **Agentic Core**: Every AUR is designed to be AI-native. They expose standard interfaces (`instructions`, `static_code`) that allow a central Agent Manager to control them programmatically.
-   **Extensibility**: The system is built on a dynamic `Registry`. New AURs can be added at runtime, similar to installing a plugin or an NPM package.

## Use Cases

-   **Creative Workflows**: A [Brainstorm AUR](documents/Developer-Guide.md#standard-aursbrainstorm) can spawn an [Image AUR](documents/Developer-Guide.md#standard-aursimage) to visualize ideas.
-   **Data Analysis**: A [Query AUR](documents/Developer-Guide.md#standard-aursquery) can broadcast a selected dataset via [HU](documents/Architecture.md#data-flow-the-hu-hyper-update).
-   **Complex Dashboards**: Build mission-control style interfaces where every panel is aware of the others context.

## Documentation Index

- [Architecture](documents/Architecture.md): Deep dive into the Registry, HU Protocol, and Manifests.
- [Developer Guide](documents/Developer-Guide.md): Step-by-step tutorial on creating new AURs.
