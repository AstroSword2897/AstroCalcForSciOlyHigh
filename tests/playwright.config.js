/**
 * Playwright Configuration for AstroCalc
 * 
 * Run with: npx playwright test
 */

module.exports = {
    testDir: './tests',
    timeout: 50000,
    retries: 1,
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
            use: { ...require('@playwright/test').devices['Desktop Chrome'] }
        },
        {
            name: 'firefox',
            use: { ...require('@playwright/test').devices['Desktop Firefox'] }
        },
        {
            name: 'webkit',
            use: { ...require('@playwright/test').devices['Desktop Safari'] }
        }
    ],
    webServer: {
        command: 'python3 -m http.server 8000',
        port: 8000,
        reuseExistingServer: !process.env.CI
    }
};

