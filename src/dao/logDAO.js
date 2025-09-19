import LogDTO from '../dto/logDTO.js';

export default class LogDAO {
  #db;
  #table;
  constructor(db, table) {
    this.#db = db;
    this.#table = table;
  }

  async findLog(id) {
    const [result] = await this.#db.execute(`SELECT * FROM ${this.#table} WHERE id = ?`, [id]);
    if (result.length === 0) return null;
    return new LogDTO(result[0]);
  }

  async create(log) {
    const { level, source, description, action } = log;
    const [result] = await this.#db.execute(
      `INSERT INTO ${this.#table} (level, source, action, description) VALUES (?, ?, ?, ?)`,
      [level, source, action, description]
    );
    const resultLog = await this.findLog(result.insertId);
    return resultLog;
  }

  async getLatest(n) {
    const [logs] = await this.#db.execute(
      `SELECT * FROM ${this.#table} ORDER BY timestamp DESC LIMIT ${n}`
    );
    return logs.map((log) => new LogDTO(log));
  }

  async getLastNMinutes(n) {
    const [logs] = await this.#db.execute(
      `SELECT * FROM ${this.#table} WHERE timestamp >= (CURRENT_TIMESTAMP() - ${n * 60})`
    );
    return logs.map((log) => new LogDTO(log));
  }
}
