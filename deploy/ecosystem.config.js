module.exports = {
  apps: [
    {
      name: 'hayp-frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3003',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 10,
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      env: {
        NODE_ENV: 'production',
        PORT: 3003,
      },
    },
  ],
};