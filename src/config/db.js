import mysql from 'mysql2/promise';
import config from './config.js';
import tables from './dbStructure.json' with { type: 'json' };
import bcrypt from 'bcryptjs';
import { createTable } from '../utils.js';

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
      maxIdle: 10, // conexiones maximas
      idleTimeout: 60000, // milisegundos
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
    console.log('Conexión establecida con la base de datos');
    // inicializar tablas
    for (const table of tables) {
      if (table.name == 'trackerEvents') continue;  // evitar hacer tabla con la plantilla de eventos de tracker
      let [result] = await db.execute(`SHOW TABLES LIKE '${table.name}'`);
      if (!result.length)  // si no existe, crear la tabla segun dbSetructure.json
        await createTable(table.name, table, db);
    }
    //crear admin
    const [result] = await db.query('SELECT * FROM users WHERE admin = ?', [[1]]);
    if (!result.length)
    {
      const salt = await bcrypt.genSalt(12); // 12 rondas de sason
      const hash = await bcrypt.hash('admin', salt);
      const [result] = await db.execute('INSERT INTO users (username, password, admin) VALUES (?, ?, ?)', [
        'admin',
        hash,
        true
      ]);
      if (result) console.log('Administrador creado\nUsername: admin\nPassword: admin');
    } else {
      console.log("Lista de administradores");
      result.forEach(admin => console.log(admin.username));
    }
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
