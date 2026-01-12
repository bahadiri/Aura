export interface YoutubePlayerAIRProps {
    videoId?: string;
    autoplay?: boolean;
}

export const useYoutubePlayer = ({ videoId, autoplay = false }: YoutubePlayerAIRProps) => {
    const url = videoId
        ? `https://www.youtube.com/embed/${videoId}${autoplay ? '?autoplay=1' : ''}`
        : null;

    return {
        videoId,
        url
    };
};
