import express from 'express';
import { authToken } from '../../utils.js';

export default function createUserLogRouter(userLogController) {
  const router = express.Router();
  router.use(authToken);

  router.get('/userLogs', async (req, res, next) => {
    try {
      const n = req.query.n;
      const logs = await userLogController.getLatest(n);

      res.status(200).json(logs);
    } catch (error) {
      next(error);
    }
  });

  router.get('/userLogs/lastConnection/:username', async (req, res, next) => {
    try {
      const username = req.params.username;
      const lastConnection = await userLogController.getLastConnection(username);
      res.status(200).json({ lastConnection });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
