# Characters AIR

The **Characters AIR** fetches and displays the main cast for a given movie or TV series inspiration.

## Features

- **Real Data**: Fetches cast information directly from **TMDB** (The Movie Database).
- **Dual Mode**: Supports both **Movies** and **TV Series** automatically via `search/multi`.
- **Top Cast**: Displays the top 12 main characters.
- **Actor Names**: Explicitly lists the Actor playing the role.
- **Visuals**: 
  - Displays high-quality profile photos from TMDB.
  - "No Image" fallback with initials for cast members without photos.
  - Dark-mode optimized UI with gold accents for actors.
- **Persistence**: automatically saves the loaded specific characters to the project via Firestore, so they remain when you reload the project.

## Tech Stack

- **Frontend**: React, standard CSS Modules.
- **Backend**: Python (FastAPI), TMDB API.
- **Data Model**:
  - `name`: Character Name (e.g. "Tony Stark")
  - `role`: Actor Name (e.g. "Robert Downey Jr.")
  - `imageUrl`: TMDB Profile Path

## Screenshot
(Add screenshot here after verification)
