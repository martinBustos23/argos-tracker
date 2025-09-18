import { InternalError, NotFound } from '../utils.js';
import TrackerEventDTO from '../dto/trackerEventDTO.js';

export default class TrackerEventController {
  #trackerEventDAO;
  constructor(trackerEventDAO) {
    this.#trackerEventDAO = trackerEventDAO;
  }

  #validateEvent(event) {
    const failConditions = [
      { variable: event.batteryLvl, expression: event.batteryLvl < 0 || event.batteryLvl > 100 },
      {
        variable: event.latitude,
        expression: event.latitude > 90 || event.latitude < -90,
      },
      {
        variable: event.longitude,
        expression: event.longitude > 180 || event.longitude < -180,
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

  async #addEvent(event) {
    try {
      if (!this.#validateEvent(event)) throw new InternalError('Evento no valido');
      const result = this.#trackerEventDAO.create(event);
      return result;
    } catch (error) {
      if (error.status) throw error;
      throw new InternalError(
        `Error interno al crear evento: '${eventDesc}' para el tracker ${trackerId}`
      );
    }
  }

  async addPosition(trackerId, latitude, longitude) {
    try {
      return await this.#addEvent(
        new TrackerEventDTO({
          trackerId,
          eventDesc: 'POSITION',
          latitude,
          longitude,
          batteryLvl: null,
        })
      );
    } catch (error) {
      throw error;
    }
  }

  async addBatteryLvl(trackerId, batteryLvl) {
    try {
      return await this.#addEvent(
        new TrackerEventDTO({
          trackerId,
          eventDesc: 'BATTERY_LVL',
          latitude: null,
          longitude: null,
          batteryLvl,
        })
      );
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
