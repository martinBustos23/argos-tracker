import { Exception, NotFound } from '../utils.js';
import bcrypt from 'bcryptjs';

export default class UserController {
  #userDAO;
  constructor(userDAO) {
    this.#userDAO = userDAO;
  }

  async create(newUser) {
    try {
      const exists = await this.#userDAO.findByID(newUser.username);
      if (exists)
        throw new Exception(`Error usuario ya registrado`, 404);
      const salt = await bcrypt.genSalt(12); // 12 rondas de sason
      const hash = await bcrypt.hash(user.password, salt);
      user.password = hash; // actualizar la contrasenia para que sea el hash
      return this.#userDAO.create(newUser);
    } catch (error) {
      throw new Exception(`Error creando usuario: ${error.message}`, 500);
    }
  }

  async getAll() {
    const users = await this.#userDAO.getAll();
    return users;
  }

  async findByID(username) {
    const user = await this.#userDAO.findByID(username);
    if (!user)
      throw new NotFound(`El usuario (${username}) no fue encontrado`);
    return user;
  }

  async update(username, user) {
    try {
      const updatedUser = await this.#userDAO.findByID(username); //probable no const

      if (!updatedUser)
        throw new NotFound(`El usuario (${username}) no fue encontrado`);

      //validar datos user?

      updatedUser = await this.#userDAO.update(username, user);

      return updatedUser;
    } catch (error) {
      throw new Exception(`Error actualizando el usuario: ${error.message}`, 500);
    }
  }

  async delete(username) {
    try {
      const exist = await this.#userDAO.findByID(username); //probable no const

      if (!exist)
        throw new NotFound(`El usuario (${username}) no fue encontrado`);

      //probable, cambiar estado no elminar? en caso de no eliminar a la hora de crear y verificar si existe tambien comprobar si tiene estado activo...

      const result = await this.#userDAO.delete(username);

      return result;
    } catch (error) {
      throw new Exception(`Error eliminando el usuario: ${error.message}`, 500);
    }
  }

  //// ACCESO

  async login(user) {
    try {
      const exist = await this.#userDAO.findByID(user.username);

      if (!exist) throw new Exception('Usuario no existe', 404);
      if (!(await bcrypt.compare(user.password, exist.password)))
        throw new Exception(`Contraseña incorrecta`, 404);
      return;
    } catch (error) {
      throw new Exception(`Error al ingresar: ${error.message}`, 500);
    }
  }
}
