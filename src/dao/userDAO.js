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
    const [result] = await this.#db.query('SELECT * FROM users WHERE username = ?', [[username]]);
    if (result.length === 0) return null;
    return new UserDTO(result[0]);
  }

  async update(username, user) {
    const columns = Object.getOwnPropertyNames(user);

    // extraer descriptor y placeholders del mensaje del query
    const descriptor = columns.join(' = ?,').concat(' = ?');
    const values = columns.map((column) => user[column]);

    console.log(descriptor);
    console.log(values);
    await this.#db.execute(`UPDATE users SET ${descriptor} WHERE username = ?`, [...values, username]);
    return { username, ...user };
  }

  async delete(username) {
    await this.#db.execute('DELETE FROM users WHERE username = ?', [username]);
    return { message: `Usuario ${username} eliminado` };
  }

  async getAllInactive() {
    const [rows] = await this.#db.execute('SELECT * FROM users WHERE active = false');
    return rows.map((row) => new UserDTO(row));
  }
}
