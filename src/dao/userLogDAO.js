import UserLogDTO from '../dto/userLogDTO.js';

export default class UserLogDAO {
  #db;
  constructor(db) {
    this.#db = db;
  }

  async create(log) {
    const { timestamp, level, user, action, status } = log;
    await this.#db.execute(
      'INSERT INTO usersLog (timestamp, level, user, action, status) VALUES (?, ?, ?, ?, ?)',
      [timestamp, level, user, action, status]
    );
  }

  async getLatest(n) {
    const [logs] = await this.#db.execute(`SELECT * FROM usersLog LIMIT ${n}`);
    return logs.map((log) => new UserLogDTO(log));
  }

  async getLastConnection(username) {
    const [log] = await this.#db.execute(
      "SELECT MAX(timestamp) FROM usersLog WHERE user = ? AND action = 'Login' AND status = 1",
      [username]
    );
    console.log(log[0]);
    return log[0]['MAX(timestamp)'];
  }
}
