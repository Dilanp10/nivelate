/**
 * content:load — carga idempotente de content/units/*.json a Supabase.
 *
 * Usa el service_role key (escribe salteándose RLS). Correrlo N veces deja la DB
 * igual: hace upsert por claves naturales (unit.slug, lesson(unit,slug),
 * exercise(lesson,key)) y borra lo que ya no está en el archivo.
 *
 * Requiere un .env en la raíz con:
 *   SUPABASE_URL=...
 *   SUPABASE_SERVICE_ROLE_KEY=...
 *
 * Uso: pnpm content:load
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { type AuthoringUnit, authoringUnitSchema } from '@nivelate/shared';
import { createClient } from '@supabase/supabase-js';
import { config as loadEnv } from 'dotenv';

loadEnv();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error(
    'Faltan SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY en el .env de la raíz.\n' +
      'El service_role key está en Dashboard → Settings → API. Nunca lo commitees.',
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false },
});

const UNITS_DIR = join(process.cwd(), 'content', 'units');

async function loadUnit(unit: AuthoringUnit): Promise<void> {
  // 1) upsert unit por slug
  const { data: unitRow, error: unitErr } = await supabase
    .from('units')
    .upsert(
      {
        slug: unit.slug,
        title: unit.title,
        description: unit.description ?? null,
        cefr_level: unit.cefrLevel,
        sort_order: unit.sortOrder,
        is_published: unit.isPublished,
      },
      { onConflict: 'slug' },
    )
    .select('id')
    .single();
  if (unitErr || !unitRow) throw new Error(`unit ${unit.slug}: ${unitErr?.message}`);
  const unitId = unitRow.id;

  // 2) grammar topics (upsert por slug) + mapa slug→id
  const topicIdBySlug = new Map<string, string>();
  for (const topic of unit.grammarTopics ?? []) {
    const { data: t, error } = await supabase
      .from('grammar_topics')
      .upsert(
        {
          slug: topic.slug,
          title: topic.title,
          explanation_es: topic.explanationEs,
          cefr_level: topic.cefrLevel,
        },
        { onConflict: 'slug' },
      )
      .select('id')
      .single();
    if (error || !t) throw new Error(`grammar_topic ${topic.slug}: ${error?.message}`);
    topicIdBySlug.set(topic.slug, t.id);
  }

  // 3) lessons + exercises
  const keptLessonIds: string[] = [];
  for (const [lessonIndex, lesson] of unit.lessons.entries()) {
    const { data: lessonRow, error: lessonErr } = await supabase
      .from('lessons')
      .upsert(
        {
          unit_id: unitId,
          slug: lesson.slug,
          title: lesson.title,
          sort_order: lessonIndex,
        },
        { onConflict: 'unit_id,slug' },
      )
      .select('id')
      .single();
    if (lessonErr || !lessonRow) throw new Error(`lesson ${lesson.slug}: ${lessonErr?.message}`);
    const lessonId = lessonRow.id;
    keptLessonIds.push(lessonId);

    // lesson_grammar_topics: reseteamos y reinsertamos los declarados
    await supabase.from('lesson_grammar_topics').delete().eq('lesson_id', lessonId);
    for (const gslug of lesson.grammarTopicSlugs ?? []) {
      const topicId = topicIdBySlug.get(gslug);
      if (topicId) {
        await supabase
          .from('lesson_grammar_topics')
          .insert({ lesson_id: lessonId, grammar_topic_id: topicId });
      }
    }

    // exercises: upsert por (lesson_id, exercise_key)
    const keptKeys: string[] = [];
    for (const [exIndex, ex] of lesson.exercises.entries()) {
      // El authoring exercise es { key, goal?, type, payload }. Guardamos type, payload y goal.
      const { key, goal, ...typed } = ex;
      const { error: exErr } = await supabase.from('exercises').upsert(
        {
          lesson_id: lessonId,
          exercise_key: key,
          type: typed.type,
          payload: typed.payload,
          goal: goal ?? null,
          sort_order: exIndex,
        },
        { onConflict: 'lesson_id,exercise_key' },
      );
      if (exErr) throw new Error(`exercise ${key}: ${exErr.message}`);
      keptKeys.push(key);
    }

    // Borrar ejercicios que ya no están en el archivo
    await supabase
      .from('exercises')
      .delete()
      .eq('lesson_id', lessonId)
      .not('exercise_key', 'in', `(${keptKeys.map((k) => `"${k}"`).join(',')})`);

    // teaching_cards + teaching_examples: reset + reinsert (contenido curado)
    await supabase.from('teaching_cards').delete().eq('lesson_id', lessonId);
    for (const [cardIndex, card] of (lesson.teachingCards ?? []).entries()) {
      const { data: cardRow, error: cardErr } = await supabase
        .from('teaching_cards')
        .insert({
          lesson_id: lessonId,
          key: card.key,
          title_es: card.titleEs,
          body_es: card.bodyEs,
          sort_order: cardIndex,
        })
        .select('id')
        .single();
      if (cardErr || !cardRow) throw new Error(`teaching_card ${card.key}: ${cardErr?.message}`);
      const cardId = cardRow.id;
      for (const [exIndex, example] of card.examples.entries()) {
        const { error: exErr } = await supabase.from('teaching_examples').insert({
          teaching_card_id: cardId,
          en: example.en,
          es: example.es,
          goal: example.goal ?? null,
          sort_order: exIndex,
        });
        if (exErr) throw new Error(`teaching_example ${card.key}#${exIndex}: ${exErr.message}`);
      }
    }

    // pronunciation_highlights: reset + reinsert (contenido curado)
    await supabase.from('pronunciation_highlights').delete().eq('lesson_id', lessonId);
    for (const [hIndex, h] of (lesson.pronunciationHighlights ?? []).entries()) {
      const { error: hErr } = await supabase.from('pronunciation_highlights').insert({
        lesson_id: lessonId,
        en: h.en,
        respelling_es: h.respellingEs,
        sort_order: hIndex,
      });
      if (hErr) throw new Error(`pronunciation_highlight ${lesson.slug}#${hIndex}: ${hErr.message}`);
    }
  }

  // Borrar lessons que ya no están en el archivo (cascade limpia sus exercises)
  await supabase
    .from('lessons')
    .delete()
    .eq('unit_id', unitId)
    .not('id', 'in', `(${keptLessonIds.map((id) => `"${id}"`).join(',')})`);

  const totalEx = unit.lessons.reduce((n, l) => n + l.exercises.length, 0);
  const totalCards = unit.lessons.reduce((n, l) => n + (l.teachingCards?.length ?? 0), 0);
  const totalHi = unit.lessons.reduce(
    (n, l) => n + (l.pronunciationHighlights?.length ?? 0),
    0,
  );
  const extras = [
    totalCards > 0 ? `${totalCards} teaching cards` : null,
    totalHi > 0 ? `${totalHi} pronunciation` : null,
  ]
    .filter(Boolean)
    .join(', ');
  console.log(
    `✓ ${unit.slug}: ${unit.lessons.length} lecciones, ${totalEx} ejercicios${
      extras ? ` + ${extras}` : ''
    } ${unit.isPublished ? '(publicada)' : '(borrador)'}`,
  );
}

async function main() {
  const files = readdirSync(UNITS_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort();

  if (files.length === 0) {
    console.log('No hay archivos en content/units/. Nada que cargar.');
    return;
  }

  for (const file of files) {
    const raw = JSON.parse(readFileSync(join(UNITS_DIR, file), 'utf8'));
    const parsed = authoringUnitSchema.safeParse(raw);
    if (!parsed.success) {
      console.error(`✗ ${file} no pasa validación. Corré 'pnpm content:validate' para el detalle.`);
      process.exit(1);
    }
    await loadUnit(parsed.data);
  }

  console.log('\nCarga completa.');
}

main().catch((e) => {
  console.error('Error en la carga:', e.message);
  process.exit(1);
});
