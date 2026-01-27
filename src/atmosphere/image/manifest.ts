import { AIRManifest } from '../types';

export const ImageManifest: Omit<AIRManifest, 'component'> = {
    id: 'image-air',
    meta: {
        title: 'Image Viewer',
        icon: '🖼️',
        description: 'Displays a single image with a title.',
        width: 400,
        height: 500
    },
    discovery: {
        keywords: ['image', 'photo', 'picture', 'poster', 'show me'],
        category: 'media',
        priority: 60
    }
};
