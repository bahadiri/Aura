import React from 'react';

interface TransparentHeaderProps {
    logo?: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
}

export const TransparentHeader: React.FC<TransparentHeaderProps> = ({
    logo,
    children,
    className = ''
}) => {
    return (
        <header
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 40px',
                background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)',
                zIndex: 1000,
                color: 'white'
            }}
            className={className}
        >
            <div style={{ display: 'flex', alignItems: 'center' }}>
                {logo}
            </div>
            <nav style={{ display: 'flex', gap: '20px' }}>
                {children}
            </nav>
        </header>
    );
};
