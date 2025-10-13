import {
  Conflict,
  NotFound,
  BadRequest,
  Unauthorized,
  Forbidden,
  InternalError,
  validatePassword,
} from '../../utils.js';
import bcrypt from 'bcryptjs';
import config from '../../config/config.js';
import { LEVEL, USER_ACTIONS, USER_TRIES } from '../../config/constants.js';
import UserDTO from '../../dto/userDTO.js';

export default class UserController {
  #userDAO;
  #userLogController;
  constructor(userDAO, userLogController) {
    this.#userDAO = userDAO;
    this.#userLogController = userLogController;
  }

  async create(newUser) {
    try {
      if (Object.getOwnPropertyNames(newUser).length === 0)
        throw new BadRequest('Faltan parametros');
      const exists = await this.#userDAO.findByUsername(newUser.username);
      if (exists) throw new Conflict('Usuario ya registrado');

      if (!validatePassword(newUser.password))
        throw new BadRequest('La contraseña es demasiado corta, o no posee mayusculas, minusculas o numeros');
      newUser.password = await this.#genPasswordHash(newUser.password); // actualizar la contrasenia para que sea el hash

      const result = await this.#userDAO.create(new UserDTO(newUser));
      await this.#userLogController.addLog(
        LEVEL.INFO,
        result.id,
        USER_ACTIONS.CREATE,
        'Se creo el usuario'
      );
      return result;
    } catch (error) {
      await this.#userLogController.addLog(
        LEVEL.ERROR,
        1,
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

  async findByUsername(username) {
    try {
      const user = await this.#userDAO.findByUsername(username);
      if (!user) throw new NotFound(`El usuario (${username}) no fue encontrado`);
      return user;
    } catch (error) {
      if (error.status) throw error;
      throw new InternalError('Error interno buscando usuario');
    }
  }

  async update(originUid, mods, destinationUid=originUid) {
    try {
      const updatingUser = await this.#userDAO.find(originUid);
      if (!updatingUser) throw new NotFound(`El usuario (${originUid}) no fue encontrado`);
      const updatedUser = destinationUid == originUid ? updatingUser : await this.#userDAO.find(destinationUid);
      if (!updatedUser) throw new NotFound(`El usuario (${destinationUid}) no fue encontrado`);
      if (!updatingUser.admin && (updatingUser.id != destinationUid))
        throw new Unauthorized('No estas autorizado');
      if (Object.keys(mods).length == 0) throw new BadRequest('Faltan parametros');

      // si se actualiza la contrasenia hashearla
      if (mods.password) {
        if (!validatePassword(mods.password)) 
          throw new BadRequest('La contraseña es demasiado corta, o no posee masculas, minusculas o numeros');
        // si es forzado a cambiar la contrasenia, cambiar su estado a activo
        if (updatedUser.status === 'pwd_change')
          mods.status = 'active';
        mods.password = await this.#genPasswordHash(mods.password);
      }

      // si el usuario esta bloqueado y se lo quiere activar, forzarlo a cambiar la contrasenia
      if (updatedUser.status === 'blocked' && mods.status === 'active') 
        mods.status = 'pwd_change';

      const result = await this.#userDAO.update(destinationUid, new UserDTO(mods));
      await this.#userLogController.addLog(
        LEVEL.INFO,
        destinationUid,
        USER_ACTIONS.UPDATE,
        'Se actualizo el usuario'
      );
      return result;
    } catch (error) {
      await this.#userLogController.addLog(
        LEVEL.ERROR,
        destinationUid,
        USER_ACTIONS.UPDATE,
        'Error al actualizar el usuario'
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

  async disable(originUid, destinationUid = originUid) {
    try {
      const updatingUser = await this.#userDAO.find(originUid);
      if (!updatingUser.admin && (updatingUser.id != destinationUid))
        throw new Unauthorized('No estas autorizado');
      const exist = await this.#userDAO.find(destinationUid);
      if (!exist) throw new NotFound(`El usuario (${destinationUid}) no fue encontrado`);

      const result = await this.update(destinationUid, { status: 'disabled' });
      await this.#userLogController.addLog(
        LEVEL.INFO,
        destinationUid,
        USER_ACTIONS.DISABLED,
        'Se deshabilito usuario'
      );
      return result;
    } catch (error) {
      await this.#userLogController.addLog(
        LEVEL.ERROR,
        destinationUid,
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
    let exist;
    try {
      exist = await this.#userDAO.findByUsername(user.username);
      if (!exist) throw new NotFound('Usuario no existe');
      if (exist.status === 'disabled' || exist.status === 'blocked')
        throw new Unauthorized('Usuario no habilitado');

      const localNow = new Date();
      const utcNow = localNow.getTime() + localNow.getTimezoneOffset() * 60000;
      if (exist.timeout && utcNow >= exist.timeout.getTime()) {
        // si tiene timeout y el mismo termino
        this.#userDAO.update(exist.id, { timeout: null });
      } else if (exist.timeout) {
        throw new Unauthorized(
          'Esperar ' +
            Math.floor((exist.timeout.getTime() - utcNow) / 1000 / 60) +
            ' minutos'
        );
      }

      if (!(await bcrypt.compare(user.password, exist.password))) {
        const lastLogin = await this.#userLogController.findLastWhere({
          source: exist.id,
          action: USER_ACTIONS.LOGIN,
          level: LEVEL.INFO,
        });
        // obtener todos los logs desde su ultimo inicio de sesion, si no existe, obtener todos los logs
        const logsSinceLastLogin = await this.#userLogController.getAllSince(1 || lastLogin.id);
        // todos los intentos de login del usuario desde la ultima vez que inicio sesion
        const loginTries = logsSinceLastLogin.filter((log) => log.source === exist.id && log.action === USER_ACTIONS.LOGIN);
        // cantidad de timeouts de usuario desde la ultima vez que inicio sesion
        const timeouts = logsSinceLastLogin.filter((log) => log.source === exist.id && log.action === USER_ACTIONS.DISABLED).length;

        if (
          loginTries.length >= USER_TRIES.BLOCK_TRIES &&
          timeouts == 2 &&
          loginTries.slice(0, USER_TRIES.BLOCK_TRIES).every((log) => log.level === LEVEL.ERROR)
        ) {
          this.#blockUser(exist.id);
          throw new Unauthorized(
            `Ingreso la contraseña incorrecta demasiadas veces, si cuenta se bloqueo`
          );
        }

        if (
          loginTries.length >= USER_TRIES.SECOND_TIMEOUT_TRIES &&
          timeouts == 1 &&
          loginTries
            .slice(0, USER_TRIES.SECOND_TIMEOUT_TRIES)
            .every((log) => log.level === LEVEL.ERROR)
        ) {
          this.#timeoutUser(exist.id, USER_TRIES.SECOND_TIMEOUT_MINUTES);
          throw new Unauthorized(
            `Contraseña incorrecta, espere ${USER_TRIES.SECOND_TIMEOUT_MINUTES} minutos para volver a intentarlo`
          );
        }

        if (
          loginTries.length >= USER_TRIES.FIRST_TIMEOUT_TRIES &&
          timeouts == 0 &&
          loginTries
            .slice(0, USER_TRIES.FIRST_TIMEOUT_TRIES)
            .every((log) => log.level === LEVEL.ERROR)
        ) {
          this.#timeoutUser(exist.id, USER_TRIES.FIRST_TIMEOUT_MINUTES);
          throw new Unauthorized(
            `Contraseña incorrecta, espere ${USER_TRIES.FIRST_TIMEOUT_MINUTES} minutos para volver a intentarlo`
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
      const timestamp = log.timestamp.toISOString().replace(/[A-Z]/g, ' ');
      // actualizar el atributo lastLogin del usuario
      await this.update(exist.id, { lastLogin: timestamp });
      return exist;
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
    await this.#userDAO.update(id, new UserDTO({ timeout }));
    await this.#userLogController.addLog(
      LEVEL.INFO,
      id,
      USER_ACTIONS.DISABLED,
      `Usuario deshabilitado ${minutes} minutos`
    );
    // this.#userLogController.addTimeout(id, minutes);
  }

  async #blockUser(id) {
    await this.#userDAO.update(id, { status: 'blocked' });
    await this.#userLogController.addLog(
      LEVEL.INFO,
      id,
      USER_ACTIONS.BLOCK,
      `Se bloqueo el usuario: ${id}`
    ); //esta bien esto?
  }
}
