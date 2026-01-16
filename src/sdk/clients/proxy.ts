import { IProxyClient, IProxyRequest, IResourceConfig } from "../types";

export class GenericProxyClient implements IProxyClient {
    private proxyUrl: string;

    constructor(proxyUrl: string) {
        this.proxyUrl = proxyUrl;
    }

    async fetch<T = any>(resource: IResourceConfig, request?: IProxyRequest): Promise<T> {
        // We send the configuration (Target URL, Auth Key Name) to the Proxy
        // The Proxy (Saga) is responsible for resolving the Auth Key Name to an actual Secret

        // 1. Template Substitution (Handle {id} in URL)
        let finalUrl = resource.url || "";
        const finalParams = { ...(request?.params || {}) };

        // Regex to find {param}
        finalUrl = finalUrl.replace(/\{(\w+)\}/g, (_, key) => {
            if (finalParams[key]) {
                const val = finalParams[key];
                delete finalParams[key]; // Remove from query params if used in path
                return String(val);
            }
            return `{${key}}`; // Leave as is if missing (or error?)
        });

        // 2. Construct Payload
        const payload = {
            target_url: finalUrl,
            method: resource.method || "GET",
            auth_id: resource.auth,
            params: finalParams, // Remaining params go as Query String
            body: request?.body,
            headers: request?.headers
        };

        try {
            const response = await fetch(this.proxyUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Proxy Error (${response.status}): ${errText}`);
            }

            return await response.json();

        } catch (error) {
            console.error("Aura Proxy Call Failed:", error);
            throw error;
        }
    }
}
