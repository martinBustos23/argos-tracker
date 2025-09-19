import express from 'express';
import { authToken } from '../../utils.js';

export default function createTrackerRouter(trackerController, userController) {
  const router = express.Router();
  router.use(authToken);

  router.post('/trackers', async (req, res, next) => {
    try {
      // console.log(Object.getOwnPropertyNames(req.body));
      const user = await userController.findByID(req.user);
      if (!user.admin) return res.status(401).json({ error: 'No autorizado' });
      const tracker = await trackerController.createTracker(req.body);

      console.log('-- Crear tracker --');
      console.table(tracker); //

      res.status(201).json(tracker);
    } catch (error) {
      next(error);
    }
  });

  router.get('/trackers', async (req, res, next) => {
    try {
      const trackers = await trackerController.getAll();

      console.log('-- Encontrar tracker/s --');
      console.table(trackers); //test

      res.status(200).json(trackers);
    } catch (error) {
      next(error);
    }
  });

  router.get('/trackers/:id', async (req, res, next) => {
    try {
      const tracker = await trackerController.findByID(req.params.id);

      console.log('-- Encontrar traker (id) --');
      console.table(tracker); //test

      res.status(200).json(tracker);
    } catch (error) {
      next(error);
    }
  });

  router.put('/trackers/:id', async (req, res, next) => {
    try {
      const user = await userController.findByID(req.user);
      if (!user.admin) return res.status(401).json({ error: 'No autorizado' });
      const updatedTracker = await trackerController.updateTracker(req.params.id, req.body);

      console.log('-- Actualizar tracker --');
      console.log(req.params.id);
      console.log(req.body);
      console.table(updatedTracker);

      res.status(200).json(updatedTracker);
    } catch (error) {
      next(error);
    }
  });

  router.delete('/trackers/:id', async (req, res, next) => {
    try {
      const user = await userController.findByID(req.user);
      if (!user.admin) return res.status(401).json({ error: 'No autorizado' });
      const result = await trackerController.disable(req.params.id);

      console.log('-- Deshabilitar tracker --');
      console.table(result);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
