import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('navegação por teclado e acessibilidade das páginas principais', async ({ page }) => {
  for (const path of [
    '/',
    '/programacao',
    '/admin',
    '/admin/novo',
    '/sessoes/exemplo-1',
    '/sobre',
  ]) {
    await page.goto(path);
    await expect(page.locator('h1:visible')).toHaveCount(1);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(
      results.violations.map((item) => ({
        id: item.id,
        nodes: item.nodes.map((node) => ({ target: node.target, summary: node.failureSummary })),
      })),
      path,
    ).toEqual([]);
  }
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Pular para o conteúdo' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#principal')).toBeFocused();
});
