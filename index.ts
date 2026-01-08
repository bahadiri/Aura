export { useVoiceInput } from './voice/useVoiceInput';
export { useAgentManager } from './agent/useAgentManager';
export { FlowingText } from './components/FlowingText';
export { MagnifiedFocus } from './components/MagnifiedFocus';
export type { AgentConfig, Message } from './agent/useAgentManager';

// --- AUR System ---
export { AURProvider, useAUR } from './context/AURContext';
export type { AURState, AURType } from './context/AURContext';
export { AURContainer } from './components/AURContainer';
export { AURManager } from './components/AURManager';
export { useAURSignal } from './hooks/useAURSignal';
