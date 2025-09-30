import {
  Conflict,
  NotFound,
  BadRequest,
  Unauthorized,
  Forbidden,
  InternalError,
} from '../../utils.js';
import bcrypt from 'bcryptjs';
import config from '../../config/config.js';
import { LEVEL, USER_ACTIONS, USER_TRIES } from '../../config/constants.js';

export default class UserController {
  #userDAO;
  #userLogController;
  constructor(userDAO, userLogController) {
    this.#userDAO = userDAO;
    this.#userLogController = userLogController;
  }

  async create(newUser) {
    try {
      const exists = await this.#userDAO.find(newUser.username);
      if (exists) throw new Conflict('Usuario ya registrado');

      newUser.password = await this.#genPasswordHash(newUser.password); // actualizar la contrasenia para que sea el hash

      const result = await this.#userDAO.create(newUser);
      await this.#userLogController.addLog(
        LEVEL.INFO,
        newUser.id,
        USER_ACTIONS.CREATE,
        'Se creo el usuario'
      );
      return result;
    } catch (error) {
      await this.#userLogController.addLog(
        LEVEL.ERROR,
        newUser.id,
        USER_ACTIONS.DELETE,
        'Error al crear el usuario'
      );
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

  async find(id) {
    try {
      const user = await this.#userDAO.find(id);
      if (!user) throw new NotFound(`El usuario (${id}) no fue encontrado`);
      return user;
    } catch (error) {
      if (error.status) throw error;
      throw new InternalError('Error interno buscando usuario');
    }
  }

  async update(id, user) {
    try {
      const updatedUser = await this.#userDAO.find(id);
      if (!updatedUser) throw new NotFound(`El usuario (${id}) no fue encontrado`);

      // si se actualiza la contrasenia hashearla
      if (user.password) user.password = await this.#genPasswordHash(user.password);

      const result = await this.#userDAO.update(id, user);
      await this.#userLogController.addLog(
        LEVEL.INFO,
        id,
        USER_ACTIONS.UPDATE,
        'Se actualizo el usuario'
      );
      return result;
    } catch (error) {
      await this.#userLogController.addLog(
        LEVEL.ERROR,
        id,
        USER_ACTIONS.UPDATE,
        'Erro al actualizar el usuario'
      );
      if (error.status) throw error;
      throw new InternalError('Error interno actualizando usuario');
    }
  }

  async getAllInactive() {
    try {
      const users = await this.#userDAO.getAllInactive();
      return users;
    } catch (error) {
      if (error.status) throw error;
      throw new InternalError('Error interno buscando usuarios');
    }
  }

  async disable(id) {
    try {
      const exist = await this.#userDAO.find(id);
      if (!exist) throw new NotFound(`El usuario (${id}) no fue encontrado`);

      const result = await this.update(id, { active: false });
      await this.#userLogController.addLog(
        LEVEL.INFO,
        id,
        USER_ACTIONS.DISABLED,
        'Se deshabilito usuario'
      );
      return result;
    } catch (error) {
      await this.#userLogController.addLog(
        LEVEL.ERROR,
        id,
        USER_ACTIONS.DISABLED,
        'Error al deshabilito usuario'
      );
      if (error.status) throw error;
      throw new InternalError('Error interno desabilitando usuario');
    }
  }

  async delete(id) {
    try {
      const exist = await this.#userDAO.find(id);

      if (!exist) throw new NotFound(`El usuario (${id}) no fue encontrado`);

      const users = await this.getAll();
      const admins = users.filter((user) => user.admin == true);
      if (admins.length <= 1)
        throw new Unauthorized('No se puede borrar todos los administradores');

      const result = await this.#userDAO.delete(id);
      await this.#userLogController.addLog(
        LEVEL.INFO,
        id,
        USER_ACTIONS.DELETE,
        'Se elimino usuario'
      );
      return result;
    } catch (error) {
      await this.#userLogController.addLog(
        LEVEL.ERROR,
        id,
        USER_ACTIONS.DELETE,
        'Error al eliminar usuario'
      );
      if (error.status) throw error;
      throw new InternalError('Error interno eliminando usuario');
    }
  }

  async login(user) {
    try {
      const exist = await this.#userDAO.find(user.username);
      if (!exist) throw new NotFound('Usuario no existe');
      if (!exist.active) throw new Unauthorized('Usuario no habilitado');

      if (exist.timeout && Date.now() >= exist.timeout) {
        // si tiene timeout y el mismo termino
        this.#userDAO.update(exist.id, { timeout: null });
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
          loginLogs.length >= USER_TRIES.BLOCK_TRIES &&
          lastTimeout.length == 2 &&
          loginLogs.slice(0, USER_TRIES.BLOCK_TRIES).every((log) => log.level === 'ERROR')
        ) {
          this.#blockUser(user.username);
          throw new Unauthorized(
            `Ingreso la contraseña incorrecta demasiadas veces, si cuenta se bloqueo`
          );
        }

        if (
          loginLogs.length >= USER_TRIES.SECOND_TIMEOUT_TRIES &&
          lastTimeout.length == 1 &&
          loginLogs.slice(0, USER_TRIES.SECOND_TIMEOUT_TRIES).every((log) => log.level === 'ERROR')
        ) {
          this.#timeoutUser(user.username, USER_TRIES.SECOND_TIMEOUT_MINUTES);
          throw new Unauthorized(
            `Ingreso la contraseña incorrecta demasiadas veces, su cuenta se bloqueo`
          );
        }

        if (
          loginLogs.length >= USER_TRIES.FIRST_TIMEOUT_TRIES &&
          lastTimeout.length == 0 &&
          loginLogs.slice(0, USER_TRIES.FIRST_TIMEOUT_TRIES).every((log) => log.level === 'ERROR')
        ) {
          this.#timeoutUser(user.username, USER_TRIES.FIRST_TIMEOUT_MINUTES);
          throw new Unauthorized(
            'Contraseña incorrecta, espere 5 minutos para volver a intentarlo'
          );
        }

        throw new Unauthorized('Contraseña incorrecta');
      }
      const log = await this.#userLogController.addLog(
        LEVEL.INFO,
        exist.id,
        USER_ACTIONS.LOGIN,
        'Inicio de sesion con exito'
      );
      // obtener el timestamp del nuevo log, pasarlo a UTF y reemplazar T y Z del string
      const timestamp = new Date(log.timestamp).toISOString().replace(/[A-Z]/g, ' ');
      // actualizar el atributo lastLogin del usuario
      await this.update(exist.id, { lastLogin: timestamp });
      return;
    } catch (error) {
      await this.#userLogController.addLog(
        LEVEL.ERROR,
        exist.id,
        USER_ACTIONS.LOGIN,
        'Error al iniciar sesion'
      );
      if (error.status) throw error;
      throw new InternalError('Error interno al autenticar usuario');
    }
  }

  async logout(id) {
    try {
      await this.#userLogController.addLog(
        LEVEL.INFO,
        id,
        USER_ACTIONS.LOGOUT,
        'Cerrar sesion con exito'
      );
    } catch (error) {
      await this.#userLogController.addLog(
        LEVEL.ERROR,
        id,
        USER_ACTIONS.LOGOUT,
        'Error al cerrar sesion'
      );
      if (error.status) throw error;
      throw new InternalError('Error interno cerrar sesion');
    }
  }

  async #genPasswordHash(password) {
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  }

  async #timeoutUser(id, minutes) {
    const timeout = new Date(Date.now() + minutes * 60 * 1000).toISOString().replace(/[A-Z]/g, ' ');
    await this.#userDAO.update(id, { timeout });
    this.#userLogController.addTimeout(id, minutes);
  }

  async #blockUser(id) {
    await this.#userDAO.update(id, { active: false });
    await this.#userLogController.addLog(
      LEVEL.INFO,
      system,
      USER_ACTIONS.BLOCK,
      `Se bloque el usuario: ${id}`
    ); //esta bien esto?
  }
}
