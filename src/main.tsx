import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/aur.module.css'
import './styles/theme.css'

import { AuraProvider } from './sdk';

const auraConfig = {
    // Default to localhost for dev, but allow override via env
    llmGatewayUrl: import.meta.env.VITE_AURA_LLM_GATEWAY || 'http://127.0.0.1:4000',
    proxyUrl: import.meta.env.VITE_AURA_API_PROXY || 'http://127.0.0.1:8001/api/proxy'
};

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <AuraProvider config={auraConfig}>
            <App />
        </AuraProvider>
    </React.StrictMode>,
)
