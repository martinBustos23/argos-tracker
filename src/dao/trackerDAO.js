import TrackerDTO from '../dto/trackerDTO.js';

export default class TrackerDAO {
  #db;
  constructor(db) {
    this.#db = db;
  }

  async create(tracker) {
    let { id, petName, frequency, lowBat, safeZoneLat, safeZoneLon, safeZoneRadius } = tracker;

    const queryMsg =
      'INSERT INTO trackers (petName, frequency, lowBat, safeZoneLat, safeZoneLon, safeZoneRadius) VALUES (?, ?, ?, ?, ?, ?)';
    const [ result ] = await this.#db.execute(queryMsg, [
      petName,
      frequency,
      lowBat,
      safeZoneLat,
      safeZoneLon,
      safeZoneRadius,
    ]);

    return this.findById(result.insertId);
  }

  async findById(id) {
    const [ result ] = await this.#db.execute('SELECT * FROM trackers WHERE id = ?', [id]);
    if (result.length === 0) return null;
    return new TrackerDTO(result[0]);
  }

  async update(tracker) {
    let { id, petName, frequency, lowBat, safeZoneLat, safeZoneLon, safeZoneRadius, active } = tracker;
    await this.#db.execute(
      'UPDATE trackers SET petName = ?, frecuency = ?, lowBat = ?, safeZoneLat = ?, safeZoneLon = ?, safeZoneRadius = ?, active = ? WHERE username = ?',
      [petName, frequency, lowBat, safeZoneLat, safeZoneLon, safeZoneRadius, active]
    );
    return { id, ...tracker };
  }

  async delete(trackerId) {
    await this.#db.execute('DELETE FROM trackers WHERE id = ?', [trackerId])
    return { message: `Tracker ${trackerId} eliminado` };
  }

  async getAll() {
    const [rows] = await this.#db.execute('SELECT * FROM trackers');
    return rows.map((row) => new TrackerDTO(row));
  }
}