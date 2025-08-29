import { Exception, NotFound } from '../utils.js';
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
      throw new Exception(`Error creando log: ${error.message}`, 500);
    }
  }

  async addLinking(source, level) {
    try {
      return await this.#addLog(level, source, 'Link', null);
    } catch (error) {
      throw new Exception(`Error creando log: ${error.message}`, 500);
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
      throw new Exception(`Error creando log: ${error.message}`, 500);
    }
  }

  async addUnlinking(source, level) {
    try {
      return await this.#addLog(level, source, 'Unlink', null);
    } catch (error) {
      throw new Exception(`Error creando log: ${error.message}`, 500);
    }
  }

  async getLatest(n) {
    try {
      return this.#trackerLogDAO.getLatest(n);
    } catch (error) {
      throw new Exception(`Error obteniendo log: ${error.message}`, 500);
    }
  }
}
