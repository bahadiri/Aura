import { WindowState } from './types';

export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Finds the best position for a new window by minimizing overlap with existing windows.
 * It uses a grid-based search and a heuristic to prefer clean spaces.
 */
export function findOptimalPosition(
    existingWindows: WindowState[],
    newSize: { width: number; height: number },
    screen: { width: number; height: number }
): { x: number; y: number } {
    const padding = 40;
    const step = 40;

    // 1. Get visible rects
    const busyRects: Rect[] = existingWindows
        .filter(w => !w.isMinimized)
        .map(w => ({
            x: w.position.x,
            y: w.position.y,
            width: w.size?.width || 400,
            height: w.size?.height || 300
        }));

    // 2. Define the Search Space
    // We try many candidate spots and score them.
    const candidates: { x: number; y: number; score: number }[] = [];

    // Avoid the very edges and taskbar area if possible
    const startX = padding;
    const startY = padding;
    const endX = screen.width - newSize.width - padding;
    const endY = screen.height - newSize.height - padding - 60; // Offset for potential taskbar

    for (let x = startX; x <= endX; x += step) {
        for (let y = startY; y <= endY; y += step) {
            const candidate: Rect = { x, y, width: newSize.width, height: newSize.height };

            let overlapArea = 0;
            let overlapCount = 0;

            for (const busy of busyRects) {
                const intersectX = Math.max(candidate.x, busy.x);
                const intersectY = Math.max(candidate.y, busy.y);
                const intersectW = Math.min(candidate.x + candidate.width, busy.x + busy.width) - intersectX;
                const intersectH = Math.min(candidate.y + candidate.height, busy.y + busy.height) - intersectY;

                if (intersectW > 0 && intersectH > 0) {
                    overlapArea += (intersectW * intersectH);
                    overlapCount++;
                }
            }

            // Heuristic Scoring:
            // - Priority 1: Zero overlap.
            // - Priority 2: Minimum overlap area.
            // - Bonus: Prefer being on the right half if existing windows are on the left (or vice versa).
            // - Bonus: Favor top-ish positions.

            // We want to MINIMIZE the score.
            let score = overlapArea;

            // Small penalty for being too far from the "last" window (to keep things somewhat clustered but separate)
            // or just favor a natural flow.
            score += (x * 0.01) + (y * 0.02);

            // Strongly discourage full-center (unless nothing else fits)
            const centerX = screen.width / 2;
            const centerY = screen.height / 2;
            const distFromCenter = Math.sqrt(Math.pow(x + newSize.width / 2 - centerX, 2) + Math.pow(y + newSize.height / 2 - centerY, 2));
            if (distFromCenter < 100) score += 5000;

            candidates.push({ x, y, score });
        }
    }

    // Sort by score ascending
    candidates.sort((a, b) => a.score - b.score);

    if (candidates.length > 0) {
        // Add a tiny bit of random jitter or just take the best
        return { x: candidates[0].x, y: candidates[0].y };
    }

    // Absolute fallback
    return {
        x: Math.random() * (screen.width - newSize.width),
        y: Math.random() * (screen.height - newSize.height)
    };
}
