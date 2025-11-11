import TrackerEventDTO from '../dto/trackerEventDTO.js';

export default class TrackerEventDAO {
  #db;
  constructor(db) {
    this.#db = db;
  }

  async findEvent(id) {
    const [result] = await this.#db.execute(`SELECT * FROM trackerEvents WHERE id = ?`, [id]);
    if (result.length === 0) return null;
    return new TrackerEventDTO(result[0]);
  }

  async create(event) {
    const { trackerId, eventDesc, latitude, longitude, batteryLvl } = event;
    const [result] = await this.#db.execute(
      `INSERT INTO trackerEvents (trackerId, eventDesc, latitude, longitude, batteryLvl) VALUES (?, ?, ?, ?, ?)`,
      [trackerId, eventDesc, latitude, longitude, batteryLvl]
    );
    const resultLog = await this.findEvent(result.insertId);
    return resultLog;
  }

  async getByTrackerId(trackerId, limit) {
    let query = `SELECT * FROM trackerEvents WHERE trackerId = ? ORDER BY timestamp DESC`;

    if (limit !== null) {
      query += ` LIMIT ${parseInt(limit)}`;
    }

    const [events] = await this.#db.execute(query, [trackerId]);
    return events.map((event) => new TrackerEventDTO(event));
  }

  async getAll() {
    const [events] = await this.#db.execute(`SELECT * FROM trackerEvents ORDER BY timestamp DESC`);
    return events.map((event) => new TrackerEventDTO(event));
  }
}
