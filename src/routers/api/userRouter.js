import express from 'express';
import bcrypt from 'bcryptjs';
import { authToken, isAdmin, getUserIdFromToken } from '../../utils.js';

export default function createUserRouter(UserController) {
  const router = express.Router();
  router.use((req, res, next) => authToken(req, res, next, UserController));

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

  router.patch('/users/:uid', async (req, res, next) => {
    const token = req.cookies.authorization;
    try {
      let originUid = token ? getUserIdFromToken(token) : req.params.uid;

      if (!token) {
        // si no hay token, entonces debemos validar el usuario con una contrasenia
        console.log(req.body);
        const user = await UserController.find(originUid);
        if (!(await bcrypt.compare(req.body.password, user.password)))
          return res.status(404).json({ message: 'Su contrasenia actual no es correcta' });
        req.body.password = req.body.newPassword;
      }

      const updatedUser = await UserController.update(originUid, req.body, req.params.uid);

      res.status(200).json(updatedUser);
    } catch (error) {
      next(error);
    }
  });

  router.delete('/users/:uid', async (req, res, next) => {
    const token = req.cookies.authorization;
    try {
      const originUid = getUserIdFromToken(token);
      const result = await UserController.disable(originUid, req.params.uid);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
