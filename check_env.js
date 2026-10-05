const path = require('path');
const dotenv = require('dotenv');
const envPath = path.resolve('/home/deploy/vortex-repo/Backend_Vortex/.env');
console.log('envPath', envPath);
const result = dotenv.config({ path: envPath, override: false });
console.log('dotenvLoaded', result.error ? String(result.error) : 'ok');
console.log(JSON.stringify({
  cwd: process.cwd(),
  OWNER_EMAIL: process.env.OWNER_EMAIL || '<missing>',
  OWNER_PASSWORD_HASH: process.env.OWNER_PASSWORD_HASH || '<missing>',
  SESSION_SECRET: process.env.SESSION_SECRET || '<missing>',
  PORT: process.env.PORT || '<missing>',
  NODE_ENV: process.env.NODE_ENV || '<missing>'
}, null, 2));
