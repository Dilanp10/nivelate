import { QueryClient } from '@tanstack/react-query';

// Singleton — se pasa al provider en app/_layout.tsx.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Auth queries pisan poco tiempo; le damos 1 min de fresh window.
      staleTime: 60_000,
      // No reintentar automáticamente en fallos de auth (401, etc.).
      retry: (failureCount, error) => {
        const message = error instanceof Error ? error.message : '';
        if (/invalid|unauthorized|forbidden/i.test(message)) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      // Mutaciones de auth NUNCA se reintentan solas — el usuario debe apretar de nuevo.
      retry: false,
    },
  },
});
