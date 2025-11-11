import express from 'express';
import { authToken, BadRequest, Conflict, NotFound, broadcastWSEvent } from '../../utils.js';

export default function createTrackerEventRouter(trackerEventController, webSocketclients) {
  const router = express.Router();
  router.use(authToken);

  router.post('/trackerEvents/:id', async (req, res, next) => {
    try {
      const trackerId = req.params.id;

      const { eventDesc, lat, lon, bat } = req.query;
      const event = await trackerEventController.addEvent(trackerId, lat, lon, bat, eventDesc);

      if (eventDesc == 'POSITION') broadcastWSEvent(trackerId, webSocketclients, event);

      res.status(201).json(event);
    } catch (error) {
      next(error);
    }
  });

  router.get('/trackerEvents/:id', async (req, res, next) => {
    try {
      const trackerId = req.params.id;
      const limit = req.query.n ? parseInt(req.query.n) : null;
      const events = await trackerEventController.getEventsByTrackerId(trackerId, limit);

      res.status(200).json(events);
    } catch (error) {
      next(error);
    }
  });

  router.get('/trackerEvents', async (req, res, next) => {
    try {
      const events = await trackerEventController.getAll();

      res.status(200).json(events);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
