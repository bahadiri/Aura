# Plot AIR

The **Plot AIR (Atmosphere Intelligent Resource)** provides detailed plot summaries and episode guides for Movies and TV Series within the Aura workspace. It leverages multiple data sources and AI expansion capabilities.

![Plot AIR Screenshot](./screenshot.png)

## Features

-   **Multi-Source Data**:
    -   **Movies**: Fetches data from **TMDB** (The Movie Database).
    -   **TV Series**: Fetches data from **TVMaze**.
-   **Chat Expansion**:
    -   Users can ask for more details or expand specific parts of the plot using the "Expand / Ask Details" feature.
    -   Powered by **Gemini 2.5 Pro** via the Saga backend.
-   **Episode Guide**:
    -   Displays episode lists for series with summaries.
    -   Supports lazy loading of episode details.
-   **Aesthetic UI**:
    -   Clean, dark-mode design with improved typography.
    -   Interactive elements with hover effects.

## Usage

### Props

The `PlotAIR` component accepts the following props:

```typescript
interface UsePlotAIRProps {
    mode?: 'series' | 'movie'; // Default: 'series'
    seriesTitle?: string;
    moviePlot?: string;        // Initial plot content
    initialEpisodes?: Episode[]; // Initial list of episodes
    query?: string;            // Search query to fetch content if missing
    prompt?: string;           // Optional prompt to display
}
```

### Manifest

Located in `manifest.ts`:

```typescript
export const PlotManifest: AIRManifest = {
    id: 'plot-air',
    component: PlotAIR,
    meta: {
        title: 'Plot',
        description: 'Screenplay summaries and episode guides',
        width: 500,
        height: 600,
        icon: '📝',
    }
};
```

## Internal Logic

1.  **Initialization**:
    -   If `moviePlot` or `initialEpisodes` are provided, they are displayed immediately.
    -   If `query` is provided and content is missing, `usePlotAIR` triggers a search to the Saga backend (`/api/search`).

2.  **Source Switching**:
    -   `mode="movie"` queries TMDB.
    -   `mode="series"` queries TVMaze.

3.  **Expansion**:
    -   Clicking "Expand / Ask Details" sends the current text and user query to `/api/search/expand`.
    -   The result updates the displayed plot text.

4.  **Reverse-Reflection**:
    -   The Aura Controller can read the content of this AIR via `useController().getContext()` to inform the main chat about what the user is reading.

## Screenshot

To capture a real screenshot of this AIR in action:
1. Run the application (`npm run dev` in the Aura directory)
2. Navigate to `http://localhost:5173`
3. Create or open a project
4. In the chat, type: "Show me the plot of Inception"
5. Take a screenshot of the Plot AIR window and save it as `screenshot.png` in this directory
