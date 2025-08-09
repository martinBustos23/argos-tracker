import express from 'express';

export default (userController) => {
  const router = express.Router();

  router.get('/', (req, res) => {
    res.render('./dashboard/general');
  });

  router.get('/devices', (req, res) => {
    res.render('./dashboard/devices');
  });

  router.get('/config', (req, res) => {
    res.render('./dashboard/config');
  });

  router.get('/users', async (req, res) => {
    try {
      const users = await userController.getAll();
      res.render('./dashboard/users', { users });
    } catch (error) {
      res.status(500).send('Error al obtener usuarios');
    }
  });

  return router;
};
