import React from 'react';
import { SagaLogo } from './SagaLogo';
import { GibiLogo } from './GibiLogo';
import { TransparentHeader } from './TransparentHeader';

const BrandingShowcase: React.FC = () => {
    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            background: '#1a1a1a',
            overflow: 'auto',
            fontFamily: 'sans-serif'
        }}>
            {/* SAGA PREVIEW */}
            <section style={{ position: 'relative', height: 400, background: 'linear-gradient(45deg, #0f2027, #203a43, #2c5364)' }}>
                <TransparentHeader logo={<SagaLogo />}>
                    <button style={{ background: 'transparent', border: '1px solid white', color: 'white', padding: '8px 16px', borderRadius: 4 }}>Login</button>
                </TransparentHeader>
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexDirection: 'column' }}>
                    <h1>Saga Hero Section</h1>
                    <p>Transparent Header Test</p>
                </div>
            </section>

            {/* SAGA LOGO VARIANTS */}
            <section style={{ padding: 40, background: '#111' }}>
                <h2 style={{ color: '#888', marginBottom: 20 }}>Saga Logo Variants</h2>
                <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
                    <SagaLogo width={200} />
                    <SagaLogo width={150} color="#aaa" />
                    <div style={{ background: 'white', padding: 20 }}>
                        <SagaLogo width={150} color="#000" />
                    </div>
                </div>
            </section>

            {/* GIBI PREVIEW */}
            <section style={{ position: 'relative', height: 400, marginTop: 40, background: 'linear-gradient(135deg, #fce38a, #f38181)' }}>
                <TransparentHeader logo={<GibiLogo />}>
                    <button style={{ background: 'black', border: 'none', color: 'white', padding: '10px 20px', borderRadius: 20, fontWeight: 'bold' }}>İzle</button>
                </TransparentHeader>
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', flexDirection: 'column' }}>
                    <h1>Gibi Hero Section</h1>
                    <p>Playful Vibes</p>
                </div>
            </section>

            {/* GIBI LOGO VARIANTS */}
            <section style={{ padding: 40, background: '#222' }}>
                <h2 style={{ color: '#888', marginBottom: 20 }}>Gibi Logo Variants</h2>
                <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
                    <GibiLogo width={240} />
                    <GibiLogo width={180} />
                    <div style={{ background: 'white', padding: 20 }}>
                        <GibiLogo width={180} color="#f0c" />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default BrandingShowcase;
