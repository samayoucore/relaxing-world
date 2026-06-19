import { expect, test } from '@playwright/test';

test('opens the game and exposes the main editing surface', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });

  await page.goto('/');
  const canvas = page.locator('canvas.game-canvas');
  await expect(canvas).toBeVisible();
  const canvasBox = await canvas.boundingBox();

  if (!canvasBox) {
    throw new Error('Canvas bounds are unavailable.');
  }

  await page.mouse.move(canvasBox.x + canvasBox.width / 2, canvasBox.y + canvasBox.height / 2);
  await page.mouse.down();
  await page.mouse.up();
  await expect(page.locator('.toolbox')).toBeVisible();
  await page.getByRole('button', { name: 'Land' }).click();
  await page.getByRole('button', { name: 'Biomes' }).click();
  await page.getByRole('button', { name: 'Undo' }).click();
  await page.getByRole('button', { name: 'Redo' }).click();
  await page.getByRole('button', { name: 'Save' }).click();

  expect(errors.filter((error) => !error.includes('WebGL'))).toEqual([]);
});
