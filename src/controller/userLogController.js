import { Exception, NotFound } from '../utils.js';
import LogDTO from '../dto/logDTO.js';

export default class UserLogController {
  #userLogDAO;
  constructor(userLogDAO) {
    this.#userLogDAO = userLogDAO;
  }

  async #addLog(type, username, action, description, status) {
    try {
      return this.#userLogDAO.create(new LogDTO({
        timestamp: new Date()
            .toISOString() // obtiente el timestamp YYYY-MM-DDTHH:mm:ss.sssZ
            .replace(/[A-Z]/g, ' '), // reemplaza los caracteres T y Z por espacios
        level: type,
        id: username,
        action: action,
        description: description,
        status: status
      }));
    } catch (error) {
      throw new Exception(`Error creando log: ${error.message}`, 500);
    }
  }

  async addLogin(username, level) {
    try {
      return await this.#addLog(level, username, 'Login', null);
    } catch (error) {
      throw new Exception(`Error creando log: ${error.message}`, 500);
    }
  }

  async addRegistration(username, level) {
    try {
      return await this.#addLog(level, username, 'Registration', null);
    } catch (error) {
      throw new Exception(`Error creando log: ${error.message}`, 500);
    }
  }

  async addUpdate(username, userUpdate, level) {
    try {
      const columns = Object.getOwnPropertyNames(userUpdate);
      const description = columns.map((column) => `${column} = ${column !== 'password' ? userUpdate[column] : '...'}`).join(', ');

      return await this.#addLog(level, username, 'Update', description);
    } catch (error) {
      throw new Exception(`Error creando log: ${error.message}`, 500);
    }
  }

  async addLogout(username, level) {
    try {
      return await this.#addLog(level, username, 'Logout', null);
    } catch (error) {
      throw new Exception(`Error creando log: ${error.message}`, 500);
    }
  }

  async addDeletion(username, level) {
    try {
      return await this.#addLog(level, username, 'Deletion', null);
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
