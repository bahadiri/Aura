
import React from 'react';
import { useAUR } from '../context/AURContext';
import type { AURType, AURState } from '../context/AURContext';
import { AURContainer } from './AURContainer';
import styles from './AUR.module.css';

interface AURManagerProps {
    registry: Record<string, React.ComponentType<any>>;
    icons: Record<string, string>;
}

export const AURManager: React.FC<AURManagerProps> = ({ registry, icons }) => {
    const { aurs, openAUR } = useAUR();

    return (
        <div className={styles.aurManager}>
            {/* Workspace Area for Active AURs */}
            {aurs.filter((aur: AURState) => aur.isVisible && !aur.isMinimized).map((aur: AURState) => {
                const Component = registry[aur.id];
                if (!Component) return null;

                return (
                    <AURContainer key={aur.id} id={aur.id}>
                        <Component data={aur.data} />
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
                        {icons[aur.id] || '•'}
                    </div>
                ))}
            </div>
        </div>
    );
};
