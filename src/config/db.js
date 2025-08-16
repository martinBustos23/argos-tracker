import mysql from 'mysql2/promise';
import config from './config.js';

let db = null;

export async function initDB() {
  if (db) return db;

  try {
    db = mysql.createPool({
      host: config.DB_URL,
      port: config.DB_PORT,
      database: config.DB_NAME,
      user: config.DB_USER,
      password: config.DB_PASSWORD,
      waitForConnections: true,
      connectionLimit: 10,
      maxIdle: 10,  // conexiones maximas
      idleTimeout: 60000, // milisegundos
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
    console.log('Conexión establecida con la base de datos');
    return db;
  } catch (error) {
    console.error('', error.message);
    throw error;
  }
}

export function getConnection() {
  //probablemente quitarlo
  if (!db) {
    throw new Error('Conexión a la base de datos no inicicalizada');
  }
  return db;
}
