const mysql = require('mysql2/promise');
const config = require('./config.js');

let db = null;

async function initDB() {
  if (db) return db;

  try {
    db = await mysql.createConnection({
      host: config.DB_URL,
      port: config.DB_PORT,
      database: config.DB_NAME,
      user: config.DB_USER,
      password: config.DB_PASSWORD,
    });
    console.log('Conexión establecida con la base de datos');
    return db;
  } catch (error) {
    console.error('', error.message);
    throw error;
  }
}

function getConnection() {  //probablemente quitarlo
  if (!db) {
    throw new Error('Conexión a la base de datos no inicicalizada');
  }
  return db;
}

module.exports = {
  initDB,
  getConnection,
};
