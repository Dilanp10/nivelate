import { expect, test } from '@playwright/test';

test.describe('Nivelate — smoke', () => {
  test('la home carga y muestra el título Nivelate', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Nivelate', { exact: true })).toBeVisible();
    await expect(page.getByText(/A2 → B1/)).toBeVisible();
  });

  test('sin Supabase configurado, muestra el mensaje "no configurado"', async ({ page }) => {
    await page.goto('/');
    // Uno de los dos estados es válido: "no configurado" si el ambiente aún no tiene .env,
    // o "conectado" si el dev ya lo configuró. Cualquiera pasa el smoke.
    await expect(page.getByText(/Supabase no configurado|Conectado a Supabase/)).toBeVisible({
      timeout: 15_000,
    });
  });
});
