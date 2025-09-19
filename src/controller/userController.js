import {
  Conflict,
  NotFound,
  BadRequest,
  Unauthorized,
  Forbidden,
  InternalError,
} from '../utils.js';
import bcrypt from 'bcryptjs';
import config from '../config/config.js';

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

  async disable(username) {
    try {
      const exist = await this.#userDAO.findByID(username);
      if (!exist) throw new NotFound(`El usuario (${username}) no fue encontrado`);

      const result = await this.update(username, { active: false });
      await this.#userLogController.addDisable(username, 'INFO');
      return result;
    } catch (error) {
      await this.#userLogController.addDisable(username, 'ERROR');
      if (error.status) throw error;
      throw new InternalError('Error interno desabilitando usuario');
    }
  }

  async delete(username) {
    try {
      const exist = await this.#userDAO.findByID(username); //probable no const

      if (!exist) throw new NotFound(`El usuario (${username}) no fue encontrado`);

      const users = await this.getAll();
      const admins = users.filter((user) => user.admin == true);
      if (admins.length <= 1)
        throw new Unauthorized('No se puede borrar todos los administradores');

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
    const timeout = new Date(Date.now() + minutes * 60 * 1000).toISOString().replace(/[A-Z]/g, ' ');
    await this.#userDAO.update(username, { timeout });
    this.#userLogController.addTimeout(username, minutes);
  }

  async #blockUser(username) {
    await this.#userDAO.update(username, { active: false });
    this.#userLogController.addBlock(username);
  }

  //// ACCESO
  async login(user) {
    try {
      const exist = await this.#userDAO.findByID(user.username);
      if (!exist) throw new NotFound('Usuario no existe');
      if (!exist.active) throw new Unauthorized('Usuario no habilitado');
      if (exist.timeout && Date.now() >= exist.timeout) {
        // si tiene timeout y el mismo termino
        this.#userDAO.update(exist.username, { timeout: null });
      } else if (exist.timeout) {
        throw new Unauthorized('Esperar');
      }

      if (!(await bcrypt.compare(user.password, exist.password))) {
        const loginLogs = await this.#userLogController
          .getLastNMinutes(10, 'Login')
          .then((result) => {
            return result.filter((log) => log.source == user.username);
          });
          

        const lastTimeout = await this.#userLogController
          .getLastNMinutes(10, 'Disable')
          .then((result) => {
            return result.filter((log) => log.source == user.username);
          });

        if (
          loginLogs.length >= config.BLOCK_TRIES &&
          lastTimeout.length == 2 &&
          loginLogs.slice(0, config.BLOCK_TRIES).every((log) => log.level === 'ERROR')
        ) {
          this.#blockUser(user.username);
          throw new Unauthorized(
            `Ingreso la contraseña incorrecta demasiadas veces, si cuenta se bloqueo`
          );
        }

        if (
          loginLogs.length >= config.SECOND_TIMEOUT_TRIES &&
          lastTimeout.length == 1 &&
          loginLogs.slice(0, config.SECOND_TIMEOUT_TRIES).every((log) => log.level === 'ERROR')
        ) {
          this.#timeoutUser(user.username, config.SECOND_TIMEOUT_MINUTES);
          throw new Unauthorized(
            `Ingreso la contraseña incorrecta demasiadas veces, su cuenta se bloqueo`
          );
        }

        if (
          loginLogs.length >= config.FIRST_TIMEOUT_TRIES &&
          lastTimeout.length == 0 &&
          loginLogs.slice(0, config.FIRST_TIMEOUT_TRIES).every((log) => log.level === 'ERROR')
        ) {
          this.#timeoutUser(user.username, config.FIRST_TIMEOUT_MINUTES);
          throw new Unauthorized(
            'Contraseña incorrecta, espere 5 minutos para volver a intentarlo'
          );
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
