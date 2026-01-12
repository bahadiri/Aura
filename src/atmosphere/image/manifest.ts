import { AIRManifest } from '../types';
import { ImageAIR } from './ImageAIR';

export const ImageManifest: AIRManifest = {
    id: 'image-air',
    component: ImageAIR,
    meta: {
        title: 'Image Viewer',
        icon: '🖼️',
        description: 'Displays a single image with a title.',
        width: 400,
        height: 500
    }
};
