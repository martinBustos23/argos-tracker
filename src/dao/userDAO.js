import UserDTO from '../dto/userDTO.js';

export default class UserDAO {
  #db;
  constructor(db) {
    this.#db = db;
  }

  async create(user) {
    const columns = Object.keys(user);

    // extraer descriptor y placeholders del mensaje del query
    const descriptor = columns.toString();
    const placeHolders = columns.map((column) => '?').toString();
    const values = columns.map((column) => user[column]);

    const queryMsg = `INSERT INTO users (${descriptor}) VALUES (${placeHolders})`;
    const [result] = await this.#db.execute(queryMsg, values);

    return this.find(result.insertId);
  }

  async getAll() {
    const [rows] = await this.#db.execute('SELECT * FROM users');
    return rows.map((row) => new UserDTO(row));
  }

  async find(id) {
    const [result] = await this.#db.execute('SELECT * FROM users WHERE id = ?', [id]);
    if (result.length === 0) return null;
    return new UserDTO(result[0]);
  }

  async findByUsername(username) {
    const [result] = await this.#db.execute('SELECT * FROM users WHERE username = ?', [username]);
    if (result.length === 0) return null;
    return new UserDTO(result[0]);
  }

  async update(id, user) {
    const columns = Object.keys(user);

    // extraer descriptor y placeholders del mensaje del query
    const descriptor = columns.join(' = ?,').concat(' = ?');
    const values = columns.map((column) => user[column]);

    await this.#db.execute(`UPDATE users SET ${descriptor} WHERE id = ?`, [...values, id]);
    return this.find(id);
  }

  async delete(id) {
    const userToDelete = await this.find(id);
    await this.#db.execute('DELETE FROM users WHERE id = ?', [id]);
    return userToDelete;
  }

  async getAllInactive() {
    const [rows] = await this.#db.execute("SELECT * FROM users WHERE status = 'disabled'");
    return rows.map((row) => new UserDTO(row));
  }
}
