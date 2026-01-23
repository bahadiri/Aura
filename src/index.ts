export * from './sdk';
export * from './components/chat';
export { Space } from './controller/Space';

// Atmosphere AIRs - import and re-export with clear names
export { Component as PlotAIR } from './atmosphere/plot';
export { Component as CharacterAIR } from './atmosphere/characters';
export { Component as ImageAIR } from './atmosphere/image';
export { Component as NoteTakerAIR } from './atmosphere/note-taker';
export { Component as TasksAIR } from './atmosphere/tasks';
export { Component as YouTubePlayerAIR } from './atmosphere/youtube-player';

// Hooks
export { useVoiceInput } from './hooks/useVoiceInput';
export { ControllerProvider, useSharedController } from './controller/ControllerContext';
export { useControllerLogic } from './controller/useControllerLogic';
export { useController } from './controller/useController';

// Storage
export type { AuraStorageConfig } from './storage/config';
export { createStorage, getStorage } from './storage';
