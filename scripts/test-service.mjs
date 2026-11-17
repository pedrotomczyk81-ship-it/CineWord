import { build } from 'esbuild';
import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';

mkdirSync('test-results', { recursive: true });
await build({
  entryPoints: ['tests/unit/sessao.service.test.ts'],
  outfile: 'test-results/sessao.service.test.mjs',
  bundle: true,
  platform: 'node',
  format: 'esm',
  packages: 'external',
  tsconfig: 'tsconfig.json',
});
const result = spawnSync(process.execPath, ['--test', 'test-results/sessao.service.test.mjs'], {
  stdio: 'inherit',
});
process.exitCode = result.status ?? 1;
