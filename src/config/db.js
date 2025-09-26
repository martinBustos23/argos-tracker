import mysql from 'mysql2/promise';
import config from './config.js';
import tables from './dbStructure.json' with { type: 'json' };
import { createTable, createAdmin } from '../utils.js';
import { LEVEL, SYSTEM_ACTIONS } from '../config/constants.js';

let db = null;
let events = [];

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
      maxIdle: 10, // conexiones maximas
      idleTimeout: 60000, // milisegundos
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
    console.log('Conexión establecida con la base de datos');
    events.push({
      level: LEVEL.INFO,
      source: 'system',
      action: SYSTEM_ACTIONS.CONNECT,
      description: 'Conexión establecida con la base de datos',
    });
    // configurar timezone en utc
    await db.execute(`SET @@session.time_zone='+00:00'`);
    // inicializar tablas
    for (const table of tables) {
      let [result] = await db.execute(`SHOW TABLES LIKE '${table.name}'`);
      if (!result.length) {
        // si no existe, crear la tabla segun dbSetructure.json
        await createTable(table.name, table, db);
        events.push({
          level: LEVEL.INFO,
          source: 'system',
          action: SYSTEM_ACTIONS.CREATE,
          description: 'Se creo una tabla en la base de datos',
        });
      }
    }
    //crear admin
    const [result] = await db.query('SELECT * FROM users WHERE admin = ?', [[1]]);
    if (!result.length) {
      createAdmin(db);
      events.push({
        level: LEVEL.INFO,
        source: 'system',
        action: SYSTEM_ACTIONS.CREATE,
        description: 'Se creo usuario admin',
      });
    } else {
      console.log('Lista de administradores');
      result.forEach((admin) => console.log(admin.username));
    }
    return { db, events };
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
