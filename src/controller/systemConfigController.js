import { BadRequest, InternalError } from '../utils.js';
import SystemConfigDTO from '../dto/systemConfigDTO.js';
import { LEVEL, SYSTEM_ACTIONS } from '../config/constants.js';

export default class SystemConfigController {
  #systemConfigDAO;
  #systemLogController;
  constructor(systemConfigDAO, systemLogController) {
    this.#systemConfigDAO = systemConfigDAO;
    this.#systemLogController = systemLogController;
  }

  async get() {
    try {
      const config = await this.#systemConfigDAO.get();
      return config;
    } catch (error) {
      if (error.status) throw error;
      throw new InternalError('Error interno obteniendo configuracion');
    }
  }

  async update(configMods) {
    try {
      if (Object.keys(configMods).length == 0) throw new BadRequest('Faltan parametros');
      const result = await this.#systemConfigDAO.update(new SystemConfigDTO(configMods));
      await this.#systemLogController.addLog(
        LEVEL.INFO,
        'system',
        SYSTEM_ACTIONS.UPDATE_CONFIG,
        'Configuracion de sistema modificada'
      );
      return result;
    } catch (error) {
      await this.#systemLogController.addLog(
        LEVEL.ERROR,
        'system',
        SYSTEM_ACTIONS.UPDATE_CONFIG,
        'Error modificando la configuracion de sistema'
      );
      if (error.status) throw error;
      throw new InternalError('Error interno modificando configuracion');
    }
  }
}
