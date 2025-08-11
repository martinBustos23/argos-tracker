import bcrypt from 'bcryptjs';
export default class UserModel {
  #dao;
  constructor(dao) {
    this.#dao = dao;
  }

  async createUser(user) {
    const exists = await this.#dao.findByID(user.username);
    if (exists) throw new Error('Usuario ya existe');
    const salt = await bcrypt.genSalt(12); // 12 rondas de sason
    const hash = await bcrypt.hash(user.password, salt);
    user.password = hash; // actualizar la contrasenia para que sea el hash
    return await this.#dao.create(user);
  }

  async findByUsername(username) {
    const user = await this.#dao.findByID(username);
    if (!user) return null;
    return user;
  }

  async updateUser(user) {
    const exists = await this.#dao.findById(user.username);
    if (!exists) throw new Error('Usuario no existe');
    return await this.#dao.update(user);
  }

  async deleteUser(user) {
    const exists = await this.#dao.findById(user.username);
    if (!exists) throw new Error('Usuario no existe');
    return await this.#dao.delete(user.username);
  }

  async getAllUsers() {
    const users = await this.#dao.getAll();
    return users;
  }
}
