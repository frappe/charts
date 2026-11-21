import { defineConfig } from '@playwright/test';

const ci = Boolean(process.env.CI);
const port = 8990;

export default defineConfig({
    testDir: './playwright/tests',
    forbidOnly: ci,
    retries: ci ? 1 : 0,
    reporter: ci ? [['list'], ['github'], ['html', { open: 'never' }]] : [['list']],
    use: {
        baseURL: `http://localhost:${port}`,
        viewport: { width: 1000, height: 700 },
        trace: 'on-first-retry',
        screenshot: 'only-on-failure'
    },
    webServer: {
        command: `http-server -p ${port} -c-1 -s`,
        url: `http://localhost:${port}/playwright/index.html`,
        reuseExistingServer: !ci
    }
});
