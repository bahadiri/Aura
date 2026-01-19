const getApiUrl = () => import.meta.env.VITE_SAGA_API_URL || 'http://localhost:8001';

export const resources = {
    api: {
        google: {
            image: {
                id: 'google-image-search',
                provider: 'proxy',
                config: {
                    url: 'https://www.googleapis.com/customsearch/v1',
                    method: 'GET',
                    auth: 'GOOGLE_SEARCH_KEY'
                }
            }
        },
        tmdb: {
            image: {
                id: 'tmdb-image-search',
                provider: 'proxy',
                get config() {
                    return {
                        url: `${getApiUrl()}/api/search/image`,
                        method: 'GET',
                        auth: 'NONE'
                    };
                }
            }
        }
    }
} as const;
