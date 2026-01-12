export interface WindowState {
    id: string; // Runtime ID (e.g., 'weather-air-123')
    manifestId: string; // The AIR Type (e.g., 'weather-air')
    props: any; // Props passed to the component
    zIndex: number;
    position: { x: number; y: number };
    size?: { width: number; height: number };
    isMinimized: boolean;
}
