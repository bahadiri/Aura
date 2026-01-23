import { useSharedController } from './ControllerContext';

// Backward compatibility or direct usage now delegates to the shared context
export function useController() {
    return useSharedController();
}
