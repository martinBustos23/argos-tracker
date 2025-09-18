import { InternalError, NotFound } from '../utils.js';
import LogDTO from '../dto/logDTO.js';

export default class UserLogController {
  #userLogDAO;
  constructor(userLogDAO) {
    this.#userLogDAO = userLogDAO;
  }

  async #addLog(type, username, action, description, status) {
    try {
      const log = this.#userLogDAO.create(
        new LogDTO({
          level: type,
          source: username,
          action: action,
          description: description,
          status: status,
        })
      );
      return log;
    } catch (error) {
      if (error.code) throw error;
      throw new InternalError(`Error interno al crear log: '${action}'`);
    }
  }

  async addLogin(username, level) {
    try {
      return await this.#addLog(level, username, 'Login', null);
    } catch (error) {
      throw error;
    }
  }

  async addRegistration(username, level) {
    try {
      return await this.#addLog(level, username, 'Registration', null);
    } catch (error) {
      throw error;
    }
  }

  async addUpdate(username, userUpdate, level) {
    try {
      const columns = Object.getOwnPropertyNames(userUpdate);
      const description = columns
        .map((column) => `${column} = ${column !== 'password' ? userUpdate[column] : '...'}`)
        .join(', ');

      return await this.#addLog(level, username, 'Update', description);
    } catch (error) {
      throw error;
    }
  }

  async addLogout(username, level) {
    try {
      return await this.#addLog(level, username, 'Logout', null);
    } catch (error) {
      throw error;
    }
  }

  async addDeletion(username, level) {
    try {
      return await this.#addLog(level, username, 'Deletion', null);
    } catch (error) {
      throw error;
    }
  }

  async getLatest(n) {
    try {
      return await this.#userLogDAO.getLatest(n);
    } catch (error) {
      throw error;
    }
  }

  async getLastNMinutes(n, action, level) {
    try {
      let logs = await this.#userLogDAO.getLastNMinutes(n);
      if (action) logs = logs.filter((log) => log.action === action);
      if (level) logs = logs.filter((log) => log.level === level);
      return logs;
    } catch (error) {
      throw error;
    }
  }

  async getLastConnection(username) {
    try {
      return this.#userLogDAO.getLastConnection(username);
    } catch (error) {
      throw error;
    }
  }
}
