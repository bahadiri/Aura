import { test, expect } from '@playwright/test';

test.describe('Aura AIR Verification', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // Wait for initial ImageAIR to spawn (it has a 1s delay in Space.tsx)
        await page.waitForTimeout(1500);
    });

    test('should load default ImageAIR', async ({ page }) => {
        const windowTitle = page.locator('.window-drag-handle', { hasText: 'Verified Image' });
        await expect(windowTitle).toBeVisible();

        // Check content
        const img = page.locator('img[alt="Test Image"], img[alt="Verified Image"]');
        await expect(img).toBeVisible();
    });

    test('should spawn BrainstormAIR manually', async ({ page }) => {
        await page.click('text=Spawn Brainstorm');
        const windowTitle = page.locator('.window-drag-handle >> text=Brainstorm');
        await expect(windowTitle).toBeVisible();
    });

    test('should verify i18n toggle with SeriesEpisodesAIR', async ({ page }) => {
        // Spawn Series AIR
        await page.click('text=Spawn Gibi');
        const seriesTitle = page.locator('text=Gibi - EPISODES');
        await expect(seriesTitle).toBeVisible();

        // Check Section Title instead of default prompt (which is now empty by default)
        const sectionTitle = page.locator('text=Gibi - EPISODES');
        await expect(sectionTitle).toBeVisible();

        // Toggle Language to TR
        await page.click('text=Lang: EN');
        await expect(page.locator('text=Lang: TR')).toBeVisible();

        // Verify i18n via Mock Summary content
        // Click first summary button
        const summaryBtn = page.locator('button:has-text("Summary")').first();
        await summaryBtn.click();

        // Expect TR mock text
        await expect(page.locator('text=için yüklenen özet')).toBeVisible();
    });
});
