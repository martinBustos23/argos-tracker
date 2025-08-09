/*
  las query probablemente esten mal
  cambiar id a username
*/

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

    return this.findByID(username);
  }

  async getAll() {
    const [rows] = await this.#db.execute('SELECT * FROM users');
    return rows.map((row) => new UserDTO(row));
  }

  async findByID(username) {
    const [result] = await this.#db.query(
      'SELECT * FROM users WHERE username = ?',
      [[username]]
    );
    if (result.length === 0) return null;
    return new UserDTO(result[0]);
  }

  async update(user) {
    const { username, password, admin, active } = user;
    await this.#db.execute(
      'UPDATE users SET password = ?, admin = ?, active = ? WHERE username = ?',
      [password, admin, active, username]
    );
    return { username, ...user };
  }

  async delete(username) {
    await this.#db.execute('DELETE FROM users WHERE username = ?', [username]);
    return { message: `Usuario ${username} eliminado` };
  }
}
