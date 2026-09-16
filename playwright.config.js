import { defineConfig } from "@playwright/test";

export default defineConfig({

    testDir: "./tests",

    timeout: 5 * 60 * 1000,

    expect: {
        timeout: 10000
    },

    use: {
        headless: false,

        viewport: {
            width: 1280,
            height: 720
        }
    },

    reporter: "html"
});