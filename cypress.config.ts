import { defineConfig } from "cypress";

const baseUrl = "http://localhost:3000";

export default defineConfig({
  e2e: {
    video: false,
    viewportWidth: 1200,
    viewportHeight: 1000,
    baseUrl,
    scrollBehavior: "center",
  },
  env: {
    baseUrl,
    TEST_USER_ID: process.env.TEST_USER_ID,
    TEST_USER_PW: process.env.TEST_USER_PW,
  },
});
