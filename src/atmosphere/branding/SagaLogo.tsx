import React from 'react';

interface SagaLogoProps {
    transparent?: boolean;
    color?: string;
    width?: number;
}

export const SagaLogo: React.FC<SagaLogoProps> = ({
    transparent = false,
    color = '#FFFFFF',
    width = 120
}) => {
    // Elegant, Serif-style logo for Saga
    // "Saga"
    return (
        <svg
            width={width}
            viewBox="0 0 200 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ filter: 'drop-shadow(0px 0px 10px rgba(255,255,255,0.3))' }}
        >
            <text
                x="10"
                y="60"
                fontFamily="Cinzel, serif"
                fontWeight="bold"
                fontSize="60"
                fill={color}
                style={{ letterSpacing: '0.1em' }}
            >
                SAGA
            </text>
            <path
                d="M10 70H190"
                stroke={color}
                strokeWidth="2"
                opacity={0.5}
            />
        </svg>
    );
};
