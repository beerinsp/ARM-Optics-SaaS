/**
 * staff.setup.ts
 * Authenticates as a staff user and saves the session state.
 * Runs before all staff-authenticated tests.
 */
import { test as setup, expect } from "@playwright/test";
import { STAFF_STORAGE } from "../../playwright.config";

setup("authenticate as staff", async ({ page }) => {
  const email = process.env.TEST_STAFF_EMAIL;
  const password = process.env.TEST_STAFF_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "Missing TEST_STAFF_EMAIL / TEST_STAFF_PASSWORD in .env.local"
    );
  }

  await page.goto("/login", { waitUntil: "networkidle" });
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 20_000 });
  await expect(page).toHaveURL(/\/dashboard/);
  await page.context().storageState({ path: STAFF_STORAGE });
});
