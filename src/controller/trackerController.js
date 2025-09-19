import {
  Conflict,
  NotFound,
  BadRequest,
  Unauthorized,
  Forbidden,
  InternalError,
} from '../utils.js';
import config from '../config/config.js';

export default class TrackerController {
  #trackerDAO;
  #trackerLogController;
  constructor(trackerDAO, trackerLogController) {
    this.#trackerDAO = trackerDAO;
    this.#trackerLogController = trackerLogController;
  }

  async createTracker(tracker) {
    try {
      if (!this.#validarTracker(tracker))
        throw new BadRequest('Uno de los valores ingresados es invalido o esta fuera de rango');
      const newTracker = await this.#trackerDAO.create(tracker);
      await this.#trackerLogController.addLinking(newTracker.id, 'INFO');
      return newTracker;
    } catch (error) {
      // await this.#trackerLogController.addLinking(newTracker.id, 'ERROR');
      if (error.status) throw error;
      throw new InternalError('Error interno creando tracker');
    }
  }

  async getAll() {
    try {
      const trackers = await this.#trackerDAO.getAll();
      return trackers;
    } catch (error) {
      if (error.status) throw error;
      throw new InternalError('Error interno obteniendo trackers');
    }
  }

  async find(trackerId) {
    try {
      const tracker = await this.#trackerDAO.find(trackerId);
      if (!tracker) throw new NotFound(`El tracker (${tracker.id}) no fue encontrado`);
      return tracker;
    } catch (error) {
      if (error.status) throw error;
      throw new InternalError('Error interno buscando tracker');
    }
  }

  async updateTracker(id, tracker) {
    try {
      const exist = await this.#trackerDAO.find(id); //probable no const
      if (!exist) throw new NotFound(`El tracker (${id}) no fue encontrado`);

      if (!this.#validarTracker(tracker))
        throw new BadRequest('El o los valores a actualizar no son validos o estan fuera de rango');

      const updatedTracker = await this.#trackerDAO.update(id, tracker);
      await this.#trackerLogController.addUpdate(id, tracker, 'INFO');
      return updatedTracker;
    } catch (error) {
      await this.#trackerLogController.addUpdate(id, tracker, 'ERROR');
      if (error.status) throw error;
      throw new InternalError('Error interno actualizando tracker');
    }
  }

  #validarTracker(tracker) {
    const failConditions = [
      { variable: tracker.frequency, expression: tracker.frequency <= 0 },
      { variable: tracker.lowBat, expression: tracker.lowBat < 0 || tracker.lowBat > 100 },
      {
        variable: tracker.geofenceLat,
        expression: tracker.geofenceLat > 90 || tracker.geofenceLat < -90,
      },
      {
        variable: tracker.geofenceLon,
        expression: tracker.geofenceLon > 180 || tracker.geofenceLon < -180,
      },
      {
        variable: tracker.geofenceRadius,
        expression: tracker.geofenceRadius < 0 || tracker.geofenceRadius > 5000,
      },
      {
        variable: tracker.emergencyFrequency,
        expression: tracker.emergencyFrequency !== null && tracker.emergencyFrequency <= 0,
      },
    ];


    if (
      failConditions.some(
        (condition) => typeof condition.variable !== 'undefined' && condition.expression
      )
    )
      return false;
    return true;
  }

  async disable(id) {
    try {
      const exist = await this.#trackerDAO.find(id);
      if (!exist) throw new NotFound(`El tracker (${id}) no fue encontrado`);

      const result = await this.updateTracker(id, { active: false });
      await this.#trackerLogController.addDisable(id, 'INFO');
      return result;
    } catch (error) {
      await this.#trackerLogController.addDisable(id, 'ERROR');
      if (error.status) throw error;
      throw new InternalError('Error interno desabilitando tracker');
    }
  }

  async deleteTracker(id) {
    try {
      const exist = await this.#trackerDAO.find(id);
      if (!exist) throw new NotFound(`El tracker (${id}) no fue encontrado`);

      return this.#trackerDAO.delete(id);
    } catch (error) {
      if (error.status) throw error;
      throw new InternalError('Error interno eliminando tracker');
    }
  }
}
