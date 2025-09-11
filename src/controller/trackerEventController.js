import { InternalError, NotFound } from '../utils.js';
import TrackerEventDTO from '../dto/trackerEventDTO.js';

export default class TrackerEventController {
  #trackerEventDAO;
  constructor(trackerEventDAO) {
    this.#trackerEventDAO = trackerEventDAO;
  }

  async #addEvent(trackerId, eventDesc, latitude, longitude, batteryLvl) {
    try {
      const event = this.#trackerEventDAO.create(
        new TrackerEventDTO({
          trackerId,
          eventDesc,
          latitude,
          longitude,
          batteryLvl,
        })
      );
      return event;
    } catch (error) {
      if (error.code) throw error;
      throw new InternalError(`Error interno al crear evento: '${eventDesc}' para el tracker ${trackerId}`);
    }
  }

  async addPosition(trackerId, latitude, longitude) {
    try {
      return await this.#addEvent(trackerId, 'POSITION', latitude, longitude, null);
    } catch (error) {
      throw error;
    }
  }

  async addBatteryLvl(trackerId, batteryLvl) {
    try {
      return await this.#addEvent(trackerId, 'BATTERY_LVL', null, null, batteryLvl);
    } catch (error) {
      throw error;
    }
  }

  async getLatest(n) {
    try {
      return this.#trackerEventDAO.getLatest(n);
    } catch (error) {
      throw error;
    }
  }

  async getAll() {
    try {
      return this.#trackerEventDAO.getAll();
    } catch (error) {
      throw error;
    }
  }
}
