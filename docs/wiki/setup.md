# Setup Aura

Aura is designed to be a framework-agnostic frontend for Generative UI. This guide covers how to configure the storage layer in your application.

## Storage Configuration

Aura uses a driver-based storage abstraction to handle **Documents** (JSON data like Projects) and **Objects** (Files/Images).

The configuration is **required** by `AuraProvider` and should happen in your application entry point (e.g., `App.tsx` or `main.tsx`).

### 1. Recommended Structure (Centralized Config)

We recommend creating a `src/config/storage.ts` file in your application. 

> [!NOTE]
> Configuration for `documents` and `objects` are completely independent. This allows you to mix providers (e.g. Firestore for data, S3 for objects) or use different project credentials for each.

```typescript
// src/config/storage.ts
import { AuraStorageConfig } from '@aura/core/sdk';

// Define shared credentials if applicable, or separate them.
const firebaseCredentials = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    // ... other keys
};

export const storageConfig: AuraStorageConfig = {
    // 1. Document Driver
    documents: { 
        driver: 'firebase', // 'filesystem' (default) | 'firebase' | 'supabase'
        config: firebaseCredentials,
        emulator: {
            enabled: import.meta.env.DEV,
            host: 'localhost',
            port: 8080 // Firestore Port
        }
    },

    // 2. Object Driver
    objects: {
        driver: 'firebase', 
        config: firebaseCredentials,
        emulator: {
            enabled: import.meta.env.DEV,
            host: 'localhost',
            port: 9199 // Storage Port
        }
    }
};
```

### 2. Injecting into Aura

Pass this configuration to the `AuraProvider` in your main app component:

```tsx
// src/App.tsx
import { AuraProvider } from '@aura/core/sdk';
import { storageConfig } from './config/storage';

const auraConfig = {
  llmGatewayUrl: '...',
  proxyUrl: '...',
  storage: storageConfig // <--- Required
};

function App() {
  return (
    <AuraProvider config={auraConfig}>
       {/* Your App */}
    </AuraProvider>
  );
}
```

### 3. Usage & Deployment

#### Local Development (Default)
By default, set `driver: 'filesystem'`. This requires **zero setup** and stores data in your browser's IndexedDB. Ideally, your repository should commit the config with `filesystem` as the default to ensure easy onboarding for new developers.

#### Production Deployment
When deploying (e.g., to Vercel/Netlify backed by Firebase):

1.  Set up your `.env` variables for the cloud provider.
2.  Change the driver in `src/config/storage.ts` (or use an env var to toggle it):

```typescript
documents: {
    driver: import.meta.env.VITE_STORAGE_PROVIDER as any || 'filesystem',
    // ...
}
```
