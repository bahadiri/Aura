import React from 'react';

interface GibiLogoProps {
    transparent?: boolean;
    color?: string;
    width?: number;
}

export const GibiLogo: React.FC<GibiLogoProps> = ({
    transparent = false,
    color = '#FFD700', // Gold/Yellowish default
    width = 140
}) => {
    // Playful, bubbling logo for GibiGibi
    return (
        <svg
            width={width}
            viewBox="0 0 240 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <text
                x="10"
                y="55"
                fontFamily="Poppins, sans-serif"
                fontWeight="800"
                fontSize="45"
                fill={color}
            >
                Gibi
                <tspan fill="#FFF" opacity="0.8">Gibi</tspan>
            </text>
            <circle cx="210" cy="25" r="5" fill={color} />
            <circle cx="225" cy="15" r="3" fill={color} opacity="0.6" />
        </svg>
    );
};
