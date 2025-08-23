import { Exception, NotFound } from '../utils.js';
import bcrypt from 'bcryptjs';

export default class UserController {
  #userDAO;
  #userLogController;
  constructor(userDAO, userLogController) {
    this.#userDAO = userDAO;
    this.#userLogController = userLogController;
  }

  async create(newUser) {
    try {
      const exists = await this.#userDAO.findByID(newUser.username);
      if (exists) throw new Exception(`Error usuario ya registrado`, 404);
      const salt = await bcrypt.genSalt(12); // 12 rondas de sason
      const hash = await bcrypt.hash(newUser.password, salt);
      newUser.password = hash; // actualizar la contrasenia para que sea el hash
      const result = await this.#userDAO.create(newUser);
      await this.#userLogController.addRegistration(newUser.username, 'INFO');
      return result;
    } catch (error) {
      await this.#userLogController.addRegistration(newUser.username, 'ERROR');
      throw new Exception(`Error creando usuario: ${error.message}`, 500);
    }
  }

  async getAll() {
    const users = await this.#userDAO.getAll();
    return users;
  }

  async findByID(username) {
    const user = await this.#userDAO.findByID(username);
    if (!user) throw new NotFound(`El usuario (${username}) no fue encontrado`);
    return user;
  }

  async update(username, user) {
    try {
      const updatedUser = await this.#userDAO.findByID(username); //probable no const

      if (!updatedUser) throw new NotFound(`El usuario (${username}) no fue encontrado`);

      // si se actualiza la contrasenia hashearla
      if (user.password) {
        const salt = await bcrypt.genSalt(12); // 12 rondas de sason
        const hash = await bcrypt.hash(user.password, salt);
        user.password = hash; // actualizar la contrasenia para que sea el hash
      }
      const result = await this.#userDAO.update(username, user);
      await this.#userLogController.addUpdate(username, user, 'INFO');
      return result;
    } catch (error) {
      await this.#userLogController.addUpdate(username, user, 'ERROR');
      throw new Exception(`Error actualizando el usuario: ${error.message}`, 500);
    }
  }

  async getInactiveUsers() {
    try {
      const users = await this.#userDAO.getAllInactive();
      return users;
    } catch (error) {
      throw new Exception(`Error buscando usuarios: ${error.message}`, 500);
    }
  }

  async delete(username) {
    try {
      const exist = await this.#userDAO.findByID(username); //probable no const

      if (!exist) throw new NotFound(`El usuario (${username}) no fue encontrado`);
      if (exist.admin) throw new Exception('No se puede borrar a administrador');

      //probable, cambiar estado no elminar? en caso de no eliminar a la hora de crear y verificar si existe tambien comprobar si tiene estado activo...

      const result = await this.#userDAO.delete(username);
      await this.#userLogController.addDeletion(username, 'INFO');
      return result;
    } catch (error) {
      await this.#userLogController.addDeletion(username, 'ERROR');
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
      await this.#userLogController.addLogin(user.username, 'INFO');
      return;
    } catch (error) {
      await this.#userLogController.addLogin(user.username, 'ERROR');
      throw new Exception(`Error al ingresar: ${error.message}`, 500);
    }
  }

  async logout(username) {
    try {
      await this.#userLogController.addLogout(username, 'INFO');
    } catch (error) {
      await this.#userLogController.addLogout(username, 'ERROR');
      throw new Exception(`Error al cerrar sesion: ${error.message}`, 500);
    }
  }
}
