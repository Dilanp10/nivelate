import type { Database } from '../database.types';

export type SrsCard = Database['public']['Tables']['srs_cards']['Row'];

/** Lo que devuelve el RPC review_card. */
export type ReviewResult = {
  interval_days: number;
  due_at: string;
};

export const SRS_MAX_DAILY_CARDS = 20;
