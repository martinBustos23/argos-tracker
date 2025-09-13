import express from 'express';
import { authToken, BadRequest, Conflict, NotFound } from '../../utils.js';

export default function createTrackerEventRouter(trackerEventController, trackerController) {
  const router = express.Router();
  router.use(authToken);

  router.post('/trackerEvents/:id', async (req, res, next) => {
    try {
      const trackerId = req.params.id;
      const tracker = await trackerController.findByID(trackerId);
      if (!tracker) throw new NotFound(`No existe el tracker ${trackerId}`);
      const lat = req.query.lat;
      const lon = req.query.lon;
      const batt = req.query.batt;
      let event;
      if (batt)
        event = await trackerEventController.addBatteryLvl(trackerId, batt);
      else
        event = await trackerEventController.addPosition(trackerId, lat, lon);
      res.status(200).json(event);
    } catch (error) {
      next(error);
    }
  });

  router.get('/trackerEvents/:id', async (req, res, next) => {
    try {
      const trackerId = req.params.id;
      const tracker = await trackerController.findByID(trackerId);
      if (!tracker) throw new NotFound(`No existe el tracker ${trackerId}`);
      if (!req.query.n) throw new BadRequest('No se indico cantidad de eventos');
      const n = req.query.n;
      const logs = await trackerEventController.getLatest(trackerId, n);

      res.status(200).json(logs);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
