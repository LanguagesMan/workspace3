/**
 * 🚀 PM2 ECOSYSTEM CONFIGURATION
 * 
 * Production process management with PM2
 * Run: pm2 start ecosystem.config.js
 */

module.exports = {
  apps: [
    {
      name: 'langflix-api',
      script: './server.js',
      instances: 'max', // Use all available CPUs
      exec_mode: 'cluster',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      // Logging
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Auto-restart settings
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 10,
      
      // Advanced
      listen_timeout: 3000,
      kill_timeout: 5000,
      
      // Monitoring
      autorestart: true,
      watch: false, // Don't watch in production
      
      // Environment
      node_args: '--max_old_space_size=2048'
    }
  ],

  deploy: {
    production: {
      user: 'deploy',
      host: 'your-production-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:your-username/langflix.git',
      path: '/var/www/langflix',
      'post-deploy': 'npm install && npx prisma generate && npx prisma migrate deploy && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'mkdir -p /var/www/langflix/logs'
    }
  }
};

