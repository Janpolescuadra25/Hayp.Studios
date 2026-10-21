module.exports = {
  apps: [
    {
      name: 'hayp-frontend',
      script: 'node',
      args: '.next/standalone/server.js',
      cwd: '/var/www/hayp-studios',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3003
      },
      error_file: './logs/hayp-error.log',
      out_file: './logs/hayp-out.log',
      log_file: './logs/hayp-combined.log',
      time: true
    }
  ]
};
