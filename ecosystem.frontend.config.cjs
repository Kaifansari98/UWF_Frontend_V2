module.exports = {
  apps: [
    {
      name: "uwf-frontend-production",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      cwd: "/var/www/unitedwelfarefoundation/UWF_Frontend_V2",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        PORT: 3000,
      },
    },
  ],
};
