import { test, expect } from '@playwright/test';

test.describe('Saga Chat Intent Verification', () => {
    test.beforeEach(async ({ page }) => {
        // Debugging console logs
        page.on('console', msg => console.log(`[Browser Console] ${msg.text()}`));

        // 1. Check if /login works (sanity check for server and router)
        // await page.goto('/login');
        // await expect(page.getByText('Sign in to Saga')).toBeVisible({ timeout: 5000 });

        // 2. Go to project page. 
        // We use a dummy project ID. The backend might 404 on the API call, 
        // but the frontend route /project/:id should match.
        await page.goto('/project/verify-intent');

        // Debug: Check if we are stuck on loading
        await expect(page.getByText('Initializing...')).not.toBeVisible({ timeout: 5000 });
        await expect(page.getByText('Preparing Space...')).not.toBeVisible({ timeout: 5000 });

        // Wait for the chat input to be ready
        await expect(page.getByPlaceholder('Type or speak...')).toBeVisible({ timeout: 10000 });
    });

    test('Image Intent: Show me the Titanic poster', async ({ page }) => {
        const input = page.getByPlaceholder('Type or speak...');
        await input.fill('Show me the Titanic poster');
        await page.getByRole('button', { name: 'Send' }).click();

        // Wait for ImageAIR. 
        // We check for some visual indication like an image tag or specific text if we knew it.
        // Assuming ImageAIR renders an img.
        await expect(page.locator('div[data-testid="image-air"], img')).toBeVisible({ timeout: 10000 });
    });

    test('Plot Intent: What is Titanic about?', async ({ page }) => {
        const input = page.getByPlaceholder('Type or speak...');
        await input.fill('What is Titanic about?');
        await page.getByRole('button', { name: 'Send' }).click();

        // Check for response in chat or AIR
        // The PlotAIR likely renders text about Titanic.
        await expect(page.getByText('Titanic', { exact: false })).toBeVisible({ timeout: 10000 });
    });

    test('Video Intent: Show me the Titanic trailer', async ({ page }) => {
        const input = page.getByPlaceholder('Type or speak...');
        await input.fill('Show me the Titanic trailer');
        await page.getByRole('button', { name: 'Send' }).click();

        // YoutubePlayerAIR
        await expect(page.locator('iframe')).toBeVisible({ timeout: 10000 });
    });

    test('Character Intent: Who are the characters in Titanic?', async ({ page }) => {
        const input = page.getByPlaceholder('Type or speak...');
        await input.fill('Who are the characters in Titanic?');
        await page.getByRole('button', { name: 'Send' }).click();

        // CharactersAIR
        await expect(page.getByText('Leonardo', { exact: false })).toBeVisible({ timeout: 10000 });
    });
});
