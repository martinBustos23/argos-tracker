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

  async findLastWhere(logConditions) {
    try {
      const result = await this.#logDAO.findLastWhere(logConditions);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getAllSince(id) {
    try {
      const exist = await this.#logDAO.findLog(id);
      if (!exist) throw new InternalError('El log no existe');
      const result = await this.#logDAO.getAllSince(exist);
      return result;
    } catch (error) {
      throw error;
    }
  }
}
