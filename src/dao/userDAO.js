/*
  las query probablemente esten mal
  cambiar id a username
*/

const UserDTO = require('../dto/userDTO.js');

class UserDAO {
  #db;
  constructor(db) {
    this.#db = db;
  }

  async create(user) {
    const { username, password, admin, active } = user;
    const [result] = await this.#db.execute(
      'INSERT INTO user (username, password, admin, active) VALUES (?, ?, ?, ?)',
      [username, password, admin, active]
    );
    return { id: result.insertId, ...user };
  }

  async getAll() {
    const [rows] = await this.#db.execute('SELECT * FROM user');
    return rows.map((row) => new UserDTO(row));
  }

  async findByID(id) {
    const [result] = await this.#db.query('SELECT id, username FROM user WHERE id = ?', [id]);
    if (result.length === 0) return null;
    return new UserDTO(result[0]);
  }

  async update(id, user) {
    const { username, password, admin, active } = user;
    await this.#db.execute(
      'UPDATE user SET username = ?, password = ?, admin = ?, active = ? WHERE id = ?',
      [username, password, admin, active, id]
    );
    return { id, ...user };
  }

  async delete(id) {
    await this.#db.execute('DELETE FROM user WHERE id = ?', [id]);
    return { message: `Usuario ${id} eliminado` };
  }
}

module.exports = UserDAO;
