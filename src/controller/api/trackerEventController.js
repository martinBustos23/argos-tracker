import { BadRequest, InternalError, NotFound } from '../../utils.js';
import TrackerEventDTO from '../../dto/trackerEventDTO.js';

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

  async addEvent(trackerId, latitude, longitude, batteryLvl, eventDesc) {
    try {
      const event = {
        trackerId,
        eventDesc: eventDesc || 'POSITION',
        latitude,
        longitude,
        batteryLvl,
      };

      if (!this.#validateEvent(event)) throw new BadRequest('Datos del evento invalidos');
      const result = this.#trackerEventDAO.create(new TrackerEventDTO(event));
      return result;
    } catch (error) {
      if (error.status) throw error;
      throw new InternalError(
        `Error interno al crear evento: '${eventDesc}' para el tracker ${trackerId}`
      );
    }
  }


  async getEventsByTrackerId(trackerId, limit) {
    try {
      return await this.#trackerEventDAO.getByTrackerId(trackerId, limit);
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
