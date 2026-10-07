module.exports = {
  apps: [
    {
      name: 'hayp-frontend',
      script: '.next/standalone/server.js',
      interpreter: 'bun',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
      },
    },
  ],
};