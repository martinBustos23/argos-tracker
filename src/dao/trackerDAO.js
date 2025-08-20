import TrackerDTO from '../dto/trackerDTO.js';

export default class TrackerDAO {
  #db;
  constructor(db) {
    this.#db = db;
  }

  async create(tracker) {
    const columns = Object.getOwnPropertyNames(tracker);

    // extraer descriptor y placeholders del mensaje del query
    const descriptor = columns.toString();
    const placeHolders = columns.map((column) => '?').toString();
    const values = columns.map((column) => tracker[column]);

    const queryMsg = `INSERT INTO trackers (${descriptor}) VALUES (${placeHolders})`;
    const [result] = await this.#db.execute(queryMsg, values);

    return this.findById(result.insertId);
  }

  async findById(id) {
    const [result] = await this.#db.execute('SELECT * FROM trackers WHERE id = ?', [id]);
    if (result.length === 0) return null;
    return new TrackerDTO(result[0]);
  }

  async update(id, tracker) {
    // let { id, petName, frequency, lowBat, safeZoneLat, safeZoneLon, safeZoneRadius, active } =
    //   tracker;

    const columns = Object.getOwnPropertyNames(tracker);

    // extraer descriptor y placeholders del mensaje del query
    const descriptor = columns.join(' = ?,').concat(' = ?');
    const values = columns.map((column) => tracker[column]);

    console.log(descriptor);
    console.log(values);
    await this.#db.execute(`UPDATE trackers SET ${descriptor} WHERE id = ?`, [...values, id]);
    return { id, ...tracker };
  }

  async delete(trackerId) {
    await this.#db.execute('DELETE FROM trackers WHERE id = ?', [trackerId]);
    return { message: `Tracker ${trackerId} eliminado` };
  }

  async getAll() {
    const [rows] = await this.#db.execute('SELECT * FROM trackers');
    return rows.map((row) => new TrackerDTO(row));
  }

  async countActive() {
    const [result] = await this.#db.execute('SELECT COUNT(*) FROM trackers WHERE active = true');
    return result[0]['COUNT(*)'];
  }

  async createLogTable(tracker) {
    const columns = 'timestamp DATE NOT NULL, type INT NOT NULL, payload VARCHAR(128) NOT NULL';
    await this.#db.execute(`CREATE TABLE tracker_${tracker.id}_log (${columns})`);
    return { message: `Log trackers ${tracker.id} creado` };
  }
}
