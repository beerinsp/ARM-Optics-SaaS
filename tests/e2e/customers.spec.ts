/**
 * customers.spec.ts
 * E2E tests for the customer management flow.
 * Uses staff auth state.
 */
import { test, expect } from "@playwright/test";

const RUN_ID = Date.now().toString().slice(-6);
const TEST_CUSTOMER = {
  first_name: "E2E",
  last_name: `Test${RUN_ID}`,
  email: `e2e.test${RUN_ID}@playwright.test`,
  mobile: "0400000000",
  suburb: "Sydney",
  postcode: "2000",
};

test.describe("Customers list", () => {
  test("renders the customers page with heading and New Customer button", async ({ page }) => {
    await page.goto("/customers");
    await expect(page.getByRole("heading", { name: "Customers" })).toBeVisible();
    await expect(page.getByRole("link", { name: /new customer/i })).toBeVisible();
  });

  test("search bar is present", async ({ page }) => {
    await page.goto("/customers");
    await expect(page.getByPlaceholder(/search by name/i)).toBeVisible();
  });
});

test.describe("Create customer", () => {
  test("new customer form renders required fields", async ({ page }) => {
    await page.goto("/customers/new");
    await expect(page.getByRole("heading", { name: /new customer/i })).toBeVisible();
    await expect(page.getByLabel("First Name")).toBeVisible();
    await expect(page.getByLabel("Last Name")).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/mobile/i)).toBeVisible();
  });

  test("creates a customer and redirects to profile page", async ({ page }) => {
    await page.goto("/customers/new");

    await page.getByLabel("First Name").fill(TEST_CUSTOMER.first_name);
    await page.getByLabel("Last Name").fill(TEST_CUSTOMER.last_name);
    await page.getByLabel(/^email/i).fill(TEST_CUSTOMER.email);
    await page.getByLabel(/mobile/i).fill(TEST_CUSTOMER.mobile);
    await page.getByLabel(/suburb/i).fill(TEST_CUSTOMER.suburb);
    await page.getByLabel(/postcode/i).fill(TEST_CUSTOMER.postcode);

    // State select (Radix UI combobox)
    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "NSW" }).click();

    await page.getByRole("button", { name: /create customer/i }).click();

    await page.waitForURL(/\/customers\/[0-9a-f-]{36}$/);
    await expect(page).toHaveURL(/\/customers\/[0-9a-f-]{36}$/);
    await expect(
      page.getByRole("heading", { name: `${TEST_CUSTOMER.first_name} ${TEST_CUSTOMER.last_name}` })
    ).toBeVisible();
  });
});

test.describe("Customer profile", () => {
  test("customer profile shows orders and prescriptions sections", async ({ page }) => {
    await page.goto("/customers");
    // Click the first customer link in the list
    const firstCustomer = page.locator("a[href^='/customers/']").first();
    await expect(firstCustomer).toBeVisible();
    await firstCustomer.click();
    await page.waitForURL(/\/customers\/[0-9a-f-]{36}/);
    // Profile should mention orders and prescriptions
    await expect(page.getByText(/orders/i).first()).toBeVisible();
    await expect(page.getByText(/prescription/i).first()).toBeVisible();
  });

  test("Edit link navigates to edit page", async ({ page }) => {
    await page.goto("/customers");
    const firstCustomer = page.locator("a[href^='/customers/']").first();
    await firstCustomer.click();
    await page.waitForURL(/\/customers\/[0-9a-f-]{36}/);
    const editLink = page.getByRole("link", { name: /edit/i }).first();
    await editLink.click();
    await expect(page).toHaveURL(/\/customers\/[0-9a-f-]{36}\/edit/);
  });
});

test.describe("Customer search", () => {
  test("search shows results dropdown for matching query", async ({ page }) => {
    await page.goto("/customers");
    const searchBar = page.getByPlaceholder(/search by name/i);
    await searchBar.fill(TEST_CUSTOMER.last_name);
    // Dropdown results should appear (min 2 chars)
    await expect(page.getByText(TEST_CUSTOMER.last_name).first()).toBeVisible();
  });
});
