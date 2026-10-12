import { expect, test } from '@playwright/test';

test('muestra la bienvenida con el nombre', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'mateAventuras' })).toBeVisible();
});
