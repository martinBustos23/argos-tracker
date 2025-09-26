import express from 'express';
import { authToken, isAdmin } from '../../utils.js';

export default function createUserRouter(UserController) {
  const router = express.Router();
  router.use(authToken);

  router.post('/users', isAdmin(UserController), async (req, res, next) => {
    try {
      const newUser = await UserController.create(req.body);

      res.status(201).json(newUser);
    } catch (error) {
      next(error);
    }
  });

  router.get('/users', async (req, res, next) => {
    try {
      // obtener usuarios inactivos
      const active = req.query.active === 'true'; // convertir a bool
      if (!active) {
        const users = await UserController.getAllInactive();
        return res.status(200).json(users);
      }

      const users = await UserController.getAll();

      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  });

  router.get('/users/:uid', async (req, res, next) => {
    try {
      const user = await UserController.find(req.params.uid);

      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  });

  router.put('/users/:uid', isAdmin(UserController), async (req, res, next) => {
    try {
      const updatedUser = await UserController.update(req.params.uid, req.body);

      res.status(200).json(updatedUser);
    } catch (error) {
      next(error);
    }
  });

  router.delete('/users/:uid', isAdmin(UserController), async (req, res, next) => {
    try {
      const result = await UserController.disable(req.params.uid);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
