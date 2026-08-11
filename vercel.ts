// Configuración de deploy en Vercel — expo web export como PWA.
// Ver https://vercel.com/docs/project-configuration/vercel-ts

// TODO(T070): descomentar cuando el proyecto Vercel esté conectado.
// Por ahora es un placeholder para no bloquear el commit de la config.
//
// import type { VercelConfig } from '@vercel/config/v1';
//
// export const config: VercelConfig = {
//   buildCommand: 'pnpm --filter mobile export:web',
//   outputDirectory: 'apps/mobile/dist',
//   framework: null,
//   installCommand: 'pnpm install --frozen-lockfile',
// };

export const config = {
  buildCommand: 'pnpm --filter mobile export:web',
  outputDirectory: 'apps/mobile/dist',
  framework: null,
  installCommand: 'pnpm install --frozen-lockfile',
};
