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
  
}
