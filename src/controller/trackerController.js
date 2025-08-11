import { Exception, NotFound } from '../utils.js';

export default class TrackerController {
  #trackerDAO;
  constructor(trackerDAO) {
    this.#trackerDAO = trackerDAO;
  }

  async createTracker(tracker) {
    try {
      return await this.#trackerDAO.create(tracker);
    } catch (error) {
      throw new Exception(`Error creando tracker: ${error.message}`, 500);
    }
  }

  async getAll() {
    const trackers = await this.#trackerDAO.getAll();
    return trackers;
  }

  async findByID(trackerId) {
    const tracker = await this.#trackerDAO.findById(trackerId);
    if (!tracker) {
      throw new NotFound(`El tracker (${tracker.id}) no fue encontrado`);
    }
    return tracker;
  }

  async updateTracker(id, tracker) {
    try {
      const exist = await this.#trackerDAO.findById(id); //probable no const

      if (!exist) throw new NotFound(`El tracker (${id}) no fue encontrado`);

      //validar datos tracker?

      const updatedTracker = await this.#trackerDAO.update(id, tracker);

      return updatedTracker;
    } catch (error) {
      throw new Exception(`Error actualizando el tracker: ${error.message}`, 500);
    }
  }
}
