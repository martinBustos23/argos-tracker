import { Exception, NotFound } from '../utils.js';
import LogDTO from '../dto/logDTO.js';

export default class UserLogController {
  #trackerLogDAO;
  constructor(trackerLogDAO) {
    this.#trackerLogDAO = trackerLogDAO;
  }

  async #addLog(type, id, action, description, status) {
    try {
      return this.#trackerLogDAO.create(new LogDTO({
        timestamp: new Date()
            .toISOString() // obtiente el timestamp YYYY-MM-DDTHH:mm:ss.sssZ
            .replace(/[A-Z]/g, ' '), // reemplaza los caracteres T y Z por espacios
        level: type,
        id: id,
        action: action,
        description: description,
        status: status
      }));
    } catch (error) {
      throw new Exception(`Error creando log: ${error.message}`, 500);
    }
  }

  async addLinking(id, level) {
    try {
      return await this.#addLog(level, id, 'Link', null);
    } catch (error) {
      throw new Exception(`Error creando log: ${error.message}`, 500);
    }
  }

  async addUpdate(id, trackerUpdate, level) {
    try {
      const columns = Object.getOwnPropertyNames(trackerUpdate);
      const description = columns.map((column) => `${column} = ${trackerUpdate[column]}`).join(', ');

      return await this.#addLog(level, id, 'Update', description);
    } catch (error) {
      throw new Exception(`Error creando log: ${error.message}`, 500);
    }
  }

  async addUnlinking(id, level) {
    try {
      return await this.#addLog(level, id, 'Unlink', null);
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
