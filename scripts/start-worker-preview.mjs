import { copyFileSync, existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

const sourceVars = resolve('.dev.vars');
const workerVars = resolve('dist/server/.dev.vars');
const workerConfig = resolve('dist/server/wrangler.json');
const wrangler = resolve('node_modules/wrangler/bin/wrangler.js');

if (!existsSync(workerConfig)) {
  console.error('Production build not found. Run `npm run build` first.');
  process.exit(1);
}

if (existsSync(sourceVars)) {
  copyFileSync(sourceVars, workerVars);
  const values = readFileSync(workerVars, 'utf8');
  const localProductionValues = /^SITE_URL=/m.test(values)
    ? values.replace(/^SITE_URL=.*$/m, 'SITE_URL=https://localhost:3000')
    : `SITE_URL=https://localhost:3000\n${values}`;
  writeFileSync(workerVars, localProductionValues);
}

const cleanup = () => {
  if (existsSync(workerVars)) rmSync(workerVars, { force: true });
};

const child = spawn(process.execPath, [wrangler, 'dev', '--config', workerConfig], {
  stdio: 'inherit',
  shell: false,
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal));
}

child.on('error', (error) => {
  cleanup();
  console.error(error);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  cleanup();
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 0);
});
