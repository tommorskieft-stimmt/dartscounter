import { test, expect } from '@playwright/test'

// Smoke covers the golden path: first-visit → onboarding → home.
// Gameplay is exercised by the store-level Vitest suites. This e2e run
// just confirms the app boots and the route guards fire correctly.

test('first visit redirects to onboarding', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/onboarding$/)
  await expect(page.getByText(/What's your name/i)).toBeVisible()
})

test('onboarding flow lands on home and greets by first name', async ({ page, context }) => {
  // Fresh IndexedDB for each test.
  await context.clearCookies()
  await page.goto('/onboarding')

  await page.getByPlaceholder('Phil').fill('Phil')
  await page.getByPlaceholder('Taylor').fill('Taylor')
  await page.getByRole('button', { name: /Next/i }).click()

  // Birthday — set to 1970-01-01 via input[type=date]
  const birthday = page.locator('input[type="date"]')
  await birthday.fill('1970-01-01')
  await page.getByRole('button', { name: /Next/i }).click()

  // Pick a level
  await page.getByText('Advanced', { exact: true }).click()
  await page.getByRole('button', { name: /Finish/i }).click()

  await expect(page).toHaveURL('/dartscounter/')
  await expect(page.getByText(/Hi, Phil/)).toBeVisible()
})

test('manifest is reachable', async ({ page }) => {
  const response = await page.goto('/manifest.webmanifest')
  expect(response?.status()).toBe(200)
  const json = await response?.json()
  expect(json?.name).toMatch(/One·Two·One/)
  expect(json?.display).toBe('standalone')
  expect(Array.isArray(json?.icons)).toBe(true)
})
