import React, { useState, useEffect } from 'react';

const PomodoroUI: React.FC = () => {
    const [seconds, setSeconds] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        let interval: any = null;
        if (isActive && seconds > 0) {
            interval = setInterval(() => {
                setSeconds(seconds => seconds - 1);
            }, 1000);
        } else if (seconds === 0) {
            setIsActive(false);
            if (interval) clearInterval(interval);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, seconds]);

    const toggle = () => {
        setIsActive(!isActive);
    };

    const reset = () => {
        setSeconds(25 * 60);
        setIsActive(false);
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
            color: '#333',
            fontFamily: 'sans-serif'
        }}>
            <div style={{ fontSize: '4rem', fontWeight: 'bold', marginBottom: '20px' }}>
                {formatTime(seconds)}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
                <button
                    onClick={toggle}
                    style={{
                        padding: '10px 20px',
                        fontSize: '1rem',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        backgroundColor: isActive ? '#ff6b6b' : '#4ecdc4',
                        color: 'white',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }}
                >
                    {isActive ? 'Pause' : 'Start'}
                </button>
                <button
                    onClick={reset}
                    style={{
                        padding: '10px 20px',
                        fontSize: '1rem',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        backgroundColor: '#eee',
                        color: '#555',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }}
                >
                    Reset
                </button>
            </div>
        </div>
    );
};

export default PomodoroUI;
