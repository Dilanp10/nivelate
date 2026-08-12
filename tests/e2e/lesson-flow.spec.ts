import { type Page, expect } from '@playwright/test';
import { test } from '@playwright/test';

// Flujo completo autenticado: login → primera lección → XP → logros.
// Usa el usuario de prueba de Supabase (ver AGENTS.md / memoria de proyecto),
// así que corre contra la base real, no mocks.
//
// Las respuestas correctas de abajo están acopladas al contenido actual de
// specs 004 (content/units/01-a2-refresh.json, lección "Presente simple",
// 8 ejercicios). Si se revisa/reemplaza ese contenido, este test hay que
// actualizarlo junto con las respuestas.
const TESTER_EMAIL = 'tester@nivelate.local';
const TESTER_PASSWORD = 'nivelate123';

type Step =
  | { kind: 'choice'; optionText: string }
  | { kind: 'blank'; value: string }
  | { kind: 'translation'; value: string }
  | { kind: 'wordOrder'; tokens: string[] };

const LESSON_STEPS: Step[] = [
  { kind: 'choice', optionText: 'drinks' }, // e1: She ___ coffee every morning.
  { kind: 'choice', optionText: 'live' }, // e2: They ___ in a big city.
  { kind: 'blank', value: 'goes' }, // e3: My brother ___ to work by bus.
  { kind: 'blank', value: 'watch' }, // e4: We ___ TV in the evening.
  { kind: 'wordOrder', tokens: ['He', "doesn't", 'like', 'fish'] }, // e5
  { kind: 'choice', optionText: 'Does' }, // e6: ___ she speak English?
  { kind: 'translation', value: 'I work every day.' }, // e7
  { kind: 'choice', optionText: 'I get up at seven.' }, // e8: diálogo
];

async function login(page: Page) {
  await page.goto('/login');
  const inputs = page.locator('input');
  await inputs.nth(0).fill(TESTER_EMAIL);
  await inputs.nth(1).fill(TESTER_PASSWORD);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/$|\/index$/);
  await expect(page.getByText(/^Hola, /)).toBeVisible();
}

async function answerStep(page: Page, step: Step) {
  if (step.kind === 'choice') {
    await page.getByRole('radio', { name: step.optionText, exact: true }).click();
  } else if (step.kind === 'blank') {
    await page.getByLabel('Hueco 1').fill(step.value);
  } else if (step.kind === 'translation') {
    await page.getByLabel('Tu traducción').fill(step.value);
  } else {
    for (const token of step.tokens) {
      await page.getByRole('button', { name: `Agregar ${token}` }).click();
    }
  }

  await page.getByRole('button', { name: 'Verificar' }).click();
  await expect(page.getByText('¡Correcto!')).toBeVisible();
  await page.getByRole('button', { name: 'Continuar' }).click();
}

test.describe('Nivelate — flujo login → lección → XP → logros', () => {
  test('completar la primera lección otorga XP y desbloquea logros', async ({ page }) => {
    await test.step('login con usuario de prueba', async () => {
      await login(page);
    });

    const xpBefore = await test.step('leer XP inicial en home', async () => {
      const xpText = await page.getByText(/^\d+ XP$/).textContent();
      return Number(xpText?.replace(/\D/g, ''));
    });

    await test.step('entrar a la primera lección', async () => {
      await page.getByRole('link', { name: /^Empezar lección:/ }).click();
      await expect(page.getByText('0/8', { exact: true })).toBeVisible();
    });

    await test.step('responder los 8 ejercicios correctamente', async () => {
      for (const step of LESSON_STEPS) {
        await answerStep(page, step);
      }
    });

    await test.step('ver el resumen con 100% y XP ganada', async () => {
      await expect(page.getByText('¡Lección completa!')).toBeVisible();
      await expect(page.getByText('8/8 (100%)')).toBeVisible();
      await expect(page.getByText('+80')).toBeVisible();
    });

    await test.step('volver a home y ver el XP total actualizado', async () => {
      await page.getByRole('button', { name: 'Volver' }).click();
      await expect(page.getByText(`${xpBefore + 80} XP`)).toBeVisible();
    });

    await test.step('ver los logros desbloqueados en /progress', async () => {
      await page.getByRole('link', { name: 'Mi progreso', exact: true }).click();
      // Estos dos logros quedan garantizados por ESTE test (no dependen de
      // estado previo del usuario de prueba): completó una lección (con lo
      // cual "Primera lección" siempre queda true) y la completó 8/8 al
      // primer intento ("Lección perfecta" siempre queda true).
      await expect(page.getByLabel('Logro desbloqueado: Primera lección')).toBeVisible();
      await expect(page.getByLabel('Logro desbloqueado: Lección perfecta')).toBeVisible();
    });
  });
});
