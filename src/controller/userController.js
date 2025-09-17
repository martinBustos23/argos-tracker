import { Conflict, NotFound, BadRequest, Unauthorized, Forbidden, InternalError } from '../utils.js';
import bcrypt from 'bcryptjs';

const FIRST_TIMEOUT_TRIES = 3;
const FIRST_TIMEOUT_MINUTES = 5;
const SECOND_TIMEOUT_TRIES = 5;
const SECOND_TIMEOUT_MINUTES = 10;
const BLOCK_TRIES = 10;

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
      if (exists) throw new Conflict('Usuario ya registrado');
      newUser.password = this.#genPasswordHash(newUser.password); // actualizar la contrasenia para que sea el hash
      const result = await this.#userDAO.create(newUser);
      await this.#userLogController.addRegistration(newUser.username, 'INFO');
      return result;
    } catch (error) {
      await this.#userLogController.addRegistration(newUser.username, 'ERROR');
      if (error.status) throw error;
      throw new InternalError('Error interno creando usuario');
    }
  }

  async getAll() {
    try {
      const users = await this.#userDAO.getAll();
      return users;
    } catch (error) {
      if (error.status) throw error;
      throw new InternalError('Error interno obteniendo usuarios');
    }
  }

  async findByID(username) {
    try {
      const user = await this.#userDAO.findByID(username);
      if (!user) throw new NotFound(`El usuario (${username}) no fue encontrado`);
      return user;
    } catch (error) {
      if (error.status) throw error;
      throw new InternalError('Error interno buscando usuario');
    }
  }

  async update(username, user) {
    try {
      const updatedUser = await this.#userDAO.findByID(username); //probable no const
      if (!updatedUser) throw new NotFound(`El usuario (${username}) no fue encontrado`);

      // si se actualiza la contrasenia hashearla
      if (user.password) user.password = this.#genPasswordHash(user.password);

      const result = await this.#userDAO.update(username, user);
      await this.#userLogController.addUpdate(username, user, 'INFO');
      return result;
    } catch (error) {
      await this.#userLogController.addUpdate(username, user, 'ERROR');
      if (error.status) throw error;
      throw new InternalError('Error interno actualizando usuario');
    }
  }

  async getInactiveUsers() {
    try {
      const users = await this.#userDAO.getAllInactive();
      return users;
    } catch (error) {
      if (error.status) throw error;
      throw new InternalError('Error interno buscando usuarios');
    }
  }

  async delete(username) {
    try {
      const exist = await this.#userDAO.findByID(username); //probable no const

      if (!exist) throw new NotFound(`El usuario (${username}) no fue encontrado`);

      const users = await this.getAll();
      const admins = users.filter(user => user.admin == true);
      if (admins.length <= 1) throw new Unauthorized('No se puede borrar todos los administradores');

      //probable, cambiar estado no elminar? en caso de no eliminar a la hora de crear y verificar si existe tambien comprobar si tiene estado activo...

      const result = await this.#userDAO.delete(username);
      await this.#userLogController.addDeletion(username, 'INFO');
      return result;
    } catch (error) {
      await this.#userLogController.addDeletion(username, 'ERROR');
      if (error.status) throw error;
      throw new InternalError('Error interno eliminando usuario');
    }
  }

  async #timeoutUser(username, minutes) {
    await this.#userDAO.update(username, { active: false});
      
    setTimeout(async () => {
      await this.#userDAO.update(username, { active: true});
    },minutes*60*1000);
  }

  //// ACCESO
  async login(user) {
    try {
      const exist = await this.#userDAO.findByID(user.username);
      if (!exist) throw new NotFound('Usuario no existe');
      if (!exist.active) throw new Unauthorized('Usuario no habilitado');
      
      if (!(await bcrypt.compare(user.password, exist.password))) {
        const logs = await this.#userLogController.getLastNMinutes(5, 'Login');

        if (logs.length >= BLOCK_TRIES && logs.slice(0, BLOCK_TRIES-1).every(log => log.level === 'ERROR')) {
          await this.#userDAO.update(user.username, { active: false});
          throw new Unauthorized(`Ingreso la contraseña incorrecta demasiadas veces, si cuenta se bloqueo`);
        }

        if (logs.length >= SECOND_TIMEOUT_TRIES-1 && logs.slice(0, SECOND_TIMEOUT_TRIES-1).every(log => log.level === 'ERROR')) {
          this.#timeoutUser(user.username, SECOND_TIMEOUT_MINUTES);
          throw new Unauthorized('Contraseña incorrecta, espere 10 minutos para volver a intentarlo');
        }

        if (logs.length >= FIRST_TIMEOUT_TRIES-1 && logs.slice(0, FIRST_TIMEOUT_TRIES-1).every(log => log.level === 'ERROR')) {
          this.#timeoutUser(user.username, FIRST_TIMEOUT_MINUTES);
          throw new Unauthorized('Contraseña incorrecta, espere 5 minutos para volver a intentarlo');
        }

        throw new Unauthorized('Contraseña incorrecta');
      }
      const log = await this.#userLogController.addLogin(user.username, 'INFO');
      // obtener el timestamp del nuevo log, pasarlo a UTF y reemplazar T y Z del string
      const timestamp = new Date(log.timestamp).toISOString().replace(/[A-Z]/g, ' ');
      // actualizar el atributo lastLogin del usuario
      await this.update(user.username, { lastLogin: timestamp });
      return;
    } catch (error) {
      await this.#userLogController.addLogin(user.username, 'ERROR');
      if (error.status) throw error;
      throw new InternalError('Error interno al autenticar usuario');
    }
  }

  async logout(username) {
    try {
      await this.#userLogController.addLogout(username, 'INFO');
    } catch (error) {
      await this.#userLogController.addLogout(username, 'ERROR');
      if (error.status) throw error;
      throw new InternalError('Error interno cerrar sesion');
    }
  }

  async #genPasswordHash(password) {
    const salt = await bcrypt.genSalt(12); // 12 rondas de sason
    const hash = await bcrypt.hash(password, salt);
    return hash;
  }
}

