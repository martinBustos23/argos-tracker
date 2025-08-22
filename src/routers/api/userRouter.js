import express from 'express';
import { authToken } from '../../utils.js';

export default function createUserRouter(UserController) {
  const router = express.Router();
  router.use(authToken);

  router.post('/users', async (req, res) => {
    try {
      const user = await UserController.findByID(req.user);
      if (!user.admin) return res.status(401).json({ error: 'No autorizado' });
      const newUser = await UserController.create(req.body);

      console.log('-- Crear usuario --');
      console.log(req.body); //test
      console.table(newUser); //

      res.status(201).json(newUser);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/users', async (req, res) => {
    try {
      
      const user = await UserController.findByID(req.user);
      if (!user.admin) return res.status(401).json({ error: 'No autorizado' });

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
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/users/:uid', async (req, res) => {
    try {
      const user = await UserController.findByID(req.params.uid);

      console.log('-- Encontrar usuario (username) --');
      console.table(user); //test

      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.put('/users/:uid', async (req, res) => {
    try {
      const user = await UserController.findByID(req.user);
      if (!user.admin) return res.status(401).json({ error: 'No autorizado' });
      const updatedUser = await UserController.update(req.params.uid, req.body);

      console.log('-- Actualizar usuario --');
      console.log(req.params.uid);
      console.log(req.body);
      console.table(updatedUser);

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.delete('/users/:uid', async (req, res) => {
    try {
      const user = await UserController.findByID(req.user);
      if (!user.admin) return res.status(401).json({ error: 'No autorizado' });
      const result = await UserController.delete(req.params.uid);

      console.log('-- Eliminar usuario --');
      console.log(req.params.uid);
      console.table(result);

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
