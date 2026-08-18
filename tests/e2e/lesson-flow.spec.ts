import { type Page, expect } from '@playwright/test';
import { test } from '@playwright/test';

// Flujo completo autenticado: login → lección (teaching cards → ejercicios →
// pronunciación) → XP → logros. Usa el usuario de prueba de Supabase (ver
// AGENTS.md / memoria de proyecto), así que corre contra la base real, no
// mocks.
//
// Desde el módulo 009, la CTA "Empezar lección" del dashboard apunta a la
// primera lección NO completada (antes siempre era la lección 1, sin
// importar el historial). Como el usuario de prueba acumula completados
// entre corridas, este test no puede asumir una lección fija: lee cuál
// lección le tocó y usa el plan de respuestas correspondiente. Los 3 planes
// de abajo están acoplados al contenido actual de content/units/01-a2-refresh.json
// (unidad publicada). Si se revisa ese contenido, hay que actualizar los
// planes junto con las respuestas.
const TESTER_EMAIL = 'tester@nivelate.local';
const TESTER_PASSWORD = 'nivelate123';

type Step =
  | { kind: 'choice'; optionText: string }
  | { kind: 'blank'; values: string[] }
  | { kind: 'translation'; value: string }
  | { kind: 'wordOrder'; tokens: string[] }
  | { kind: 'matching'; pairs: [string, string][] };

type LessonPlan = {
  title: string;
  teachingCardCount: number;
  steps: Step[];
};

const LESSON_PLANS: LessonPlan[] = [
  {
    title: 'Presente simple',
    teachingCardCount: 2,
    steps: [
      { kind: 'choice', optionText: 'drinks' }, // e1: She ___ coffee every morning.
      { kind: 'choice', optionText: 'live' }, // e2: They ___ in a big city.
      { kind: 'blank', values: ['goes'] }, // e3: My brother ___ to work by bus.
      { kind: 'blank', values: ['watch'] }, // e4: We ___ TV in the evening.
      { kind: 'wordOrder', tokens: ['He', "doesn't", 'like', 'fish'] }, // e5
      { kind: 'choice', optionText: 'Does' }, // e6: ___ she speak English?
      { kind: 'translation', value: 'I work every day.' }, // e7
      { kind: 'choice', optionText: 'I get up at seven.' }, // e8: diálogo
    ],
  },
  {
    title: 'Pasado simple',
    teachingCardCount: 2,
    steps: [
      { kind: 'choice', optionText: 'went' }, // e1: Yesterday I ___ to the cinema.
      { kind: 'blank', values: ['watched'] }, // e2: She ___ a great film last night.
      { kind: 'blank', values: ['ate', 'went'] }, // e3: We ___ pizza and then we ___ home.
      { kind: 'wordOrder', tokens: ['Did', 'you', 'call', 'her', 'yesterday'] }, // e4
      { kind: 'choice', optionText: "didn't" }, // e5: I ___ see the message.
      {
        kind: 'matching', // e6
        pairs: [
          ['go', 'went'],
          ['have', 'had'],
          ['buy', 'bought'],
          ['see', 'saw'],
        ],
      },
      { kind: 'translation', value: 'She bought a new dress.' }, // e7
      { kind: 'choice', optionText: 'They visited their grandparents.' }, // e8: listening
    ],
  },
  {
    title: 'Vocabulario cotidiano',
    teachingCardCount: 2,
    steps: [
      {
        kind: 'matching', // e1
        pairs: [
          ['breakfast', 'desayuno'],
          ['kitchen', 'cocina'],
          ['weekend', 'fin de semana'],
          ['shopping', 'compras'],
        ],
      },
      { kind: 'choice', optionText: 'lunch' }, // e2: I'm hungry. Let's have ___.
      { kind: 'blank', values: ['jacket'] }, // e3: Take your ___.
      { kind: 'translation', value: 'El clima está lindo hoy.' }, // e4: en_to_es
      { kind: 'choice', optionText: "I'm looking for some shoes." }, // e5: diálogo
      { kind: 'blank', values: ['eight'] }, // e6: listening fill-in-blank
      { kind: 'wordOrder', tokens: ['I', 'usually', 'have', 'dinner', 'at', 'eight'] }, // e7
    ],
  },
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
    for (const [i, value] of step.values.entries()) {
      await page.getByLabel(`Hueco ${i + 1}`).fill(value);
    }
  } else if (step.kind === 'translation') {
    await page.getByLabel('Tu traducción').fill(step.value);
  } else if (step.kind === 'wordOrder') {
    for (const token of step.tokens) {
      await page.getByRole('button', { name: `Agregar ${token}` }).click();
    }
  } else {
    for (const [left, right] of step.pairs) {
      await page.getByRole('button', { name: left, exact: true }).click();
      await page.getByRole('button', { name: right, exact: true }).click();
    }
  }

  await page.getByRole('button', { name: 'Verificar' }).click();
  await expect(page.getByText('¡Muy bien!')).toBeVisible();
  await page.getByRole('button', { name: 'Continuar' }).click();
}

test.describe('Nivelate — flujo login → lección → XP → logros', () => {
  test('completar la próxima lección otorga XP y desbloquea logros', async ({ page }) => {
    await test.step('login con usuario de prueba', async () => {
      await login(page);
    });

    const xpBefore = await test.step('leer XP inicial en home', async () => {
      // El total vive en el accessibilityLabel de la card ("XP total: 1020"),
      // porque en pantalla el número y la etiqueta son nodos separados.
      const label = await page.getByLabel(/^XP total: \d+$/).getAttribute('aria-label');
      return Number(label?.replace(/\D/g, ''));
    });

    const plan = await test.step('leer qué lección le toca al usuario y entrar', async () => {
      const link = page.getByRole('link', { name: /^Empezar lección:/ });
      const label = await link.getAttribute('aria-label');
      const title = label?.replace('Empezar lección: ', '').trim();
      const found = LESSON_PLANS.find((p) => p.title === title);
      if (!found) {
        throw new Error(
          `Lección inesperada "${title}" — actualizá LESSON_PLANS si el contenido de U1 cambió.`,
        );
      }
      await link.click();
      const total = found.teachingCardCount + found.steps.length;
      await expect(page.getByText(`0/${total}`, { exact: true })).toBeVisible();
      return found;
    });

    const total = plan.teachingCardCount + plan.steps.length;

    await test.step('pasar las teaching cards con audio y ejemplos', async () => {
      for (let i = 0; i < plan.teachingCardCount; i++) {
        await expect(page.getByText('APRENDÉ ESTO')).toBeVisible();
        await page.getByRole('button', { name: 'Entendido' }).click();
      }
      // Tras las cards arranca el primer ejercicio; el progreso ya cuenta las cards.
      await expect(
        page.getByText(`${plan.teachingCardCount}/${total}`, { exact: true }),
      ).toBeVisible();
    });

    await test.step('responder todos los ejercicios correctamente', async () => {
      for (const step of plan.steps) {
        await answerStep(page, step);
      }
    });

    await test.step('ver la pantalla de pronunciación y continuar', async () => {
      await expect(page.getByText('Cómo suena lo que aprendiste')).toBeVisible();
      await page.getByRole('button', { name: 'Continuar' }).click();
    });

    const expectedXp = plan.steps.length * 10;

    await test.step('ver el resumen con 100% y XP ganada', async () => {
      // Con 100% el encabezado del resumen es el de mejor desempeño.
      await expect(page.getByText('¡Excelente!')).toBeVisible();
      await expect(
        page.getByText(`${plan.steps.length} de ${plan.steps.length} al primer intento`),
      ).toBeVisible();
      await expect(page.getByText(`+${expectedXp}`)).toBeVisible();
    });

    await test.step('volver a home y ver el XP total actualizado', async () => {
      await page.getByRole('button', { name: 'Volver' }).click();
      await expect(page.getByLabel(`XP total: ${xpBefore + expectedXp}`)).toBeVisible();
    });

    await test.step('ver los logros desbloqueados en /progress', async () => {
      await page.getByRole('link', { name: 'Mi progreso', exact: true }).click();
      // Estos dos logros quedan garantizados por ESTE test (no dependen de
      // estado previo del usuario de prueba): completó una lección (con lo
      // cual "Primera lección" siempre queda true) y la completó al 100% al
      // primer intento ("Lección perfecta" siempre queda true).
      await expect(page.getByLabel('Logro desbloqueado: Primera lección')).toBeVisible();
      await expect(page.getByLabel('Logro desbloqueado: Lección perfecta')).toBeVisible();
    });
  });
});
