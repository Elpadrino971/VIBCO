import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display homepage', async ({ page }) => {
    await expect(page).toHaveTitle(/Coding 2.0/i);
    await expect(page.locator('h1')).toContainText(/Coding 2.0/i);
  });

  test('should navigate to signup page', async ({ page }) => {
    // Click on sign up link
    await page.click('text=Sign up');

    // Should be on signup page
    await expect(page).toHaveURL(/.*signup/);
    await expect(page.locator('h1, h2')).toContainText(/Sign up|Create account/i);
  });

  test('should show validation errors on empty signup form', async ({ page }) => {
    await page.goto('/signup');

    // Click submit without filling form
    await page.click('button[type="submit"]');

    // Should show validation errors
    await expect(page.locator('text=/email.*required/i')).toBeVisible();
    await expect(page.locator('text=/password.*required/i')).toBeVisible();
  });

  test('should signup with valid credentials', async ({ page }) => {
    await page.goto('/signup');

    // Fill signup form
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[name="fullName"]', 'Test User');
    await page.fill('input[type="password"]', 'SecurePassword123!');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect or show success message
    // (This will depend on your actual implementation)
    await page.waitForTimeout(1000);
  });

  test('should navigate to login page', async ({ page }) => {
    await page.click('text=Login');

    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator('h1, h2')).toContainText(/Login|Sign in/i);
  });

  test('should show OAuth providers', async ({ page }) => {
    await page.goto('/login');

    // Should show Google OAuth button
    await expect(page.locator('text=/Continue with Google/i')).toBeVisible();

    // Should show GitHub OAuth button
    await expect(page.locator('text=/Continue with GitHub/i')).toBeVisible();
  });

  test('should show forgot password link', async ({ page }) => {
    await page.goto('/login');

    // Should have forgot password link
    await expect(page.locator('text=/Forgot password/i')).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('should navigate between main pages', async ({ page }) => {
    await page.goto('/');

    // Navigate to About
    await page.click('text=About');
    await expect(page).toHaveURL(/.*about/);

    // Navigate to Workflow Builder
    await page.click('text=Workflow Builder');
    await expect(page).toHaveURL(/.*workflow-builder/);

    // Navigate back to Home
    await page.click('text=Home');
    await expect(page).toHaveURL(/\/$/);
  });

  test('should display 11 AI agents on homepage', async ({ page }) => {
    await page.goto('/');

    // Should show all 11 agents
    const agents = [
      'Project Manager',
      'Frontend',
      'Backend',
      'Database',
      'Mobile',
      'Game',
      'Workflow',
      'SEO',
      'Testing',
      'Security',
      'DevOps',
    ];

    for (const agent of agents) {
      await expect(page.locator(`text=${agent}`)).toBeVisible();
    }
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');

    // Should show mobile menu button
    await expect(page.locator('button[aria-label="Menu"]')).toBeVisible();

    // Homepage should still be visible
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should work on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto('/');

    await expect(page.locator('h1')).toBeVisible();
  });
});
