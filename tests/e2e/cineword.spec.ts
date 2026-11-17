import { test, expect } from '@playwright/test';

test('início, programação e navegação exibem os exemplos', async ({ page }) => {
  const erros: string[] = [];
  page.on('pageerror', (error) => erros.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'A próxima sessão começa aqui.' })).toBeVisible();
  await expect(page.locator('app-sessao-card')).toHaveCount(6);
  await page.getByRole('link', { name: 'Explorar programação' }).click();
  await expect(page.locator('app-sessao-card')).toHaveCount(12);
  await expect(page.getByRole('heading', { name: 'Programação completa' })).toBeVisible();
  await page.getByRole('navigation').getByRole('link', { name: 'Sobre', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Tudo o que uma sessão precisa.' })).toBeVisible();
  await expect(
    page.getByText('O Firebase ainda não está conectado.', { exact: false }),
  ).toBeVisible();
  expect(erros).toEqual([]);
});

test('filtros, estado vazio e detalhes de uma sessão', async ({ page }) => {
  await page.goto('/programacao');
  await page.getByRole('combobox', { name: 'Gênero', exact: true }).selectOption('Animação');
  await expect(page.locator('app-sessao-card')).toHaveCount(2);
  await page.getByLabel('Buscar filme').fill('filme inexistente');
  await expect(page.getByRole('heading', { name: 'Nenhuma sessão encontrada' })).toBeVisible();
  await page.getByRole('button', { name: 'Limpar filtros', exact: true }).first().click();
  await expect(page.locator('app-sessao-card')).toHaveCount(12);
  await page
    .getByRole('combobox', { name: 'Disponibilidade', exact: true })
    .selectOption('indisponiveis');
  await expect(page.locator('app-sessao-card')).toHaveCount(2);
  await page.getByRole('link', { name: 'Detalhes de A Casa do Farol', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'A Casa do Farol', exact: true })).toBeVisible();
  await expect(page.getByText('Esta sessão está indisponível', { exact: false })).toBeVisible();
});

test('cadastro, persistência, edição, disponibilidade e exclusão', async ({ page }) => {
  await page.goto('/admin/novo');
  await page.getByLabel('Filme', { exact: true }).fill('  Filme da entrega  ');
  await page.getByLabel('Gênero', { exact: true }).selectOption('Aventura');
  await page.getByLabel('Sala', { exact: true }).fill('8');
  await page.getByLabel('Data', { exact: true }).fill('2026-11-20');
  await page.getByLabel('Horário', { exact: true }).fill('18:00');
  await page.getByRole('button', { name: 'Cadastrar sessão', exact: true }).click();
  await expect(page.getByText('Sessão cadastrada com sucesso.')).toBeVisible();
  await page.reload();
  const row = page.getByRole('row').filter({ hasText: 'Filme da entrega' });
  await expect(row).toBeVisible();
  await row.getByRole('link', { name: 'Editar', exact: true }).click();
  await expect(page.getByLabel('Filme', { exact: true })).toHaveValue('Filme da entrega');
  await page.getByLabel('Filme', { exact: true }).fill('Filme da entrega revisado');
  await page.getByRole('button', { name: 'Salvar alterações' }).click();
  await expect(page.getByText('Sessão atualizada com sucesso.')).toBeVisible();
  const edited = page.getByRole('row').filter({ hasText: 'Filme da entrega revisado' });
  await edited
    .getByRole('button', { name: 'Indisponibilizar Filme da entrega revisado', exact: true })
    .click();
  await expect(edited.locator('.status')).toHaveText('Indisponível');
  await page.goto('/programacao');
  await page.getByLabel('Buscar filme').fill('Filme da entrega revisado');
  await expect(page.locator('app-sessao-card')).toHaveCount(1);
  await expect(page.locator('app-sessao-card .status')).toHaveText('Indisponível');
  await page.goto('/admin');
  page.once('dialog', (dialog) => dialog.dismiss());
  await edited
    .getByRole('button', { name: 'Excluir sessão de Filme da entrega revisado', exact: true })
    .click();
  await expect(edited).toBeVisible();
  page.once('dialog', (dialog) => dialog.accept());
  await edited
    .getByRole('button', { name: 'Excluir sessão de Filme da entrega revisado', exact: true })
    .click();
  await expect(edited).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('row').filter({ hasText: 'Filme da entrega revisado' })).toHaveCount(
    0,
  );
});

test('formulário rejeita título em branco e sala fracionária', async ({ page }) => {
  await page.goto('/admin/novo');
  await page.getByLabel('Filme', { exact: true }).fill('   ');
  await page.getByLabel('Sala', { exact: true }).fill('1.5');
  await page.getByRole('button', { name: 'Cadastrar sessão', exact: true }).click();
  await expect(page.locator('#erro-filme')).toBeVisible();
  await expect(page.getByText('Informe um número inteiro de 1 a 99.')).toBeVisible();
  await expect(page).toHaveURL(/admin\/novo/);
});

test('mesma sala, data e horário não pode ser cadastrada duas vezes', async ({ page }) => {
  await page.goto('/admin');
  await expect(page.getByRole('row').filter({ hasText: 'Além das Estrelas' })).toBeVisible();
  const data = await page.evaluate(
    () => JSON.parse(localStorage.getItem('cineword.sessoes.v1')!)[0].data,
  );
  await page.goto('/admin/novo');
  await page.getByLabel('Filme', { exact: true }).fill('Sessão duplicada');
  await page.getByLabel('Gênero', { exact: true }).selectOption('Drama');
  await page.getByLabel('Data', { exact: true }).fill(data);
  await page.getByLabel('Horário', { exact: true }).fill('14:00');
  await page.getByRole('button', { name: 'Cadastrar sessão', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText(
    'Já existe uma sessão nesta sala, data e horário.',
  );
  await expect(page.getByLabel('Filme', { exact: true })).toBeEnabled();
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem('cineword.sessoes.v1')!).length),
  ).toBe(12);
});

test('lista vazia é preservada e não recria exemplos', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('cineword.sessoes.v1', '[]'));
  await page.goto('/programacao');
  await expect(page.getByRole('heading', { name: 'A programação está vazia' })).toBeVisible();
  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: 'Nenhuma sessão cadastrada' })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('cineword.sessoes.v1'))).toBe('[]');
});

test('sessão inexistente e dados corrompidos exibem erro sem apagar dados', async ({ page }) => {
  await page.goto('/sessoes/inexistente');
  await expect(page.getByRole('alert')).toContainText('Sessão não encontrada.');
  await page.goto('/admin/editar/inexistente');
  await expect(page.getByRole('alert')).toContainText('Sessão não encontrada.');
  await expect(page.getByRole('button', { name: 'Salvar alterações' })).toHaveCount(0);
  await page.evaluate(() => localStorage.setItem('cineword.sessoes.v1', 'dados inválidos'));
  await page.goto('/programacao');
  await expect(page.getByRole('alert')).toContainText('Os dados locais estão inválidos');
  expect(await page.evaluate(() => localStorage.getItem('cineword.sessoes.v1'))).toBe(
    'dados inválidos',
  );
});

test('falha no armazenamento mostra erro e não confirma cadastro', async ({ page }) => {
  await page.goto('/admin/novo');
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('quota', 'QuotaExceededError');
    };
  });
  await page.getByLabel('Filme', { exact: true }).fill('Filme sem espaço');
  await page.getByLabel('Gênero', { exact: true }).selectOption('Drama');
  await page.getByLabel('Sala', { exact: true }).fill('8');
  await page.getByLabel('Data', { exact: true }).fill('2026-11-20');
  await page.getByLabel('Horário', { exact: true }).fill('18:00');
  await page.getByRole('button', { name: 'Cadastrar sessão', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Não foi possível salvar no navegador.');
  await expect(page).toHaveURL(/admin\/novo/);
});

for (const width of [320, 768, 1024, 1440]) {
  test(`páginas sem rolagem horizontal em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
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
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        path,
      ).toBe(true);
    }
  });
}
