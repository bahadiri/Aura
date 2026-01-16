import { ImageManifest } from './manifest';
import { resources } from './resources';
import ImageUI from './ui';
import { useImageLogic } from './logic';
import React from 'react';

// The Module Component
const ImageAIR: React.FC<any> = (props) => {
    const logic = useImageLogic(props);

    return (
        <ImageUI
            src={logic.src}
            loading={logic.loading}
            error={logic.error}
            title={logic.title}
        />
    );
};

export default {
    manifest: ImageManifest,
    resources,
    component: ImageAIR
};

export { ImageAIR as Component };
