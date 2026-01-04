/**
 * Playwright Configuration for AstroCalc
 * 
 * Run with: npx playwright test
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    timeout: 30000, // 30 seconds timeout
    retries: 0, // Disable retries for faster feedback during debugging
    workers: 1,
    use: {
        baseURL: 'http://localhost:8000',
        headless: true,
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'on-first-retry'
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] }
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] }
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] }
        }
    ],
    reporter: 'list',
    webServer: {
        command: 'python3 -m http.server 8000',
        port: 8000,
        // Cursor/CI environments may already have the server running on 8000.
        // Always reuse to avoid port conflicts.
        reuseExistingServer: true
    }
});

