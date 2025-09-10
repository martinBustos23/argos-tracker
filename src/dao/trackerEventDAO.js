import TrackerEventDTO from '../dto/trackerEventDTO.js';

export default class TrackerEventDAO {
  #db;
  constructor(db) {
    this.#db = db;
  }

  async findEvent(trackerId, id) {
    const [result] = await this.#db.execute(`SELECT * FROM tracker_${trackerId}_events WHERE id = ?`, [id]);
    if (result.length === 0) return null;
    return new TrackerEventDTO(result[0]);
  }

  async create(trackerId, event) {
    const { eventDesc, latitude, longitude, batteryLvl } = event;
    const [result] = await this.#db.execute(
      `INSERT INTO tracker_${trackerId}_events (eventDesc, latitude, longitude, batteryLvl) VALUES (?, ?, ?, ?)`,
      [eventDesc, latitude, longitude, batteryLvl]
    );
    const resultLog = await this.findEvent(trackerId, result.insertId);
    return resultLog;
  }

  async getLatest(trackerId, n) {
    const [logs] = await this.#db.execute(
      `SELECT * FROM tracker_${trackerId}_events ORDER BY timestamp DESC LIMIT ${n}`
    );
    return logs.map((log) => new TrackerEventDTO(log));
  }
}
