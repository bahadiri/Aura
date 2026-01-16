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
                config: {
                    url: 'http://127.0.0.1:8001/api/search/image',
                    method: 'GET',
                    auth: 'NONE'
                }
            }
        }
    }
} as const;
