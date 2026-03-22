/**
 * portal.setup.ts
 * Authenticates as a portal (customer) user and saves the session state.
 * Runs before all portal-authenticated tests.
 */
import { test as setup, expect } from "@playwright/test";
import { PORTAL_STORAGE } from "../../playwright.config";

setup("authenticate as portal user", async ({ page }) => {
  const email = process.env.TEST_PORTAL_EMAIL;
  const password = process.env.TEST_PORTAL_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "Missing TEST_PORTAL_EMAIL / TEST_PORTAL_PASSWORD in .env.local"
    );
  }

  await page.goto("/portal-login", { waitUntil: "networkidle" });
  // Switch to password mode
  await page.getByRole("button", { name: /^password$/i }).click();
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: /^sign in$/i }).click();
  await page.waitForURL(/\/portal/, { timeout: 20_000 });
  await expect(page).toHaveURL(/\/portal/);
  await page.context().storageState({ path: PORTAL_STORAGE });
});
