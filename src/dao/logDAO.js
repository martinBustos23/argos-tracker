import LogDTO from '../dto/logDTO.js';

export default class LogDAO {
  #db;
  #table;
  constructor(db, table) {
    this.#db = db;
    this.#table = table;
  }

  async create(log) {
    const { timestamp, level, id, description, action, status } = log;
    await this.#db.execute(
      `INSERT INTO ${this.#table} (timestamp, level, id, action, description, status) VALUES (?, ?, ?, ?, ?, ?)`,
      [timestamp, level, id, action, description, status]
    );
  }

  async getLatest(n) {
    const [logs] = await this.#db.execute(`SELECT * FROM ${this.#table} ORDER BY timestamp DESC LIMIT ${n}`);
    return logs.map((log) => new LogDTO(log));
  }

}
