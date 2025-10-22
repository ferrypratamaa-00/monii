import { expect, test } from "@playwright/test";

test.describe("Monii Application - Critical User Flows", () => {
  test("should load the homepage", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Monii/);
  });

  test("should display main navigation", async ({ page }) => {
    await page.goto("/");

    // Check for main navigation elements
    await expect(page.getByRole("navigation")).toBeVisible();
  });

  test("should be responsive", async ({ page }) => {
    await page.goto("/");

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator("body")).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator("body")).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator("body")).toBeVisible();
  });

  test("should allow user registration", async ({ page }) => {
    await page.goto("/signup");

    // Fill registration form
    await page.fill('input[name="name"]', "Test User");
    await page.fill('input[name="email"]', `test${Date.now()}@example.com`);
    await page.fill('input[name="password"]', "password123");
    await page.fill('input[name="confirmPassword"]', "password123");

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to login or dashboard
    await expect(page).toHaveURL(/\/login|\/dashboard/);
  });

  test("should allow user login", async ({ page }) => {
    await page.goto("/login");

    // Fill login form
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "password123");

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("should create income transaction", async ({ page }) => {
    // Assume user is logged in
    await page.goto("/transactions");

    // Click add transaction button
    await page.click('button:has-text("Add Transaction")');

    // Fill transaction form
    await page.selectOption('select[name="type"]', "INCOME");
    await page.fill('input[name="amount"]', "100000");
    await page.fill('input[name="description"]', "Salary");
    await page.selectOption('select[name="accountId"]', "1"); // Assuming account exists
    await page.selectOption('select[name="categoryId"]', "1"); // Assuming category exists

    // Submit form
    await page.click('button[type="submit"]');

    // Should show success message or redirect
    await expect(
      page.locator("text=Transaction created successfully"),
    ).toBeVisible();
  });

  test("should create expense transaction with budget tracking", async ({
    page,
  }) => {
    await page.goto("/transactions");

    // Click add transaction button
    await page.click('button:has-text("Add Transaction")');

    // Fill expense transaction form
    await page.selectOption('select[name="type"]', "EXPENSE");
    await page.fill('input[name="amount"]', "50000");
    await page.fill('input[name="description"]', "Food");
    await page.selectOption('select[name="accountId"]', "1");
    await page.selectOption('select[name="categoryId"]', "1"); // Food category

    // Submit form
    await page.click('button[type="submit"]');

    // Should show success message
    await expect(
      page.locator("text=Transaction created successfully"),
    ).toBeVisible();
  });

  test("should display transactions in list", async ({ page }) => {
    await page.goto("/transactions");

    // Should show transaction list
    await expect(page.locator("table, .transaction-list")).toBeVisible();

    // Should show transaction details
    await expect(page.locator("text=Salary, text=Food")).toBeVisible();
  });

  test("should create budget", async ({ page }) => {
    await page.goto("/budget");

    // Click create budget button
    await page.click('button:has-text("Create Budget")');

    // Fill budget form
    await page.selectOption('select[name="categoryId"]', "1"); // Food category
    await page.selectOption('select[name="period"]', "MONTHLY");
    await page.fill('input[name="limitAmount"]', "200000");

    // Submit form
    await page.click('button[type="submit"]');

    // Should show success message
    await expect(
      page.locator("text=Budget created successfully"),
    ).toBeVisible();
  });

  test("should display budget progress", async ({ page }) => {
    await page.goto("/budget");

    // Should show budget cards
    await expect(page.locator(".budget-card, .budget-progress")).toBeVisible();

    // Should show budget statistics
    await expect(
      page.locator("text=Total Budgets, text=Active Budgets"),
    ).toBeVisible();
  });

  test("should show budget alerts when over limit", async ({ page }) => {
    // Create a transaction that exceeds budget
    await page.goto("/transactions");

    await page.click('button:has-text("Add Transaction")');
    await page.selectOption('select[name="type"]', "EXPENSE");
    await page.fill('input[name="amount"]', "250000"); // Exceeds 200k budget
    await page.fill('input[name="description"]', "Large expense");
    await page.selectOption('select[name="accountId"]', "1");
    await page.selectOption('select[name="categoryId"]', "1");

    await page.click('button[type="submit"]');

    // Go to budget page
    await page.goto("/budget");

    // Should show budget alert
    await expect(
      page.locator("text=Over Budget, text=Budget Alert"),
    ).toBeVisible();
  });

  test("should display dashboard with statistics", async ({ page }) => {
    await page.goto("/dashboard");

    // Should show balance summary
    await expect(
      page.locator("text=Total Balance, text=Income, text=Expenses"),
    ).toBeVisible();

    // Should show recent transactions
    await expect(page.locator(".recent-transactions, table")).toBeVisible();

    // Should show spending chart
    await expect(page.locator(".chart, canvas, svg")).toBeVisible();
  });

  test("should navigate between sections", async ({ page }) => {
    await page.goto("/dashboard");

    // Test navigation to different sections
    await page.click('a[href="/transactions"]');
    await expect(page).toHaveURL("/transactions");

    await page.click('a[href="/budget"]');
    await expect(page).toHaveURL("/budget");

    await page.click('a[href="/accounts"]');
    await expect(page).toHaveURL("/accounts");
  });

  test("should filter transactions by date range", async ({ page }) => {
    await page.goto("/transactions");

    // Open filters
    await page.click('button:has-text("Filters")');

    // Set date range
    await page.fill('input[name="dateFrom"]', "2024-01-01");
    await page.fill('input[name="dateTo"]', "2024-12-31");

    // Apply filters
    await page.click('button:has-text("Apply")');

    // Should show filtered results
    await expect(page.locator(".transaction-item, tr")).toBeVisible();
  });

  test("should search transactions by description", async ({ page }) => {
    await page.goto("/transactions");

    // Search for specific transaction
    await page.fill('input[placeholder*="search"]', "Salary");

    // Should show filtered results
    await expect(page.locator("text=Salary")).toBeVisible();
  });

  test("should export transactions to CSV", async ({ page }) => {
    await page.goto("/reports");

    // Click export button
    await page.click('button:has-text("Export CSV")');

    // Should trigger download
    const downloadPromise = page.waitForEvent("download");
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/\.csv$/);
  });

  test("should export transactions to PDF", async ({ page }) => {
    await page.goto("/reports");

    // Click export button
    await page.click('button:has-text("Export PDF")');

    // Should trigger download
    const downloadPromise = page.waitForEvent("download");
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/\.pdf$/);
  });
});
