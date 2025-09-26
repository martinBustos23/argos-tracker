import { InternalError, NotFound } from '../utils.js';
import LogDTO from '../dto/logDTO.js';

export default class LogController {
  #logDAO;
  constructor(logDAO) {
    this.#logDAO = logDAO;
  }

  async addLog(level, source, action, description) {
    try {
      const log = this.#logDAO.create(
        new LogDTO({
          level,
          source,
          action,
          description,
        })
      );
      return log;
    } catch (error) {
      if (error.status) throw error;
      throw new InternalError(`Error interno al crear log: '${action}'`);
    }
  }

  async getLatest(n) {
    try {
      return await this.#logDAO.getLatest(n);
    } catch (error) {
      throw error;
    }
  }

  async getLastConnection(username) {
    try {
      return this.#logDAO.getLastConnection(username);
    } catch (error) {
      throw error;
    }
  }

  async getLastNMinutes(n, action, level) {
    try {
      let logs = await this.#logDAO.getLastNMinutes(n);
      if (action) logs = logs.filter((log) => log.action === action);
      if (level) logs = logs.filter((log) => log.level === level);
      return logs;
    } catch (error) {
      throw error;
    }
  }
}
