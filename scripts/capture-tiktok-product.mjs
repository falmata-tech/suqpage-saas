// Uses disposable local owner/staff records and an explicitly mocked provider player.
process.loadEnvFile('.local/supabase-runtime.env');
process.env.SUQPAGE_TEST_PRODUCT_VIDEO_PROVIDER='tiktok';
process.env.SUQPAGE_TEST_SCREENSHOT_DIR='.local/tiktok-product-review';
await import('./capture-video-requests.ts');
