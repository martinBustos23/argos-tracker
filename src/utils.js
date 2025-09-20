import { fileURLToPath } from 'url';
import { dirname } from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import config from './config/config.js';

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

//Manejo de errores
export class Exception extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export class NotFound extends Exception {
  constructor(message) {
    super(message, 404);
  }
}

export class BadRequest extends Exception {
  constructor(message) {
    super(message, 404);
  }
}

export class Unauthorized extends Exception {
  constructor(message) {
    super(message, 401);
  }
}

export class Forbidden extends Exception {
  constructor(message) {
    super(message, 403);
  }
}

export class Conflict extends Exception {
  constructor(message) {
    super(message, 409);
  }
}

export class InternalError extends Exception {
  constructor(message) {
    super(message, 500);
  }
}

export const generateToken = (username) => {
  const token = jwt.sign({ username }, config.JWT_KEY, { expiresIn: '1h' });
  return token;
};

export const authToken = (req, res, next) => {
  const token = req.cookies.authorization;
  if (!token) return res.status(401).json({ error: 'Usuario no autenticado' });
  jwt.verify(token, config.JWT_KEY, (error, credentials) => {
    if (error) return res.status(403).json({ error: 'Usuario no autorizado' });
    req.user = credentials.username;
    next();
  });
};

export const getUserFromToken = (token) => {
  let username;
  jwt.verify(token, config.JWT_KEY, (error, credentials) => {
    if (error) throw new Exception('No se pudo autenticar al usuario', 500);
    username = credentials.username;
  });
  return username;
};

export async function createTable(name, structure, db) {
  let sentences = new Array();

  // obtener columnas
  for (const field of structure.fields) {
    const sentence = `${field.name} ${field.type} ${field.key || ''} ${field.nullable ? '' : 'NOT NULL '}${field.default != null ? 'DEFAULT ' + field.default : ''}${field.extra || ''}`;
    sentences.push(sentence);
  }

  // obtener llaves foraneas
  if (structure.foreignKeys)
    for (const constraint of structure.foreignKeys) {
      const sentence = `CONSTRAINT ${constraint.name} FOREIGN KEY (${constraint.column}) REFERENCES ${constraint.reference_table}(${constraint.reference_column})`;
      sentences.push(sentence);
    }

  const queryMessage = `CREATE TABLE ${name} (${sentences.join(', ')} )`;
  const [result] = await db.execute(queryMessage);
  if (result) console.log(`Tabla ${name} creada`);
}

export async function createAdmin(db) {
  const salt = await bcrypt.genSalt(12); // 12 rondas de sason
  const hash = await bcrypt.hash(config.DEFAULT_ADMIN_PASSWORD, salt);
  const [result] = await db.execute(
    'INSERT INTO users (username, password, admin) VALUES (?, ?, ?)',
    ['admin', hash, true]
  );
  if (result) console.log('Administrador creado\nUsername: admin\nPassword: admin');
}

export function broadcastWSEvent(trackerid, clients, data) {
  clients.forEach(client => {
    if (client.conn.readyState === WebSocket.OPEN && client.tracker == trackerid) {
        client.conn.send(JSON.stringify(data));
    }
  });
}