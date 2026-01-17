# Saga & Aura Integration Architecture

This document describes the high-level architecture connectivity between Saga, Aura, and the Atmosphere ecosystem.

## Vision Overview

The architecture consists of a few key components:
1.  **Atmosphere**: A vast cloud registry containing thousands of **AIRs**.
2.  **Saga Frontend**: The user's project environment which integrates **Aura**.
3.  **Aura**: The integration layer living inside the Saga frontend, responsible for managing AIRs.
4.  **Saga Backend**: The centralized backend service that handles heavy lifting, including a standardized LLM interface.

## Architecture Diagram

```mermaid
graph TD
    %% Styling
    classDef cloud fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#0d47a1;
    classDef frontend fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#4a148c;
    classDef backend fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#1b5e20;
    classDef component fill:#fffde7,stroke:#fbc02d,stroke-width:2px,color:#f57f17;
    classDef external fill:#f5f5f5,stroke:#616161,stroke-dasharray: 5 5,color:#212121;

    subgraph Atmosphere ["Atmosphere Registry"]
        AirRegistry[1000 AIRs]
    end
    class Atmosphere cloud

    subgraph SagaProject ["Saga Frontend"]
        subgraph Aura ["Aura"]
            YouTubeAIR[YouTubeAIR]
            GenericAIR[GenericAIR]
            OtherAIRs[...]
        end
    end
    class SagaProject frontend
    class YouTubeAIR,GenericAIR,OtherAIRs component

    subgraph Backend ["Saga Backend"]
        API[Main API]
        subgraph LLM_Layer ["Centralized LLM Handling"]
            LiteLLM[LiteLLM / OpenAI Std]
        end
    end
    class Backend backend

    subgraph External ["External Services"]
        YouTubeAPI[YouTube API]
        LLMProviders[LLM Providers]
    end
    class External external

    %% Relationships
    Atmosphere -- "Import/Pick AIRs" --> Aura
    
    %% AIR connections
    YouTubeAIR -- "API Calls" --> YouTubeAPI
    YouTubeAIR -- "LLM Calls" --> API
    GenericAIR -- "API Calls" --> API
    
    %% Backend connections
    API --> LLM_Layer
    LLM_Layer --> LLMProviders

    %% Note on Aura
    style Aura fill:#fff3e0,stroke:#e65100,stroke-width:2px
```

## Component Descriptions

### Atmosphere
Atmosphere acts as the global marketplace or registry. It hosts:
-   **AIRs**: Plug-and-play modules for Aura.
Developers pick and choose AIRs from Atmosphere to import into their local Saga project.

### Aura (in Saga Frontend)
Aura is the "kernel" or manager embedded within the Saga Frontend. It hosts the selected AIR instances (like `YouTubeAIR` or `GenericAIR`). It provides the runtime environment for these modules to exist and communicate.

### AIRs
Individual modules that run inside Aura.
-   **YouTubeAIR**: An example module that might talk directly to external APIs (like YouTube) or through the backend.
-   **GenericAIR**: Represents standard modules that communicate with the Saga Backend for business logic.

### Saga Backend
The separate backend service.
-   **Centralized LLM Handling**: To optimize performance and cost, all LLM interactions are routed through the backend.
-   **LiteLLM**: Used to standardize calls to the OpenAI format, abstracting away specific provider differences.
