import express from 'express';
import { authToken, isAdmin } from '../utils.js';

export default function createSystemConfigRouter(systemConfigController, userController) {
  const router = express.Router();
  router.use(authToken);

  router.get('/systemConfig', isAdmin(userController), async (req, res, next) => {
    try {
      const config = await systemConfigController.get();

      res.status(200).json(config);
    } catch (error) {
      next(error);
    }
  });

  router.patch('/systemConfig', isAdmin(userController), async (req, res, next) => {
    try {
      const config = await systemConfigController.update(req.body);

      res.status(200).json(config);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
