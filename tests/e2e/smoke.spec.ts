import { test, expect } from '@playwright/test'

test('renders the scaffold landing page', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText(/One·Two·One/i)).toBeVisible()
  await expect(page.getByText(/Phase 00/i)).toBeVisible()
})
