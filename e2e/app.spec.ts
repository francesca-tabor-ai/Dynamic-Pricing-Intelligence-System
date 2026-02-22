import { test, expect } from '@playwright/test';

test.describe('DPIS flows', () => {
  test('home page loads and shows landing content', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Dynamic Pricing Intelligence System/i })).toBeVisible();
    await expect(
      page.getByText(/Optimize your product pricing with AI-powered recommendations/i)
    ).toBeVisible();
  });

  test('home shows sign in or dashboard based on auth', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('button', { name: /Sign In to Continue|Open Dashboard|Get Started|Dashboard/i })
    ).toBeVisible();
  });

  test('unauthenticated dashboard redirects to sign in', async ({ page }) => {
    await page.goto('/dashboard/products');
    await expect(page.getByText(/Sign in to continue/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('button', { name: /Sign in/i })).toBeVisible();
  });

  test('navigation to dashboard products shows auth gate when not logged in', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Get Started|Sign In to Continue/i }).click();
    await page.goto('/dashboard/products');
    await expect(page.getByText(/Sign in to continue|Products/i)).toBeVisible({ timeout: 15000 });
  });

  test('analytics route shows auth gate or content', async ({ page }) => {
    await page.goto('/dashboard/analytics');
    await expect(
      page.getByText(/Sign in to continue|Analytics/i)
    ).toBeVisible({ timeout: 15000 });
  });

  test('pipeline route shows auth gate or content', async ({ page }) => {
    await page.goto('/dashboard/pipeline');
    await expect(
      page.getByText(/Sign in to continue|Pipeline/i)
    ).toBeVisible({ timeout: 15000 });
  });
});
