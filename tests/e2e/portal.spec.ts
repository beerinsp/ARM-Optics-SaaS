/**
 * portal.spec.ts
 * E2E tests for the customer-facing portal.
 * Unauthenticated section uses no auth state.
 * Authenticated section uses portal auth state.
 */
import { test, expect } from "@playwright/test";

test.describe("Portal login page (unauthenticated)", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("renders Customer Portal heading", async ({ page }) => {
    await page.goto("/portal-login");
    await expect(page.getByText("Customer Portal")).toBeVisible();
    await expect(page.getByRole("heading", { name: /customer sign in/i })).toBeVisible();
  });

  test("Magic Link tab is active by default", async ({ page }) => {
    await page.goto("/portal-login");
    await expect(page.getByRole("button", { name: "Magic Link", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: /send magic link/i })).toBeVisible();
  });

  test("switching to Password tab shows password field", async ({ page }) => {
    await page.goto("/portal-login");
    await page.getByRole("button", { name: /^password$/i }).click();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: /^sign in$/i })).toBeVisible();
  });

  test("magic link form shows confirmation after submit", async ({ page }) => {
    await page.goto("/portal-login");
    await page.getByLabel("Email address").fill("test@example.com");
    await page.getByRole("button", { name: /send magic link/i }).click();
    // Should show "Check your email" confirmation screen
    await expect(page.getByText(/check your email/i)).toBeVisible({ timeout: 10_000 });
  });

  test("staff login link points to /login", async ({ page }) => {
    await page.goto("/portal-login");
    const link = page.getByRole("link", { name: /staff login/i });
    await expect(link).toHaveAttribute("href", "/login");
  });

  test("redirects unauthenticated user from /portal to /portal-login", async ({ page }) => {
    await page.goto("/portal");
    await page.waitForURL(/\/portal-login/, { timeout: 10_000 });
    await expect(page).toHaveURL(/\/portal-login/);
  });
});

test.describe("Portal authenticated flows", () => {
  // These tests use the stored portal session
  test.use({ storageState: "tests/e2e/.auth/portal.json" });

  test("portal dashboard loads", async ({ page }) => {
    await page.goto("/portal");
    await expect(page).toHaveURL(/\/portal/);
    // Either shows welcome message or "account not linked" screen
    const hasWelcome = await page.getByText(/welcome/i).first().isVisible();
    expect(hasWelcome).toBe(true);
  });

  test("portal orders page loads", async ({ page }) => {
    await page.goto("/portal/orders");
    await expect(page).toHaveURL(/\/portal\/orders/);
    // Should show "Orders" heading or empty state
    await expect(page.getByRole("heading", { name: /orders/i })).toBeVisible();
  });

  test("portal prescriptions page loads", async ({ page }) => {
    await page.goto("/portal/prescriptions");
    await expect(page).toHaveURL(/\/portal\/prescriptions/);
    // Should show "Prescriptions" heading or empty state
    await expect(page.getByRole("heading", { name: /prescription/i })).toBeVisible();
  });

  test("portal layout has navigation links", async ({ page }) => {
    await page.goto("/portal");
    await expect(page.getByRole("link", { name: /dashboard/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /orders/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /prescriptions/i })).toBeVisible();
  });
});
