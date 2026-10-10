import { spawnSync } from 'node:child_process';

// Aplicar las migraciones antes de iniciar la API, usando el Prisma instalado.
const migration = spawnSync(
  process.execPath,
  ['node_modules/prisma/build/index.js', 'migrate', 'deploy'],
  { stdio: 'inherit' },
);

if (migration.error || migration.status !== 0) {
  if (migration.error) console.error(migration.error);
  process.exit(migration.status ?? 1);
}

await import('./dist/server.js');
