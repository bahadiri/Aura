# PlotAIR

**Concept:** The Storyteller
**Role:** Displays and expands content plot summaries.
**Capabilities:**
- **Search:** Finds movies and series from TMDB via Generic Proxy.
- **Intelligence:** Uses `gemini-2.5-pro` (via LiteLLM) to expand plots on demand.

## Architecture
- **manifest.ts:** Static identity.
- **resources.ts:** Defines `api.tmdb` and `ai.storyteller`.
- **logic.ts:** Manages state and `useAura` calls.
- **ui/index.tsx:** Pure React presentation.

## Usage
Interact via the main Saga Controller. Opening a "Plot" intent triggers this AIR.
