import express from 'express';
import { authToken, getUserFromToken } from '../../utils.js';

export default (userController, trackerController) => {
  const router = express.Router();
  router.use(authToken);

  router.get('/', async (req, res) => {
    const token = req.cookies.authorization;
    const username = getUserFromToken(token);
    const trackers = await trackerController.getAll();
    res.render('./dashboard/general', { username, trackers });
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
        if (!users[i].lastLogin) {
          users[i].lastLogin = 'Todavia no logeado';
          continue;
        }
        // converite la hora de UTC a horario argentino (UTC -03:00)
        users[i].lastLogin = new Date(users[i].lastLogin).toLocaleString('es-AR', { hour12: false });
      }
      const token = req.cookies.authorization;
      const username = getUserFromToken(token);
      res.render('./dashboard/users', { username, users });
    } catch (error) {
      next(error);
    }
  });

  return router;
};
