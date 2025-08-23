import { fileURLToPath } from 'url';
import { dirname } from 'path';
import jwt from 'jsonwebtoken';
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
