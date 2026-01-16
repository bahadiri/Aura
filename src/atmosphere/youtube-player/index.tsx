import { YoutubePlayerManifest } from './manifest';
import { resources } from './resources';
import YoutubeUI from './ui';
import { useYoutubeLogic } from './logic';
import React from 'react';

// The Module Component
const YoutubePlayerAIR: React.FC<any> = (props) => {
    const logic = useYoutubeLogic(props);

    return (
        <YoutubeUI
            videoId={logic.videoId}
            url={logic.url}
            isLoading={logic.isLoading}
            error={logic.error}
        />
    );
};

export default {
    manifest: YoutubePlayerManifest,
    resources,
    component: YoutubePlayerAIR
};

export { YoutubePlayerAIR as Component };
