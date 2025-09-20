import express from 'express';
import { authToken, BadRequest, Conflict, NotFound, broadcastWSEvent } from '../../utils.js';

export default function createTrackerEventRouter(trackerEventController, trackerController, webSocketclients) {
  const router = express.Router();
  router.use(authToken);

  router.post('/trackerEvents/:id', async (req, res, next) => {
    try {
      const trackerId = req.params.id;
      const tracker = await trackerController.find(trackerId);
      if (!tracker) throw new NotFound(`No existe el tracker ${trackerId}`);

      const { eventDesc, lat, lon, bat } = req.query;
      // primero agrega el evento
      const event = await trackerEventController.addPosition(trackerId, lat, lon, bat);      
      if (eventDesc == 'POSITION') broadcastWSEvent(trackerId, webSocketclients, {...event, petName: tracker.petName});
      
      res.status(200).json(event);
    } catch (error) {
      next(error);
    }
  });

  router.get('/trackerEvents/:id', async (req, res, next) => {
    try {
      const trackerId = req.params.id;
      const tracker = await trackerController.find(trackerId);
      if (!tracker) throw new NotFound(`No existe el tracker ${trackerId}`);
      if (!req.query.n) throw new BadRequest('No se indico cantidad de eventos');
      const n = req.query.n;
      const logs = await trackerEventController.getLatest(trackerId, n);

      res.status(200).json(logs);
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
