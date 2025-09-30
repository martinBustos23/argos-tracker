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
      `SELECT * FROM ${this.#table} WHERE timestamp >= (CURRENT_TIMESTAMP() - ${n * 60}) ORDER BY timestamp DESC`
    );
    return logs.map((log) => new LogDTO(log));
  }

  async findLastWhere(logConditions) {
    const columns = Object.keys(logConditions).map((column) => {
      if (typeof logConditions[column] === 'string')
        return `${column} = '${logConditions[column]}'`;
      else return `${column} = ${logConditions[column]}`;
    });
    const whereStatement = columns.join(' AND ');
    const [result] = await this.#db.execute(
      `SELECT * FROM ${this.#table} WHERE ${whereStatement} ORDER BY timestamp DESC LIMIT 1`
    );
    if (result.length === 0) return null;
    return new LogDTO(result[0]);
  }

  async getAllSince(log) {
    const [logs] = await this.#db.execute(
      `SELECT * FROM ${this.#table} WHERE timestamp >= '${log.timestamp.toISOString().replace(/[A-Z]/g, ' ')}' ORDER BY timestamp DESC`
    );
    if (logs.length === 0) return null;
    return logs.map((log) => new LogDTO(log));
  }
}
