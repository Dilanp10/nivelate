import { type SelfLevel, getStartingUnitOrder } from '@nivelate/shared';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/auth';

export type LessonLink = {
  lessonId: string;
  lessonTitle: string;
  unitTitle: string;
};

type UnitWithLessons = {
  id: string;
  title: string;
  sort_order: number;
  lessons: { id: string; title: string; sort_order: number }[];
};

// Primera lección no completada, empezando por la unidad de arranque
// (según self_level) en adelante. Si ahí no queda ninguna pendiente (el
// usuario ya la completó toda), busca desde el principio — así alguien que
// arrancó salteando unidades igual puede volver a practicar lo opcional.
async function fetchFirstLesson(
  userId: string | null,
  selfLevel: SelfLevel | null,
): Promise<LessonLink | null> {
  if (!supabase) return null;

  const { data: units, error: unitsErr } = await supabase
    .from('units')
    .select('id, title, sort_order, lessons(id, title, sort_order)')
    .eq('is_published', true)
    .order('sort_order', { ascending: true });
  if (unitsErr || !units || units.length === 0) return null;

  const sorted = (units as UnitWithLessons[]).map((u) => ({
    ...u,
    lessons: [...u.lessons].sort((a, b) => a.sort_order - b.sort_order),
  }));

  let completedSet = new Set<string>();
  if (userId) {
    const { data: completions, error: compErr } = await supabase
      .from('lesson_completions')
      .select('lesson_id')
      .eq('user_id', userId);
    if (!compErr) completedSet = new Set((completions ?? []).map((c) => c.lesson_id));
  }

  const findFirstIncomplete = (candidateUnits: UnitWithLessons[]): LessonLink | null => {
    for (const unit of candidateUnits) {
      for (const lesson of unit.lessons) {
        if (!completedSet.has(lesson.id)) {
          return { lessonId: lesson.id, lessonTitle: lesson.title, unitTitle: unit.title };
        }
      }
    }
    return null;
  };

  const targetOrder = getStartingUnitOrder(selfLevel);
  const fromStart = findFirstIncomplete(sorted.filter((u) => u.sort_order >= targetOrder));
  if (fromStart) return fromStart;

  // Todo completado desde la unidad de arranque: ofrecer lo opcional de repaso.
  const fromBeginning = findFirstIncomplete(sorted);
  if (fromBeginning) return fromBeginning;

  // Curso entero completado: repetir la última lección de la última unidad.
  const lastUnit = sorted[sorted.length - 1];
  const lastLesson = lastUnit?.lessons[lastUnit.lessons.length - 1];
  if (lastUnit && lastLesson) {
    return { lessonId: lastLesson.id, lessonTitle: lastLesson.title, unitTitle: lastUnit.title };
  }
  return null;
}

export function useFirstLesson() {
  const userId = useAuthStore((s) => (s.state.status === 'authenticated' ? s.state.userId : null));
  const selfLevel = useAuthStore((s) =>
    s.state.status === 'authenticated'
      ? ((s.state.profile?.self_level as SelfLevel | null) ?? null)
      : null,
  );
  return useQuery({
    queryKey: ['first-lesson', userId, selfLevel],
    queryFn: () => fetchFirstLesson(userId, selfLevel),
    staleTime: 30_000,
  });
}
