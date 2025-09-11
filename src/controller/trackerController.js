import { Conflict, NotFound, BadRequest, Unauthorized, Forbidden, InternalError } from '../utils.js';
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
      if ((await this.#trackerDAO.countActive()) >= config.MAX_TRACKERS)
        throw new Conflict('Cantidad maxima de trackers alcanzada');
      const newTracker = await this.#trackerDAO.create(tracker);
      await this.#trackerLogController.addLinking(newTracker.id, 'INFO');
      return newTracker;
    } catch (error) {
      // await this.#trackerLogController.addLinking(newTracker.id, 'ERROR');
      if (error.code) throw error;
      throw new InternalError('Error interno creando tracker');
    }
  }

  async getAll() {
    try {
      const trackers = await this.#trackerDAO.getAll();
      return trackers;
    } catch (error) {
      if (error.code) throw error;
      throw new InternalError('Error interno obteniendo trackers');
    }
  }

  async findByID(trackerId) {
    try {
      const tracker = await this.#trackerDAO.findById(trackerId);
      if (!tracker) {
        throw new NotFound(`El tracker (${tracker.id}) no fue encontrado`);
      }
      return tracker;
    } catch (error) {
      if (error.code) throw error;
      throw new InternalError('Error interno buscando tracker');
    }
  }

  async updateTracker(id, tracker) {
    try {
      const exist = await this.#trackerDAO.findById(id); //probable no const

      if (!exist) throw new NotFound(`El tracker (${id}) no fue encontrado`);

      //validar datos tracker?

      const updatedTracker = await this.#trackerDAO.update(id, tracker);
      await this.#trackerLogController.addUpdate(id, 'INFO');
      return updatedTracker;
    } catch (error) {
      await this.#trackerLogController.addUpdate(id, 'ERROR');
      if (error.code) throw error;
      throw new InternalError('Error interno actualizando tracker');
    }
  }

  async deleteTracker(id) {
    try {
      const exist = await this.#trackerDAO.findById(id);
      if (!exist) throw new NotFound(`El tracker (${id}) no fue encontrado`);

      return this.#trackerDAO.delete(id);
    } catch (error) {
      if (error.code) throw error;
      throw new InternalError('Error interno eliminando tracker');
    }
  }
}
