import express from 'express';
import { authToken, getUserFromToken } from '../../utils.js';

export default (userController) => {
  const router = express.Router();
  router.use(authToken);

  router.get('/', (req, res) => {
    const token = req.cookies.authorization;
    const username = getUserFromToken(token);
    res.render('./dashboard/general', { username });
  });

  router.get('/devices', (req, res) => {
    const token = req.cookies.authorization;
    const username = getUserFromToken(token);
    res.render('./dashboard/devices', { username });
  });

  router.get('/config', (req, res) => {
    const token = req.cookies.authorization;
    const username = getUserFromToken(token);
    res.render('./dashboard/config', { username });
  });

  router.get('/users', async (req, res) => {
    try {
      const users = await userController.getAll();
      // convertir timestamp a utc-3
      for (let i = 0; i < users.length; i++) {
        users[i].lastLogin = new Date(users[i].lastLogin + ' UTC').toLocaleString('es-AR', { hour12: false });
      }
      const token = req.cookies.authorization;
      const username = getUserFromToken(token);
      res.render('./dashboard/users', { username, users });
    } catch (error) {
      res.status(500).send('Error al obtener usuarios' + error.message);
    }
  });

  return router;
};
