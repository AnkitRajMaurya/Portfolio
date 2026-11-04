const { spawnSync } = require('node:child_process');
const path = require('node:path');

// Vercel project settings can override NODE_ENV with a non-standard value.
// Next.js production builds must use the production React/Next runtime.
const env = { ...process.env, NODE_ENV: 'production' };
const nextCli = require.resolve('next/dist/bin/next');
const result = spawnSync(process.execPath, [nextCli, 'build', '--webpack'], {
  cwd: path.resolve(__dirname, '..'),
  env,
  stdio: 'inherit',
});

if (result.error) {
  console.error('Could not start the Next.js production build:', result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);
