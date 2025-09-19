import { InternalError } from '../utils.js';
import LogDTO from '../dto/logDTO.js';

export default class UserLogController {
  #trackerLogDAO;
  constructor(trackerLogDAO) {
    this.#trackerLogDAO = trackerLogDAO;
  }

  async #addLog(type, source, action, description, status) {
    try {
      return this.#trackerLogDAO.create(
        new LogDTO({
          level: type,
          source: source,
          action: action,
          description: description,
          status: status,
        })
      );
    } catch (error) {
      if (error.code) throw error;
      throw new InternalError(`Error interno al crear log: '${action}'`);
    }
  }

  async addLinking(source, level) {
    try {
      return await this.#addLog(level, source, 'Link', null);
    } catch (error) {
      throw error;
    }
  }

  async addUpdate(source, trackerUpdate, level) {
    try {
      const columns = Object.getOwnPropertyNames(trackerUpdate);
      const description = columns
        .map((column) => `${column} = ${trackerUpdate[column]}`)
        .join(', ');

      return await this.#addLog(level, source, 'Update', description);
    } catch (error) {
      throw error;
    }
  }

  async addDisable(source, level) {
    try {
      return await this.#addLog(level, source, 'Disable', null);
    } catch (error) {
      throw error;
    }
  }

  async addUnlinking(source, level) {
    try {
      return await this.#addLog(level, source, 'Unlink', null);
    } catch (error) {
      throw error;
    }
  }

  async getLatest(n) {
    try {
      return this.#trackerLogDAO.getLatest(n);
    } catch (error) {
      throw error;
    }
  }
}
