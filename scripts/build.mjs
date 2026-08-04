// Bundles src/main.ts into the game.js that WeChat and index.html actually load.
//
// The mini game runtime expects a single plain script at the project root, so the
// output format is a self-contained IIFE. Its exports are attached to a global
// (HarborLoop) purely so tests and the devtools console can inspect state.

import { build, context } from 'esbuild';

const watch = process.argv.includes('--watch');

const options = {
  entryPoints: ['src/main.ts'],
  outfile: 'game.js',
  bundle: true,
  format: 'iife',
  globalName: 'HarborLoop',
  target: 'es2017',
  charset: 'utf8',
  legalComments: 'none',
  banner: {
    js: '// GENERATED FILE - do not edit. Source lives in src/; rebuild with `npm run build`.'
  }
};

if (watch) {
  const ctx = await context(options);
  await ctx.watch();
  console.log('watching src/ -> game.js');
} else {
  await build(options);
  console.log('built game.js');
}
