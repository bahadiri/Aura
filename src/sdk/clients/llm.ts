import { ILlmClient, ILlmRequest, ILlmResourceConfig, ILlmResponse } from "../types";

export class LiteLLMClient implements ILlmClient {
    private gatewayUrl: string;

    constructor(gatewayUrl: string) {
        this.gatewayUrl = gatewayUrl.replace(/\/$/, ""); // Remove trailing slash
    }

    async invoke(resource: ILlmResourceConfig, request: ILlmRequest): Promise<ILlmResponse> {
        const url = `${this.gatewayUrl}/v1/chat/completions`;

        // Merge system prompt if present in resource
        let messages = [...request.messages];
        if (resource.systemPrompt) {
            messages = [{ role: "system", content: resource.systemPrompt }, ...messages];
        }

        const payload = {
            model: resource.model,
            messages: messages,
            temperature: request.temperature ?? 0.7,
            max_tokens: request.max_tokens,
        };

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // Use a dummy key if the proxy is handling auth via a Master Key, 
                    // or assume the Gateway is internal/protected by header injection elsewhere.
                    // For LiteLLM Proxy, we typically send the 'Authorization' header with a Virtual Key.
                    // For this implementation, we assume the host injects it or it's open for local dev.
                    // We'll send a placeholder.
                    "Authorization": "Bearer aura-internal-key"
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`LiteLLM Error (${response.status}): ${errText}`);
            }

            const data = await response.json();
            const content = data.choices?.[0]?.message?.content || "";

            return {
                content,
                raw: data
            };

        } catch (error) {
            console.error("Aura LLM Call Failed:", error);
            throw error;
        }
    }
}
