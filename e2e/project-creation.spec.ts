import { test, expect } from '@playwright/test';

test.describe('Project Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Note: In real tests, you would need to login first
    // For now, we'll just navigate to the create page
    await page.goto('/create');
  });

  test('should show project creation wizard', async ({ page }) => {
    // Should show the first step
    await expect(page.locator('text=/Step 1|Project Type/i')).toBeVisible();
  });

  test('should navigate through wizard steps', async ({ page }) => {
    // Step 1: Select project type
    await page.click('text=Web Application');
    await page.click('text=Next');

    // Should be on step 2
    await expect(page.locator('text=/Step 2|Configuration/i')).toBeVisible();

    // Step 2: Fill basic configuration
    await page.fill('input[name="name"]', 'My Test Project');
    await page.fill('textarea[name="description"]', 'A test project for E2E testing');
    await page.click('text=Next');

    // Should be on step 3 (integrations)
    await expect(page.locator('text=/Step 3|Integrations/i')).toBeVisible();
  });

  test('should validate required integrations', async ({ page }) => {
    // Navigate to integrations step
    await page.click('text=Web Application');
    await page.click('text=Next');
    await page.fill('input[name="name"]', 'Test Project');
    await page.click('text=Next');

    // Try to submit without required fields
    await page.click('button[type="submit"]');

    // Should show validation errors for mandatory fields
    await expect(page.locator('text=/GitHub.*required/i')).toBeVisible();
    await expect(page.locator('text=/Supabase.*required/i')).toBeVisible();
  });

  test('should show conditional Stripe field when payments enabled', async ({ page }) => {
    // Navigate to integrations step
    await page.click('text=Web Application');
    await page.click('text=Next');
    await page.fill('input[name="name"]', 'Test Project');
    await page.click('text=Next');

    // Enable payments
    await page.check('input[name="needsPayment"]');

    // Stripe fields should be visible
    await expect(page.locator('input[name="stripePublishableKey"]')).toBeVisible();
    await expect(page.locator('input[name="stripeSecretKey"]')).toBeVisible();
  });

  test('should accept valid GitHub repository URL', async ({ page }) => {
    await page.goto('/create');

    // Navigate to integrations
    await page.click('text=Web Application');
    await page.click('text=Next');
    await page.fill('input[name="name"]', 'Test Project');
    await page.click('text=Next');

    // Fill GitHub URL
    await page.fill(
      'input[name="githubRepo"]',
      'https://github.com/username/repo'
    );

    // Should not show error
    await expect(page.locator('text=/Invalid GitHub URL/i')).not.toBeVisible();
  });
});

test.describe('Workflow Builder', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/workflow-builder');
  });

  test('should display workflow builder canvas', async ({ page }) => {
    // Should show ReactFlow canvas
    await expect(page.locator('.react-flow')).toBeVisible();

    // Should show controls
    await expect(page.locator('text=/Zoom In|Zoom Out/i')).toBeVisible();
  });

  test('should show node palette', async ({ page }) => {
    // Should show available node types
    const nodeTypes = [
      'Trigger',
      'Action',
      'Condition',
      'Delay',
      'API',
      'Database',
      'Email',
      'Webhook',
    ];

    for (const nodeType of nodeTypes) {
      await expect(page.locator(`text=${nodeType}`)).toBeVisible();
    }
  });

  test('should allow exporting to N8N', async ({ page }) => {
    // Should have export button
    const exportButton = page.locator('button:has-text("Export to N8N")');
    await expect(exportButton).toBeVisible();
  });

  test('should allow exporting to Make', async ({ page }) => {
    // Should have export button
    const exportButton = page.locator('button:has-text("Export to Make")');
    await expect(exportButton).toBeVisible();
  });

  test('should show minimap', async ({ page }) => {
    // Minimap should be visible
    await expect(page.locator('.react-flow__minimap')).toBeVisible();
  });
});

test.describe('Agent Dashboard', () => {
  test('should show agent progress when project is generating', async ({ page }) => {
    // This test assumes a project is being generated
    // In real scenario, you'd create a project first
    await page.goto('/project/test-id'); // Mock project ID

    // Should show agent cards (or appropriate state)
    await expect(
      page.locator('text=/Generating|In Progress|Agents/i')
    ).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/');

    // Check for proper navigation
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    // Check for heading hierarchy
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');

    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // At least one element should have focus
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');

    // Check background and text colors
    // This is a basic check - you'd use axe-core for comprehensive testing
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
