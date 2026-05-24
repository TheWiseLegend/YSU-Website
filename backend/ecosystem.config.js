module.exports = {
  apps: [{
    name: "ysu-backend",
    script: "dist/src/main.js",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "production",
      DATABASE_URL: "postgresql://postgres:ysu123@localhost:5432/ysu-backend?schema=public",
      ADMIN_PASSWORD: "supersecret123",
      JWT_SECRET: "myjwtsecret",
      BASE_URL: "https://ysumalaysia.org",
      UPLOADS_PATH: "/var/www/uploads",
      FIREBASE_SERVICE_ACCOUNT_KEY_PATH: "/root/ysu-backend/ysu-backend/firebase-key.json",
      FIREBASE_STORAGE_BUCKET: "ysu-website-f701.appspot.com"
    }
  }]
};
