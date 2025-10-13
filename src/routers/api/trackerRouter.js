import express from 'express';
import { authToken, isAdmin } from '../../utils.js';

export default function createTrackerRouter(trackerController, userController) {
  const router = express.Router();
  router.use(authToken);

  router.post('/trackers', isAdmin(userController), async (req, res, next) => {
    try {
      const tracker = await trackerController.create(req.body);

      res.status(201).json(tracker);
    } catch (error) {
      next(error);
    }
  });

  router.get('/trackers', async (req, res, next) => {
    try {
      const trackers = await trackerController.getAll();

      res.status(200).json(trackers);
    } catch (error) {
      next(error);
    }
  });

  router.get('/trackers/:id', async (req, res, next) => {
    try {
      const tracker = await trackerController.find(req.params.id);

      res.status(200).json(tracker);
    } catch (error) {
      next(error);
    }
  });

  router.put('/trackers/:id', isAdmin(userController), async (req, res, next) => {
    try {
      const updatedTracker = await trackerController.update(req.params.id, req.body);

      res.status(200).json(updatedTracker);
    } catch (error) {
      next(error);
    }
  });

  router.delete('/trackers/:id', isAdmin(userController), async (req, res, next) => {
    try {
      const result = await trackerController.disable(req.params.id);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
