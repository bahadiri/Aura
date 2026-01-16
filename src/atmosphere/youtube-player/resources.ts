export const resources = {
    api: {
        youtube: {
            search: {
                id: 'youtube-search',
                provider: 'proxy',
                config: {
                    url: 'https://www.googleapis.com/youtube/v3/search',
                    method: 'GET',
                    auth: 'YOUTUBE_KEY'
                }
            }
        }
    }
} as const;
