import UserDTO from '../dto/userDTO.js';

export default class UserDAO {
  #db;
  constructor(db) {
    this.#db = db;
  }

  async create(user) {
    let { username, password } = user;

    await this.#db.execute('INSERT INTO users (username, password) VALUES (?, ?)', [
      username,
      password,
    ]);

    return this.find(username);
  }

  async getAll() {
    const [rows] = await this.#db.execute('SELECT * FROM users');
    return rows.map((row) => new UserDTO(row));
  }

  async find(username) {
    const [result] = await this.#db.execute('SELECT * FROM users WHERE username = ?', [username]);
    if (result.length === 0) return null;
    return new UserDTO(result[0]);
  }

  async update(username, user) {
    const columns = Object.getOwnPropertyNames(user);

    // extraer descriptor y placeholders del mensaje del query
    const descriptor = columns.join(' = ?,').concat(' = ?');
    const values = columns.map((column) => user[column]);

    await this.#db.execute(`UPDATE users SET ${descriptor} WHERE username = ?`, [
      ...values,
      username,
    ]);
    return this.find(username);
  }

  async delete(username) {
    const userToDelete = await this.find(username);
    await this.#db.execute('DELETE FROM users WHERE username = ?', [username]);
    return userToDelete;
  }

  async getAllInactive() {
    const [rows] = await this.#db.execute('SELECT * FROM users WHERE active = false');
    return rows.map((row) => new UserDTO(row));
  }
}
