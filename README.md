# 🌌 Aura

**A spatial, agentic window manager for the AI age.**

Aura rethinks the traditional desktop interface by replacing static windows with **AIRs** (Agentic Interface Respondents) that live in a shared, reactive environment called **The Space**.

![Aura Vision](assets/vision.png)

## Architecture

```mermaid
graph TD
    User((User)) -->|Interacts| Client[Aura Client]
    
    subgraph Client ["Aura (Browser/Desktop)"]
        Space[The Space]
        Flux[Flux Bus]
        
        subgraph AIRs ["AIRs (Agents)"]
            ChatAIR
            ImageAIR
            CustomAIR
        end
        
        Space -- Manage --> AIRs
        AIRs -- Broadcast --> Flux
        Flux -- Subscribe --> AIRs
    end
    
    Client -->|Syncs| Cloud[Persistence Layer]
```

## Documentation

For full documentation, architecture details, and developer guides, please visit the **[Project Wiki](https://github.com/bahadiri/Aura/wiki)**.
