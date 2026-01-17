# 🌍 The Atmosphere

**The Atmosphere** is now a **reviewed registry** included in the main repository. It serves as the definitive source for "AIRs" (Aura Integrated Resources), allowing any developer to contribute and extend the system capabilities.

## Role & Responsibility

The Atmosphere acts as the **Gatekeeper** and **Library** for the Controller. It ensures that only valid, safe, and compatible agents are allowed to interact with the system.

### 1. Gatekeeper (Validation)
When a new AIR is introduced (e.g., loaded from a plugin), the Atmosphere validates it against the **AIR Standard (v0.1)**. It checks for:
-   **Identity**: Unique ID and metadata.
-   **Safety**: Sandboxing requirements.
-   **Interface**: Compliance with the `AIRManifest`.

### 2. Library (Discovery)
The Controller consults the Atmosphere to know what is possible.
-   *"Do we have an agent that can handle Weather?"* -> Atmosphere checks its index.
-   *"Spawn the Chat Agent"* -> Atmosphere provides the component definition.

## Available AIRs

The following AIRs are currently available in the Atmosphere:

### 🎭 Characters AIR
Analyze and visualize characters from movies or stories.
[Source](https://github.com/bahadiri/Aura/tree/main/src/atmosphere/characters)

### 🖼️ Image AIR
Search for images using Google or TMDB APIs to visualize concepts.
[Source](https://github.com/bahadiri/Aura/tree/main/src/atmosphere/image)

### 📝 Note Taker AIR
Take notes during brainstorming sessions, available as a side panel or popped-out window.
[Source](https://github.com/bahadiri/Aura/tree/main/src/atmosphere/note-taker)

### 📜 Plot AIR
Generate and display plot outlines or story beats.
[Source](https://github.com/bahadiri/Aura/tree/main/src/atmosphere/plot)

### ✅ Tasks AIR
Manage project tasks and todo lists directly within Aura.
[Source](https://github.com/bahadiri/Aura/tree/main/src/atmosphere/tasks)

### 📺 YouTube Player AIR
Search for and play YouTube videos directly in the workspace.
[Source](https://github.com/bahadiri/Aura/tree/main/src/atmosphere/youtube-player)
