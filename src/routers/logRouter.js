import express from 'express';
import { authToken } from '../utils.js';

export function createSystemLogRouter(systemLogController) {
  const router = express.Router();
  router.use(authToken);

  router.get('/systemLogs', async (req, res, next) => {
    try {
      const n = req.query.n;
      const logs = await systemLogController.getLatest(n);

      res.status(200).json(logs);
    } catch (error) {
      next(error);
    }
  });

  return router;
}

export function createTrackerLogRouter(trackerLogController) {
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

export function createUserLogRouter(userLogController) {
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

  // router.get('/userLogs/since/:id', async (req, res, next) => {
  //   try {
  //     const logId = req.params.id;
  //     const result = await userLogController.getAllSince(logId);
  //     res.status(200).json(result);
  //   } catch (error) {
  //     next(error);
  //   }
  // });

  return router;
}
