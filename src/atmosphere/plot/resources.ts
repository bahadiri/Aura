export const resources = {
    api: {
        tmdb: {
            search: {
                url: "https://api.themoviedb.org/3/search/movie",
                method: "GET",
                auth: "TMDB_KEY"
            },
            searchTV: {
                url: "https://api.themoviedb.org/3/search/tv",
                method: "GET",
                auth: "TMDB_KEY"
            },
            details: {
                url: "https://api.themoviedb.org/3/movie/{id}",
                method: "GET",
                auth: "TMDB_KEY"
            },
            tvDetails: {
                url: "https://api.themoviedb.org/3/tv/{id}",
                method: "GET",
                auth: "TMDB_KEY"
            },
            season: {
                url: "https://api.themoviedb.org/3/tv/{id}/season/{season_number}",
                method: "GET",
                auth: "TMDB_KEY"
            }
        }
    },
    ai: {
        storyteller: {
            mode: "chat",
            model: "gemini-2.5-pro",
            systemPrompt: "You are an expert storyteller. Expand, explain, or modify the text based on user query. Maintain tone. output ONLY new text."
        }
    }
} as const;
