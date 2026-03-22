/**
 * auth.spec.ts
 * Tests for staff login, logout, and redirect behaviour.
 */
import { test, expect } from "@playwright/test";

test.describe("Staff login page (unauthenticated)", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("renders login form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
    await expect(page.getByLabel("Email address")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("shows error toast for invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email address").fill("wrong@example.com");
    await page.getByLabel("Password").fill("wrongpassword");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.locator("[data-sonner-toast]").first()).toBeVisible();
  });

  test("redirects unauthenticated user from /dashboard to /login", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL(/\/login/);
    await expect(page).toHaveURL(/\/login/);
  });

  test("redirects unauthenticated user from /customers to /login", async ({ page }) => {
    await page.goto("/customers");
    await page.waitForURL(/\/login/);
    await expect(page).toHaveURL(/\/login/);
  });

  test("password visibility toggle works", async ({ page }) => {
    await page.goto("/login");
    const passwordInput = page.getByLabel("Password");
    await expect(passwordInput).toHaveAttribute("type", "password");
    await page.locator("form button[type=button]").click();
    await expect(passwordInput).toHaveAttribute("type", "text");
  });

  test("forgot password link points to /reset-password", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("link", { name: /forgot/i })).toHaveAttribute("href", "/reset-password");
  });

  test("customer portal link points to /portal-login", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("link", { name: /sign in here/i })).toHaveAttribute("href", "/portal-login");
  });
});

test.describe("Staff authenticated flows", () => {
  test("dashboard is accessible and shows greeting heading", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/);
    // Dashboard shows "Good morning/afternoon, {name}" heading
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("sidebar navigation links are visible", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("link", { name: /customers/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /orders/i }).first()).toBeVisible();
  });

  // Sign-out test uses a FRESH login so it doesn't invalidate the shared session state
  // used by the rest of the test suite.
  test("sign out returns to login page", async ({ page, context }) => {
    // Override storage state: start with empty cookies for this test only
    await context.clearCookies();
    // Sign in fresh with staff credentials
    await page.goto("/login", { waitUntil: "networkidle" });
    await page.getByLabel("Email address").fill(process.env.TEST_STAFF_EMAIL!);
    await page.getByLabel("Password").fill(process.env.TEST_STAFF_PASSWORD!);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/\/dashboard/);

    // Now sign out
    const signOutButton = page.getByRole("button", { name: /sign out/i });
    const signOutLink = page.getByRole("link", { name: /sign out/i });
    if (await signOutButton.isVisible()) {
      await signOutButton.click();
    } else {
      await signOutLink.click();
    }
    await page.waitForURL(/\/login/);
    await expect(page).toHaveURL(/\/login/);
  });
});
