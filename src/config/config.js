import 'dotenv/config';

export default {
  PORT: process.env.PORT,

  DB_URL: process.env.DB_URL,
  DB_PORT: process.env.DB_PORT,
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,

  JWT_KEY: process.env.JWT_KEY,

  MAX_TRACKERS: process.env.MAX_TRACKERS,
  DEFAULT_ADMIN_PASSWORD: process.env.DEFAULT_ADMIN_PASSWORD
};
