/**
 * staff-pages.spec.ts
 * E2E tests for remaining staff pages not covered elsewhere:
 *   /prescriptions, /inventory, /reminders, /settings,
 *   /customers/[id]/prescriptions (add prescription dialog)
 * Uses staff auth state.
 */
import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// All Prescriptions list
// ---------------------------------------------------------------------------
test.describe("All Prescriptions page", () => {
  test("renders heading and page content", async ({ page }) => {
    await page.goto("/prescriptions");
    await expect(page.getByRole("heading", { name: /all prescriptions/i })).toBeVisible();
  });

  test("shows either prescription rows or an empty state message", async ({ page }) => {
    await page.goto("/prescriptions");
    const hasRows = await page.locator("a[href^='/customers/']").first().isVisible();
    if (hasRows) {
      await expect(page.locator("a[href^='/customers/']").first()).toBeVisible();
    } else {
      await expect(page.getByText(/no prescriptions recorded yet/i)).toBeVisible();
    }
  });
});

// ---------------------------------------------------------------------------
// Inventory
// ---------------------------------------------------------------------------
test.describe("Inventory page", () => {
  test("renders heading and search input", async ({ page }) => {
    await page.goto("/inventory");
    await expect(page.getByRole("heading", { name: /inventory/i })).toBeVisible();
    await expect(page.getByPlaceholder(/search by name, sku/i)).toBeVisible();
  });

  test("shows GenSoft integration status card", async ({ page }) => {
    await page.goto("/inventory");
    await expect(page.getByText(/gensoft moneyworks/i).first()).toBeVisible();
  });

  test("shows products or empty state when searching a nonsense query", async ({ page }) => {
    await page.goto("/inventory?q=zzz_nonexistent_xyz");
    await expect(page.getByText(/no products found/i)).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Reminders
// ---------------------------------------------------------------------------
test.describe("Reminders page", () => {
  test("renders heading", async ({ page }) => {
    await page.goto("/reminders");
    await expect(page.getByRole("heading", { name: /reminders/i })).toBeVisible();
  });

  test("shows info banner about automatic sending", async ({ page }) => {
    await page.goto("/reminders");
    await expect(page.getByText(/sent automatically/i)).toBeVisible();
  });

  test("shows reminders list or empty state", async ({ page }) => {
    await page.goto("/reminders");
    // Either shows the empty state message or a reminder type label
    const hasEmpty = await page.getByText(/no reminders scheduled/i).isVisible();
    const hasItems = await page.getByText(/glasses ready|exam due|custom/i).first().isVisible().catch(() => false);
    expect(hasEmpty || hasItems).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------
test.describe("Settings page", () => {
  test("renders heading", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByRole("heading", { name: /settings/i })).toBeVisible();
  });

  test("shows My Profile and GenSoft sections", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByText(/my profile/i)).toBeVisible();
    await expect(page.getByText(/gensoft moneyworks/i).first()).toBeVisible();
  });

  test("shows Email Configuration section", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByText(/email configuration/i)).toBeVisible();
    await expect(page.getByText(/RESEND_API_KEY/)).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Customer Prescriptions page + Add Prescription dialog
// ---------------------------------------------------------------------------
test.describe("Customer prescriptions", () => {
  test("navigates to prescriptions page for first customer", async ({ page }) => {
    await page.goto("/customers");
    const firstCustomer = page.locator("a[href^='/customers/']").first();
    const href = await firstCustomer.getAttribute("href");
    if (!href) { test.skip(); return; }

    await page.goto(`${href}/prescriptions`);
    await expect(page).toHaveURL(/\/customers\/[0-9a-f-]{36}\/prescriptions/);
    await expect(page.getByRole("heading", { name: /prescriptions/i })).toBeVisible();
  });

  test("Add Prescription button opens dialog", async ({ page }) => {
    await page.goto("/customers");
    const firstCustomer = page.locator("a[href^='/customers/']").first();
    const href = await firstCustomer.getAttribute("href");
    if (!href) { test.skip(); return; }

    await page.goto(`${href}/prescriptions`);
    await page.getByRole("button", { name: /add prescription/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("heading", { name: /add prescription/i })).toBeVisible();
  });

  test("dialog shows Rx fields and can be dismissed", async ({ page }) => {
    await page.goto("/customers");
    const firstCustomer = page.locator("a[href^='/customers/']").first();
    const href = await firstCustomer.getAttribute("href");
    if (!href) { test.skip(); return; }

    await page.goto(`${href}/prescriptions`);
    await page.getByRole("button", { name: /add prescription/i }).click();

    // Check key form elements are present
    await expect(page.getByRole("dialog").getByText(/exam date/i)).toBeVisible();
    await expect(page.getByRole("dialog").getByRole("button", { name: /save prescription/i })).toBeVisible();

    // Cancel closes the dialog
    await page.getByRole("dialog").getByRole("button", { name: /cancel/i }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("saves a distance prescription and shows it in the list", async ({ page }) => {
    await page.goto("/customers");
    const firstCustomer = page.locator("a[href^='/customers/']").first();
    const href = await firstCustomer.getAttribute("href");
    if (!href) { test.skip(); return; }

    await page.goto(`${href}/prescriptions`);
    await page.getByRole("button", { name: /add prescription/i }).click();

    const dialog = page.getByRole("dialog");

    // Exam date defaults to today — just confirm the field is prefilled
    const examDateInput = dialog.getByLabel(/exam date/i);
    await expect(examDateInput).not.toHaveValue("");

    // Fill OD SPH
    const odSphInput = dialog.locator("input[placeholder='-2.00']").first();
    await odSphInput.fill("-1.25");

    await dialog.getByRole("button", { name: /save prescription/i }).click();

    // Dialog closes and page refreshes — prescription should appear
    await expect(dialog).not.toBeVisible({ timeout: 10_000 });
    // Either the new card or the prescription list should show
    await expect(page.getByText(/distance/i).first()).toBeVisible();
  });
});
