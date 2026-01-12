
import React from 'react';
import { useAUR } from '../context/AURContext';
import type { AURState } from '../context/AURContext';
import { AURContainer } from './AURContainer';
import styles from './AUR.module.css';
import { auraRegistry } from '../registry';

interface AURManagerProps {
    registry?: Record<string, React.ComponentType<any>>;
    icons?: Record<string, string>;
}

export const AURManager: React.FC<AURManagerProps> = ({ registry, icons }) => {
    const { aurs, openAUR } = useAUR();

    // Merge provided registry with the global registry
    const componentMap = { ...auraRegistry.getComponentMap(), ...registry };
    const iconMap = { ...auraRegistry.getIconMap(), ...icons };

    return (
        <div className={styles.aurManager}>
            {/* Workspace Area for Active AURs */}
            {aurs.filter((aur: AURState) => aur.isVisible && !aur.isMinimized).map((aur: AURState) => {
                // Try to find component by ID first, then by type
                const Component = componentMap[aur.id] || componentMap[aur.type];
                if (!Component) return null;

                return (
                    <AURContainer key={aur.id} id={aur.id}>
                        <Component {...aur.data} />
                    </AURContainer>
                );
            })}

            {/* Bottom Tray / Dock */}
            <div className={styles.aurTray}>
                {aurs.filter(aur => aur.isVisible || aur.isMinimized).map((aur: AURState) => (
                    <div
                        key={aur.id}
                        className={`${styles.trayItem} ${aur.isVisible && !aur.isMinimized ? styles.trayItemActive : ''}`}
                        onClick={() => openAUR(aur.id)}
                        title={aur.title}
                    >
                        {iconMap[aur.id] || iconMap[aur.type] || '•'}
                    </div>
                ))}
            </div>
        </div>
    );
};
