/**
 * orders.spec.ts
 * E2E tests for the order management flow.
 * Uses staff auth state.
 */
import { test, expect } from "@playwright/test";

test.describe("Orders list", () => {
  test("renders the orders page with heading and New Order button", async ({ page }) => {
    await page.goto("/orders");
    await expect(page.getByRole("heading", { name: "Orders" })).toBeVisible();
    await expect(page.getByRole("link", { name: /new order/i })).toBeVisible();
  });

  test("status filter links are visible", async ({ page }) => {
    await page.goto("/orders");
    await expect(page.getByRole("link", { name: /^all$/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /^pending$/i })).toBeVisible();
  });
});

test.describe("New order form", () => {
  test("renders customer search and lens/frame/pricing tabs", async ({ page }) => {
    await page.goto("/orders/new");
    await expect(page.getByRole("heading", { name: /new order/i })).toBeVisible();
    await expect(page.getByText(/search for customer/i)).toBeVisible();
    await expect(page.getByRole("tab", { name: /lens/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /frame/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /pricing/i })).toBeVisible();
  });

  test("shows customer_id validation error when submitting without a customer", async ({ page }) => {
    await page.goto("/orders/new");
    await page.getByRole("button", { name: /save order/i }).click();
    // Zod should surface "Customer is required" or similar near the customer section
    await expect(page.locator("p.text-red-400, p.text-xs.text-red-400").first()).toBeVisible();
  });

  test("create order end-to-end via a pre-selected customer URL param", async ({ page }) => {
    // First fetch a customer ID from the customers page
    await page.goto("/customers");
    const firstLink = page.locator("a[href^='/customers/']").first();
    const href = await firstLink.getAttribute("href");
    if (!href) { test.skip(); return; }
    const customerId = href.split("/").pop();
    if (!customerId) { test.skip(); return; }

    await page.goto(`/orders/new?customer=${customerId}`);
    await expect(page.getByRole("heading", { name: /new order/i })).toBeVisible();

    // Customer should be pre-selected — "Change" button should appear
    await expect(page.getByRole("button", { name: /change/i })).toBeVisible();

    // Fill in total price
    await page.getByRole("tab", { name: /pricing/i }).click();
    const totalInput = page.getByLabel(/total/i).first();
    if (await totalInput.isVisible()) {
      await totalInput.fill("150");
    }

    await page.getByRole("button", { name: /save order/i }).click();
    await page.waitForURL(/\/orders\/[0-9a-f-]{36}$/, { timeout: 20_000 });
    await expect(page).toHaveURL(/\/orders\/[0-9a-f-]{36}$/);
  });
});

test.describe("Order detail", () => {
  test("clicking an existing order shows its detail page", async ({ page }) => {
    await page.goto("/orders");
    const firstOrder = page.locator("a[href^='/orders/']").first();
    await expect(firstOrder).toBeVisible();
    await firstOrder.click();
    await page.waitForURL(/\/orders\/[0-9a-f-]{36}/);
    await expect(page).toHaveURL(/\/orders\/[0-9a-f-]{36}/);
    // Edit and Print links should be visible
    await expect(page.getByRole("link", { name: /edit/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /print/i })).toBeVisible();
  });

  test("print page loads for an existing order", async ({ page }) => {
    await page.goto("/orders");
    const firstOrder = page.locator("a[href^='/orders/']").first();
    await firstOrder.click();
    await page.waitForURL(/\/orders\/[0-9a-f-]{36}/);
    await page.getByRole("link", { name: /print/i }).click();
    await page.waitForURL(/\/orders\/[0-9a-f-]{36}\/print/);
    await expect(page).toHaveURL(/\/orders\/[0-9a-f-]{36}\/print/);
    await expect(page.locator("body")).not.toBeEmpty();
  });
});
