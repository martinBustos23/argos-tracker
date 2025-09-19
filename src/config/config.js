import 'dotenv/config';

export default {
  PORT: process.env.PORT,

  DB_URL: process.env.DB_URL,
  DB_PORT: process.env.DB_PORT,
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,

  JWT_KEY: process.env.JWT_KEY,

  DEFAULT_ADMIN_PASSWORD: process.env.DEFAULT_ADMIN_PASSWORD,

  FIRST_TIMEOUT_TRIES: process.env.FIRST_TIMEOUT_TRIES,
  FIRST_TIMEOUT_MINUTES: process.env.FIRST_TIMEOUT_MINUTES,
  SECOND_TIMEOUT_TRIES: process.env.SECOND_TIMEOUT_TRIES,
  SECOND_TIMEOUT_MINUTES: process.env.SECOND_TIMEOUT_MINUTES,
  BLOCK_TRIES: process.env.BLOCK_TRIES,
};
