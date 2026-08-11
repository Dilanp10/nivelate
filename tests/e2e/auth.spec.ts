import { expect, test } from '@playwright/test';

// Estos tests cubren lo que se puede verificar sin configurar el flujo de emails
// en el dashboard de Supabase: redirect guards, render de pantallas, navegación
// entre ellas y validación client-side (Zod, antes de tocar la red).
//
// Nota sobre selectores: react-native-web renderiza tanto los títulos (<Text>)
// como los labels de botones como <div>, así que un getByText por el label del
// botón matchea 2 elementos. Por eso usamos getByRole('button'|'link') siempre
// que el target sea un control.

test.describe('Nivelate — auth guards & rendering', () => {
  test('sin sesión, la raíz redirige a /login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login$/);
    // El subtítulo es único de la pantalla de login (el título "Entrar" también
    // es el label del botón, así que no sirve como assertion no ambigua).
    await expect(page.getByText('Retomá donde dejaste.')).toBeVisible();
  });

  test('login muestra los accesos a signup, forgot y magic link', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('link', { name: '¿Olvidaste tu contraseña?' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Entrar con link mágico' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Crear cuenta' })).toBeVisible();
  });

  test('desde login se navega a signup', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: 'Crear cuenta' }).click();
    await expect(page).toHaveURL(/\/signup$/);
    await expect(page.getByText('Aprender inglés A2 → B1, en serio.')).toBeVisible();
  });

  test('desde login se navega a forgot-password', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: '¿Olvidaste tu contraseña?' }).click();
    await expect(page).toHaveURL(/\/forgot-password$/);
  });

  test('desde login se navega a magic-link', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: 'Entrar con link mágico' }).click();
    await expect(page).toHaveURL(/\/magic-link$/);
  });
});

test.describe('Nivelate — validación client-side', () => {
  test('login con campos vacíos muestra errores', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page.getByText('Ingresá tu email')).toBeVisible();
    await expect(page.getByText('Ingresá tu contraseña')).toBeVisible();
  });

  test('login con email inválido muestra "Email inválido"', async ({ page }) => {
    await page.goto('/login');
    const inputs = page.locator('input');
    await inputs.nth(0).fill('no-es-un-email');
    await inputs.nth(1).fill('cualquiercosa');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page.getByText('Email inválido')).toBeVisible();
  });

  test('signup con password débil muestra el requisito de longitud', async ({ page }) => {
    await page.goto('/signup');
    const inputs = page.locator('input');
    await inputs.nth(0).fill('valido@nivelate.app');
    await inputs.nth(1).fill('corta'); // < 8 chars
    await page.getByRole('button', { name: 'Crear cuenta' }).click();
    await expect(page.getByText('La contraseña debe tener al menos 8 caracteres')).toBeVisible();
  });

  test('signup con password sin número muestra el requisito', async ({ page }) => {
    await page.goto('/signup');
    const inputs = page.locator('input');
    await inputs.nth(0).fill('valido@nivelate.app');
    await inputs.nth(1).fill('sololetras'); // 10 chars, sin número
    await page.getByRole('button', { name: 'Crear cuenta' }).click();
    await expect(page.getByText('La contraseña debe incluir al menos un número')).toBeVisible();
  });
});
