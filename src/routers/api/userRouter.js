import express from 'express';
import {
  authToken,
  NotFound,
  BadRequest,
  Unauthorized,
  Forbidden,
  InternalError,
} from '../../utils.js';

export default function createUserRouter(UserController) {
  const router = express.Router();
  router.use(authToken);

  router.post('/users', async (req, res, next) => {
    try {
      const user = await UserController.find(req.user);
      if (!user.admin) throw new Unauthorized('No autorizado');
      const newUser = await UserController.create(req.body);

      console.log('-- Crear usuario --');
      console.log(req.body); //test
      console.table(newUser); //

      res.status(201).json(newUser);
    } catch (error) {
      next(error);
    }
  });

  router.get('/users', async (req, res, next) => {
    try {
      const user = await UserController.find(req.user);
      if (!user.admin) throw new Unauthorized('No autorizado');

      // obtener usuarios inactivos
      const active = req.query.active === 'true'; // convertir a bool
      if (!active) {
        const users = await UserController.getInactiveUsers();
        console.log('-- Encontrar usuario/s inactivos --');
        console.table(users); //test
        return res.status(200).json(users);
      }

      const users = await UserController.getAll();

      console.log('-- Encontrar usuario/s --');
      console.table(users); //test

      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  });

  router.get('/users/:uid', async (req, res, next) => {
    try {
      const user = await UserController.find(req.params.uid);

      console.log('-- Encontrar usuario (username) --');
      console.table(user); //test

      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  });

  router.put('/users/:uid', async (req, res, next) => {
    try {
      const user = await UserController.find(req.user);
      if (!user.admin) throw new Unauthorized('No autorizado');
      const updatedUser = await UserController.update(req.params.uid, req.body);

      console.log('-- Actualizar usuario --');
      console.log(req.params.uid);
      console.log(req.body);
      console.table(updatedUser);

      res.status(200).json(updatedUser);
    } catch (error) {
      next(error);
    }
  });

  router.delete('/users/:uid', async (req, res, next) => {
    try {
      const user = await UserController.find(req.user);
      if (!user.admin) throw new Unauthorized('No autorizado');
      const result = await UserController.disable(req.params.uid);

      console.log('-- Deshabilitar usuario --');
      console.log(req.params.uid);
      console.table(result);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
