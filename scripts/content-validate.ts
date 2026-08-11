/**
 * content:validate — valida todos los archivos content/units/*.json contra el
 * authoring schema, sin tocar la DB. Reporta errores con path exacto.
 *
 * Uso: pnpm content:validate
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { authoringUnitSchema } from '@nivelate/shared';

const UNITS_DIR = join(process.cwd(), 'content', 'units');

function main() {
  let files: string[];
  try {
    files = readdirSync(UNITS_DIR).filter((f) => f.endsWith('.json'));
  } catch {
    console.error(`No se encontró el directorio ${UNITS_DIR}`);
    process.exit(1);
  }

  if (files.length === 0) {
    console.log('No hay archivos de contenido en content/units/. Nada que validar.');
    return;
  }

  let hadError = false;

  for (const file of files.sort()) {
    const path = join(UNITS_DIR, file);
    let raw: unknown;
    try {
      raw = JSON.parse(readFileSync(path, 'utf8'));
    } catch (e) {
      hadError = true;
      console.error(`✗ ${file}: JSON inválido — ${(e as Error).message}`);
      continue;
    }

    const result = authoringUnitSchema.safeParse(raw);
    if (result.success) {
      const unit = result.data;
      const lessons = unit.lessons.length;
      const exercises = unit.lessons.reduce((n, l) => n + l.exercises.length, 0);
      const flag = unit.isPublished ? 'publicada' : 'borrador';
      console.log(
        `✓ ${file}: "${unit.title}" — ${lessons} lecciones, ${exercises} ejercicios (${flag})`,
      );
    } else {
      hadError = true;
      console.error(`✗ ${file}:`);
      for (const issue of result.error.issues) {
        console.error(`    ${issue.path.join('.') || '(raíz)'}: ${issue.message}`);
      }
    }
  }

  if (hadError) process.exit(1);
  console.log('\nTodo el contenido es válido.');
}

main();
