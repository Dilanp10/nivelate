import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export type FirstUnitEntry = { lessonId: string } | null;

// La primera lección de la primera unidad publicada, sin importar
// completado ni self_level. Sirve para el enlace "Empezá desde el
// principio" cuando el usuario arrancó salteando unidades.
async function fetchFirstUnitEntry(): Promise<FirstUnitEntry> {
  if (!supabase) return null;

  const { data: unit, error: unitErr } = await supabase
    .from('units')
    .select('id')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (unitErr || !unit) return null;

  const { data: lesson, error: lessonErr } = await supabase
    .from('lessons')
    .select('id')
    .eq('unit_id', unit.id)
    .order('sort_order', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (lessonErr || !lesson) return null;

  return { lessonId: lesson.id };
}

export function useFirstUnitEntry() {
  return useQuery({
    queryKey: ['first-unit-entry'],
    queryFn: fetchFirstUnitEntry,
    staleTime: 5 * 60_000,
  });
}
