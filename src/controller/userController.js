import { Exception, NotFound } from '../utils.js';

export default class UserController {
  constructor(userModel) {
    this.userModel = userModel;
  }

  async create(newUser) {
    try {
      const user = await this.userModel.findByUsername(newUser.username);

      if (user) {
        throw new Exception(`Error usuario ya registrado`, 404);
      }

      await this.userModel.createUser(newUser);

      return newUser;
    } catch (error) {
      throw new Exception(`Error creando usuario: ${error.message}`, 500);
    }
  }

  async getAll() {
    const users = await this.userModel.getAllUsers();
    return users;
  }

  async findByID(username) {
    const user = await this.userModel.findByUsername(username);
    if (!user) {
      throw new NotFound(`El usuario (${username}) no fue encontrado`);
    }
    return user;
  }

  async update(username, user) {
    try {
      const updatedUser = await this.userModel.findByUsername(username); //probable no const

      if (!updatedUser) {
        throw new NotFound(`El usuario (${username}) no fue encontrado`);
      }

      //validar datos user?

      updatedUser = await this.userModel.updateUser(username, user);

      return updatedUser;
    } catch (error) {
      throw new Exception(`Error actualizando el usuario: ${error.message}`, 500);
    }
  }

  async delete(username) {
    try {
      const exist = await this.userModel.findByID(username); //probable no const

      if (!exist) {
        throw new NotFound(`El usuario (${username}) no fue encontrado`);
      }

      //probable, cambiar estado no elminar? en caso de no eliminar a la hora de crear y verificar si existe tambien comprobar si tiene estado activo...

      const result = await this.userModel.deleteUser(username);

      return result;
    } catch (error) {
      throw new Exception(`Error eliminando el usuario: ${error.message}`, 500);
    }
  }

  //// ACCESO

  async login(user) {
    try {
      const exist = await this.userModel.findByUsername(user.username);

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
      await this.userModel.createUser(newUser);
      return newUser;
    } catch (error) {
      throw new Exception(`Error al registrarse: ${error.message}`, 500);
    }
  }
}
