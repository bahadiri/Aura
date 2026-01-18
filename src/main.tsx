import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/aur.module.css'
import './styles/theme.css'

import { AuraProvider } from './sdk';
import { createStorage, AuraStorageConfig } from './storage';

const storageConfig: AuraStorageConfig = {
    documents: {
        driver: import.meta.env.VITE_STORAGE_PROVIDER as any || 'firebase',
        config: {
            apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
            authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
            projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'saga-9dd98',
            storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
            appId: import.meta.env.VITE_FIREBASE_APP_ID
        },
        emulator: {
            enabled: import.meta.env.DEV,
            host: 'localhost',
            port: 8080
        }
    },
    objects: {
        driver: import.meta.env.VITE_STORAGE_PROVIDER as any || 'firebase',
        config: {
            apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
            authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
            projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'saga-9dd98',
            storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
            appId: import.meta.env.VITE_FIREBASE_APP_ID
        },
        emulator: {
            enabled: import.meta.env.DEV,
            host: 'localhost',
            port: 9199
        }
    }
};

// Initialize Storage Singleton
createStorage(storageConfig);

const auraConfig = {
    // Default to localhost for dev, but allow override via env
    llmGatewayUrl: import.meta.env.VITE_AURA_LLM_GATEWAY || 'http://127.0.0.1:4000',
    proxyUrl: import.meta.env.VITE_AURA_API_PROXY || 'http://127.0.0.1:8001/api/proxy',
    storage: storageConfig
};

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <AuraProvider config={auraConfig}>
            <App />
        </AuraProvider>
    </React.StrictMode>,
)
