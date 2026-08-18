import { type SelfLevel, getStartingUnitOrder } from '@nivelate/shared';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/auth';

export type PublishedUnit = {
  id: string;
  title: string;
  sortOrder: number;
};

async function fetchPublishedUnits(): Promise<PublishedUnit[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('units')
    .select('id, title, sort_order')
    .eq('is_published', true)
    .order('sort_order', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((u) => ({ id: u.id, title: u.title, sortOrder: u.sort_order }));
}

function usePublishedUnits() {
  return useQuery({
    queryKey: ['published-units'],
    queryFn: fetchPublishedUnits,
    staleTime: 5 * 60_000,
  });
}

/**
 * Unidad de arranque según el self_level del perfil, combinando el catálogo
 * de unidades publicadas con getStartingUnitOrder (packages/shared). Se
 * recalcula en runtime — no se persiste (ver research.md R-006). Si la
 * unidad objetivo no existe (ej. self_level='intermediate' pero solo hay
 * U1/U2 publicadas), cae a la última disponible.
 */
export function useStartingUnit() {
  const selfLevel = useAuthStore((s) =>
    s.state.status === 'authenticated'
      ? ((s.state.profile?.self_level as SelfLevel | null) ?? null)
      : null,
  );
  const units = usePublishedUnits();
  const list = units.data ?? [];

  const targetOrder = getStartingUnitOrder(selfLevel);
  const startingUnit =
    list.length === 0 ? null : (list.find((u) => u.sortOrder >= targetOrder) ?? list[0]);

  return {
    isLoading: units.isLoading,
    selfLevel,
    units: list,
    startingUnit: startingUnit ?? null,
  };
}
