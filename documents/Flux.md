# ⚡ Flux Architecture

**Flux** is the high-speed, holographic signaling protocol that acts as the central nervous system of Aura. It enables instantaneous, bidirectional communication between the **Controller** (System Core) and **AIRs** (Agents), as well as peer-to-peer communication between AIRs.

## Core Concepts

Flux is not just an event bus; it is a **spatial message transport**. It allows entities to "dispatch" signals that propagate through the environment (The Space).

### Targeted Dispatch

Unlike simple broadcast systems, Flux supports precise targeting. A message can be directed to:
-   **Specific AIR**: By ID (e.g., `weather-air-1`).
-   **The Controller**: To request system-level actions (e.g., "Open a new window").
-   **Broadcast**: To all entities in The Space (e.g., "Theme changed to Dark Mode").

## The Flow

1.  **Emission**: An entity (AIR or Controller) dispatches a structured message.
2.  **Routing**: Flux analyzes the `to` field and routes the message.
3.  **Reaction**: The recipient receives the payload and executes its internal logic.
