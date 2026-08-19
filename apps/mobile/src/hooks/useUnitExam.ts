import { type LearningGoal, pickExamExercises } from '@nivelate/shared';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { PlayableExercise } from './useLesson';

const EXAM_SIZE = 10;

export type UnitExamData = {
  unitId: string;
  unitTitle: string;
  exercises: PlayableExercise[];
};

async function fetchUnitExam(unitId: string): Promise<UnitExamData> {
  if (!supabase) throw new Error('Supabase no configurado');

  const { data: unit, error: unitErr } = await supabase
    .from('units')
    .select('id, title, lessons(id)')
    .eq('id', unitId)
    .eq('is_published', true)
    .single();
  if (unitErr || !unit) throw new Error(unitErr?.message ?? 'Unidad no encontrada');

  const lessonIds = (unit.lessons ?? []).map((l: { id: string }) => l.id);
  if (lessonIds.length === 0) {
    return { unitId: unit.id, unitTitle: unit.title, exercises: [] };
  }

  const { data: rows, error: exErr } = await supabase
    .from('exercises')
    .select('id, exercise_key, type, payload, sort_order, goal, lesson_id')
    .in('lesson_id', lessonIds);
  if (exErr) throw new Error(exErr.message);

  const pool = (rows ?? []).map((e) => ({
    id: e.id,
    lessonId: e.lesson_id,
    exerciseKey: e.exercise_key,
    type: e.type,
    payload: e.payload,
    sortOrder: e.sort_order,
    goal: (e.goal as LearningGoal | null) ?? null,
  }));

  // Selección del examen: cobertura por lección + relleno aleatorio hasta 10.
  const picked = pickExamExercises(pool, EXAM_SIZE);
  const exercises: PlayableExercise[] = picked.map((p) => ({
    id: p.id,
    exerciseKey: p.exerciseKey,
    type: p.type,
    payload: p.payload,
    sortOrder: p.sortOrder,
    goal: p.goal,
  }));

  return { unitId: unit.id, unitTitle: unit.title, exercises };
}

export function useUnitExam(unitId: string) {
  return useQuery({
    queryKey: ['unit-exam', unitId],
    queryFn: () => fetchUnitExam(unitId),
    // Cada vez que se abre el examen queremos un mix distinto — sin cache.
    staleTime: 0,
    gcTime: 0,
  });
}
