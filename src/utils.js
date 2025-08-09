import { fileURLToPath } from 'url';
import { dirname } from 'path';

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
