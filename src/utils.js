import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import config from './config/config.js';

import sharp from 'sharp';
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

export const generateToken = (id) => {
  const token = jwt.sign({ id }, config.JWT_KEY, { expiresIn: '90d' });
  return token;
};

export const authToken = async (req, res, next, userController) => {
  const token = req.cookies.authorization;
  try {
    
    if (!token && req.body.username && req.body.password) {
      const user = await userController.login(req.body);
      if (!user)
        return res.status(401).json({ error: 'Usuario no autenticado' });
      req.id = user.id;
    }

    if (token)
      jwt.verify(token, config.JWT_KEY, (error, credentials) => {
        if (error) return res.status(403).json({ error: 'Usuario no autorizado', nose: 'hola' });
        req.id = credentials.id;
      });

    next();
  } catch (error){
    next(error);
  }
};

export function validatePassword(password) {
  if (password.length < 8) return false;
  const expressions = [/[a-z]/g,/[A-Z]/g,/[0-9]/g];
  for (const expression of expressions) {
    const result = expression.test(password);
    if (result === false) return false;
  }
  return true;
}

export const isAdmin = (UserController) => {
  return async (req, res, next) => {
    try {
      const user = await UserController.find(req.id);
      if (!user || !user.admin) throw new Forbidden('Acceso solo para administrador');

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const getUserIdFromToken = (token) => {
  let id;
  jwt.verify(token, config.JWT_KEY, (error, credentials) => {
    if (error) throw new Exception('No se pudo autenticar al usuario', 500);
    id = credentials.id;
  });
  return id;
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
  clients.forEach((client) => {
    if (
      (client.conn.readyState === WebSocket.OPEN && client.tracker == trackerid) ||
      client.tracker == '*'
    ) {
      client.conn.send(JSON.stringify(data));
    }
  });
}

export async function roundImagePNG(inputImgPath, outputImgPath, size) {
  const svg = Buffer.from(
    `<svg width="${size}" height="${size}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/>
    </svg>`
  );

  await sharp(inputImgPath)
    .resize(size, size, { fit: 'cover' })
    .composite([{ input: svg, blend: 'dest-in' }])
    .png()
    .toFile(outputImgPath);
}

export function updateObjectValues(from, to) {
  for (const key in to) {
    if (typeof from[key] === 'object') updateObjectValues(from[key], to[key]);
    else from[key] = to[key];
  }
}

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
    super(message, 400);
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

async function convertImages() {
  for (let index = 1; index <= 5; index++) {
    await roundImagePNG(
      join(__dirname, '..', `public/img/petIcons/gato${index}.jpg`),
      join(__dirname, '..', `public/img/petIcons/rounded/gato${index}.png`),
      256
    ).catch(console.error);
  }
  for (let index = 1; index <= 5; index++) {
    await roundImagePNG(
      join(__dirname, '..', `public/img/petIcons/perro${index}.jpg`),
      join(__dirname, '..', `public/img/petIcons/rounded/perro${index}.png`),
      256
    ).catch(console.error);
  }
}
