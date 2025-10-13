import mysql from 'mysql2/promise';
import tables from '../src/config/dbStructure.json' with { type: 'json' };
import { createTable } from '../src/utils.js';
import 'dotenv/config';

export function compareArrays(arr1, arr2) {
  if (arr1 === arr2) return true;

  if (typeof arr1 !== 'object' || typeof arr2 !== 'object' || arr1 == null || arr2 == null)
    return false;

  if (arr1.length !== arr2.length) return false;

  for (let index = 0; index < arr1.length; index++) {
    if (!deepCompare(arr1[index], arr2[index])) return false;
  }

  return true;
}

export function deepCompare(obj1, obj2) {
  if (obj1 === obj2) return true;

  if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 == null || obj2 == null)
    return false;

  const obj1Keys = Object.keys(obj1);
  const obj2Keys = Object.keys(obj2);

  if (obj1Keys.length !== obj2Keys.length) return false;

  for (const key of obj1Keys) {
    if (!obj2Keys.includes(key) || !deepCompare(obj1[key], obj2[key])) return false;
  }

  return true;
}

export async function initDB() {
  const db = mysql.createPool({
    host: process.env.TEST_DB_URL,
    port: process.env.TEST_DB_PORT,
    database: process.env.TEST_DB_NAME,
    user: process.env.TEST_DB_USER,
    password: process.env.TEST_DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10, // conexiones maximas
    idleTimeout: 60000, // milisegundos
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  });
  await db.execute(`SET @@session.time_zone='+00:00'`);
  for (const table of tables) {
    let [result] = await db.execute(`SHOW TABLES LIKE '${table.name}'`);
    if (!result.length)
      // si no existe, crear la tabla segun dbSetructure.json
      await createTable(table.name, table, db);
  }
  return db;
}

export async function dropTables(db) {
  await db.execute('SET FOREIGN_KEY_CHECKS = 0');
  for (const table of tables) {
    await db.execute(`DROP TABLE ${table.name}`);
  }
  await db.execute('SET FOREIGN_KEY_CHECKS = 1');
}
