import { test, expect } from '@playwright/test';

test.describe('Offline shell', () => {
    test('reloads with service worker after network offline', async ({ page, context }) => {
        await page.goto('/');
        await page.waitForLoadState('domcontentloaded');

        await page.waitForFunction(
            () => !!navigator.serviceWorker?.controller,
            null,
            { timeout: 90_000 }
        );

        await expect(page.locator('#formula-search')).toBeVisible();

        // Allow install + precache network activity to finish
        await page.waitForTimeout(3000);

        await context.setOffline(true);
        await page.reload({ waitUntil: 'load' });

        await expect(page.locator('#formula-search')).toBeVisible({ timeout: 20_000 });

        await page.waitForFunction(
            () => typeof (window as unknown as { switchMainTab?: unknown }).switchMainTab === 'function',
            null,
            { timeout: 60_000 }
        );

        await page.evaluate(() => {
            (window as unknown as { switchMainTab: (name: string) => void }).switchMainTab('unit-converter');
        });

        const ucPanel = page.locator('#main-unit-converter-tab');
        await expect(ucPanel).toBeVisible();
        await expect(page.locator('#uc-category')).toBeVisible();
        await expect(page.locator('#uc-result')).toBeVisible();
        const resultText = await page.locator('#uc-result').textContent();
        expect(resultText).toBeTruthy();
        expect(resultText).not.toMatch(/cannot convert/i);

        // Core calculator path: unit engine available without network
        const auInMeters = await page.evaluate(() => {
            const UC = (window as Window & { UnitConverter?: { convert: (v: number, a: string, b: string) => number | null } }).UnitConverter;
            return UC?.convert(1, 'AU', 'm');
        });
        expect(auInMeters).toBeGreaterThan(1e10);
    });
});
