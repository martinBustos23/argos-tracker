import { Exception, NotFound } from '../utils.js';
import UserLogDTO from '../dto/userLogDTO.js';

export default class UserLogController {
  #userLogDAO;
  constructor(userLogDAO) {
    this.#userLogDAO = userLogDAO;
  }

  async #addLog(type, username, action, status) {
    try {
      return this.#userLogDAO.create(new UserLogDTO({
        timestamp: new Date()
            .toISOString() // obtiente el timestamp YYYY-MM-DDTHH:mm:ss.sssZ
            .replace(/[A-Z]/g, ' '), // reemplaza los caracteres T y Z por espacios
        level: type,
        user: username,
        action: action,
        status: status
      }));
    } catch (error) {
      throw new Exception(`Error creando log: ${error.message}`, 500);
    }
  }

  async addLogin(username, status) {
    try {
      return await this.#addLog('INFO', username, 'Login', status);
    } catch (error) {
      throw new Exception(`Error creando log: ${error.message}`, 500);
    }
  }

  async addRegistration(username, status) {
    try {
      return await this.#addLog('INFO', username, 'Registration', status);
    } catch (error) {
      throw new Exception(`Error creando log: ${error.message}`, 500);
    }
  }

  async addUpdate(username, fields, status) {
    try {
      return await this.#addLog('INFO', username, 'Update', status);
    } catch (error) {
      throw new Exception(`Error creando log: ${error.message}`, 500);
    }
  }

  async getLatest(n) {
    try {
      return this.#userLogDAO.getLatest(n);
    } catch (error) {
      throw new Exception(`Error obteniendo log: ${error.message}`, 500);
    }
  }

  async getLastConnection(username) {
    try {
      return this.#userLogDAO.getLastConnection(username);
    } catch (error) {
      throw new Exception(`Error ultima coneccion: ${error.message}`, 500);
    }
  }
}
