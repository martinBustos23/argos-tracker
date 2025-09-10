import express from 'express';
import { authToken } from '../../utils.js';

export default function createTrackerLogRouter(trackerLogController) {
  const router = express.Router();
  router.use(authToken);

  router.get('/trackerLogs', async (req, res, next) => {
    try {
      const n = req.query.n;
      const logs = await trackerLogController.getLatest(n);

      res.status(200).json(logs);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
