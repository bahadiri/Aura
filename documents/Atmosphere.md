# 🌍 The Atmosphere

**The Atmosphere** (formerly Registry) is the "air" that Aura breathes—it holds the definitions of every potential lifeform (AIR) that can exist in the system.

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
-   *"Spawn the Brainstorm Agent"* -> Atmosphere provides the component definition.
