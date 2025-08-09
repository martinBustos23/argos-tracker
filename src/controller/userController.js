import { Exception, NotFound } from '../utils.js';

export default class UserController {
  constructor(userDao) {
    this.userDao = userDao;
  }

  async create(newUser) {
    try {
      const user = await this.userDao.findByID(newUser.username);

      if (user) {
        throw new Exception(`Error usuario ya registrado`, 404);
      }

      await this.userDao.create(newUser);

      return newUser;
    } catch (error) {
      throw new Exception(`Error creando usuario: ${error.message}`, 500);
    }
  }

  async getAll() {
    const users = await this.userDao.getAll();
    return users;
  }

  async findByID(username) {
    const user = await this.userDao.findByID(username);
    if (!user) {
      throw new NotFound(`El usuario (${username}) no fue encontrado`);
    }
    return user;
  }

  async update(username, user) {
    try {
      const updatedUser = await this.userDao.findByID(username); //probable no const

      if (!updatedUser) {
        throw new NotFound(`El usuario (${username}) no fue encontrado`);
      }

      //validar datos user?

      updatedUser = await this.userDao.update(username, user);

      return updatedUser;
    } catch (error) {
      throw new Exception(`Error actualizando el usuario: ${error.message}`, 500);
    }
  }

  async delete(username) {
    try {
      const exist = await this.userDao.findByID(username); //probable no const

      if (!exist) {
        throw new NotFound(`El usuario (${username}) no fue encontrado`);
      }

      //probable, cambiar estado no elminar? en caso de no eliminar a la hora de crear y verificar si existe tambien comprobar si tiene estado activo...

      const result = await this.userDao.delete(username);

      return result;
    } catch (error) {
      throw new Exception(`Error eliminando el usuario: ${error.message}`, 500);
    }
  }

  //// ACCESO

  async login(user) {
    try {
      const exist = await this.userDao.findByID(user.username);

      if (!exist || user.password !== exist.password)
        throw new Exception(`Usuario o contraseña incorrectos`, 404);

      return;
    } catch (error) {
      throw new Exception(`Error al ingresar: ${error.message}`, 500);
    }
  }

  async register(newUser) {
    //probable no exista :)
    try {
      await this.userDao.create(newUser);
      return newUser;
    } catch (error) {
      throw new Exception(`Error al registrarse: ${error.message}`, 500);
    }
  }
}
