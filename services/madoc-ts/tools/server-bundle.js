const esbuild = require('esbuild');

esbuild
  .build({
    entryPoints: ['src/server.ts'],
    outfile: 'npm/madoc-server/lib/server.js',
    bundle: true,
    minify: false,
    sourcemap: false,
    platform: 'node',
    target: ['node12'],
    define: {
      'process.env.NODE_ENV': '"production"',
    },
    external: ['pg', 'sharp', 'pm2', 'mjml', 'vm2', 'bcrypt'],
  })
  .then(() => {
    return esbuild.build({
      entryPoints: ['src/queue/scheduler.ts'],
      outfile: 'npm/madoc-server/lib/queue/scheduler.js',
      bundle: true,
      minify: false,
      sourcemap: false,
      platform: 'node',
      target: ['node12'],
      define: {
        'process.env.NODE_ENV': '"production"',
      },
      external: ['pg', 'sharp', 'pm2', 'mjml', 'vm2', 'bcrypt'],
    });
  })
  .then(() => {
    return esbuild.build({
      entryPoints: ['src/queue/producer.ts'],
      outfile: 'npm/madoc-server/lib/queue/producer.js',
      bundle: true,
      minify: false,
      sourcemap: false,
      platform: 'node',
      target: ['node12'],
      define: {
        'process.env.NODE_ENV': '"production"',
      },
      external: ['pg', 'sharp', 'pm2', 'mjml', 'vm2', 'bcrypt'],
    });
  })

  .catch(() => process.exit(1));

// lib/queue/producer.js
// lib/queue/scheduler.js
