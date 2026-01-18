import { AIRManifest } from '../types';

export const PomodoroManifest: Omit<AIRManifest, 'component'> = {
    id: 'pomodoro-air',
    meta: {
        title: 'Pomodoro',
        icon: '🍅',
        description: 'Focus timer.',
        width: 300,
        height: 400
    }
};
