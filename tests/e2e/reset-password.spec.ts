/**
 * reset-password.spec.ts
 * E2E tests for the password reset page (unauthenticated).
 * No auth state required — run under the staff project (selectively overrides to no-auth).
 */
import { test, expect } from "@playwright/test";

test.describe("Reset password page (unauthenticated)", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("renders the reset password heading and email field", async ({ page }) => {
    await page.goto("/reset-password");
    await expect(page.getByRole("heading", { name: /reset password/i })).toBeVisible();
    await expect(page.getByLabel("Email address")).toBeVisible();
    await expect(page.getByRole("button", { name: /send reset link/i })).toBeVisible();
  });

  test("back to sign in link points to /login", async ({ page }) => {
    await page.goto("/reset-password");
    await expect(page.getByRole("link", { name: /back to sign in/i })).toHaveAttribute("href", "/login");
  });

  test("shows confirmation screen after submitting an email", async ({ page }) => {
    await page.goto("/reset-password");
    await page.getByLabel("Email address").fill("test@example.com");
    await page.getByRole("button", { name: /send reset link/i }).click();
    // Supabase always returns success for reset emails
    await expect(page.getByRole("heading", { name: /check your email/i })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("test@example.com")).toBeVisible();
  });
});
