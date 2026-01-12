import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AURManager } from '../AURManager';
import { useAUR } from '../../context/AURContext';
import React from 'react';

// Mock the useAUR hook
vi.mock('../../context/AURContext', () => ({
    useAUR: vi.fn()
}));

describe('AURManager', () => {
    const mockRegistry = {
        'test-aur': ({ label }: { label: string }) => <div>Test AUR: {label}</div>
    };
    const mockIcons = {
        'test-aur': '🚀'
    };

    it('renders components from registry based on active AURs', () => {
        (useAUR as any).mockReturnValue({
            aurs: [
                { id: 'test-aur', isVisible: true, isMinimized: false, data: { label: 'Hello World' }, title: 'Test' }
            ],
            openAUR: vi.fn()
        });

        render(<AURManager registry={mockRegistry} icons={mockIcons} />);

        expect(screen.getByText('Test AUR: Hello World')).toBeInTheDocument();
    });

    it('renders tray items and handles minimized state', () => {
        (useAUR as any).mockReturnValue({
            aurs: [
                { id: 'test-aur', isVisible: false, isMinimized: true, data: {}, title: 'Minimized Test' }
            ],
            openAUR: vi.fn()
        });

        render(<AURManager registry={mockRegistry} icons={mockIcons} />);

        // Should NOT render the component content when minimized/hidden
        expect(screen.queryByText('Test AUR:')).not.toBeInTheDocument();

        // SHOULD render the tray icon
        expect(screen.getByText('🚀')).toBeInTheDocument();
    });
});
