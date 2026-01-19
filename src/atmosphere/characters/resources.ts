import { ENRICH_SYSTEM_PROMPT } from './prompts';

export const resources = {
    api: {
        tmdb: {
            // Reusing the same search endpoint as PlotAIR or similar
            search: {
                id: 'tmdb-search-movie',
                provider: 'proxy',
                config: {
                    url: 'https://api.themoviedb.org/3/search/movie',
                    method: 'GET',
                    auth: 'TMDB_KEY'
                }
            },
            searchTV: {
                id: 'tmdb-search-tv',
                provider: 'proxy',
                config: {
                    url: 'https://api.themoviedb.org/3/search/tv',
                    method: 'GET',
                    auth: 'TMDB_KEY'
                }
            },
            credits: {
                id: 'tmdb-movie-credits',
                provider: 'proxy',
                config: {
                    url: 'https://api.themoviedb.org/3/movie/{id}/credits', // {id} to be replaced in logic
                    method: 'GET',
                    auth: 'TMDB_KEY'
                }
            },
            creditsTV: {
                id: 'tmdb-tv-credits',
                provider: 'proxy',
                config: {
                    url: 'https://api.themoviedb.org/3/tv/{id}/credits',
                    method: 'GET',
                    auth: 'TMDB_KEY'
                }
            }
        },
        llm: {
            enrich: {
                mode: 'chat',
                model: 'gemini-2.5-pro',
                systemPrompt: ENRICH_SYSTEM_PROMPT
            }
        }
    }
} as const;

