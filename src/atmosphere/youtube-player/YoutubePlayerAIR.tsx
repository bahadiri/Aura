import React from 'react';
import { useYoutubePlayer, YoutubePlayerAIRProps } from './model';
import { View } from './view';

export type { YoutubePlayerAIRProps };

export const YoutubePlayerAIR: React.FC<YoutubePlayerAIRProps> = (props) => {
    const { videoId, url, isLoading, error } = useYoutubePlayer(props);

    return (
        <View videoId={videoId} url={url} isLoading={isLoading} error={error} />
    );
};
