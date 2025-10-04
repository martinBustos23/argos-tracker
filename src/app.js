import express from 'express';
import cookieParser from 'cookie-parser';

import path from 'path';

import LogDAO from './dao/logDAO.js';
import LogController from './controller/logController.js';

import UserDAO from './dao/userDAO.js';
import UserController from './controller/api/userController.js';

import TrackerDAO from './dao/trackerDAO.js';
import TrackerController from './controller/api/trackerController.js';

import TrackerEventDAO from './dao/trackerEventDAO.js';
import TrackerEventController from './controller/api/trackerEventController.js';

import SystemConfigDAO from './dao/systemConfigDAO.js';
import SystemConfigController from './controller/systemConfigController.js';

import createUserRouter from './routers/api/userRouter.js';
import createTrackerRouter from './routers/api/trackerRouter.js';
import createTrackerEventRouter from './routers/api/trackerEventRouter.js';

import createAuthRouter from './routers/views/authRouter.js';
import createDashboardRouter from './routers/views/dashboardRouter.js';
import createSystemConfigRouter from './routers/systemConfigRouter.js';

import {
  createUserLogRouter,
  createTrackerLogRouter,
  createSystemLogRouter,
} from './routers/logRouter.js';

import { __dirname, Exception } from './utils.js';

export default async function createApp(db, webSocketclients) {
  const app = express();

  const userLogDao = new LogDAO(db, 'logUsers');
  const userLogController = new LogController(userLogDao);

  const trackerLogDao = new LogDAO(db, 'logTrackers');
  const trackerLogController = new LogController(trackerLogDao);

  const systemLogDao = new LogDAO(db, 'logSystem');
  const systemLogController = new LogController(systemLogDao);

  const userDao = new UserDAO(db);
  const userController = new UserController(userDao, userLogController);

  const trackerDao = new TrackerDAO(db);
  const trackerController = new TrackerController(trackerDao, trackerLogController);

  const trackerEventDao = new TrackerEventDAO(db);
  const trackerEventController = new TrackerEventController(trackerEventDao);

  const systemConfigDAO = new SystemConfigDAO(db);
  const systemConfigController = new SystemConfigController(systemConfigDAO, systemLogController);

  const userRouter = createUserRouter(userController);
  const trackerRouter = createTrackerRouter(trackerController, userController);
  const trackerEventRouter = createTrackerEventRouter(
    trackerEventController,
    trackerController,
    webSocketclients
  );

  const authRouter = createAuthRouter(userController);
  const dashboardRouter = createDashboardRouter(
    userController,
    userLogController,
    trackerController,
    trackerLogController,
    trackerEventController,
    systemLogController,
    systemConfigController
  );

  const userLogRouter = createUserLogRouter(userLogController);
  const trackerLogRouter = createTrackerLogRouter(trackerLogController);
  const systemLogRouter = createSystemLogRouter(systemLogController);

  const systemConfigRouter = createSystemConfigRouter(systemConfigController, userController);

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, '..', 'public')));
  app.use(cookieParser());

  // app.get('/', (req, res) => {
  //   res.json({ message: 'Bienvenido ArgosTracker App' });
  // });

  app.use('/', authRouter);
  app.use('/dashboard', dashboardRouter);
  app.use(
    '/api',
    userRouter,
    trackerRouter,
    userLogRouter,
    trackerLogRouter,
    trackerEventRouter,
    systemConfigRouter,
    systemLogRouter,
  );

  app.use((error, req, res, next) => {
    if (error instanceof Exception) {
      console.log(error.status + ': ' + error.message);
      return res.status(error.status).json({ status: 'error', message: error.message });
    } else {
      const message = `Ocurrio un error desconocido: ${error.message}`;
      console.log(message);
      return res.status(500).json({ status: 'error', message });
    }
  });

  return { app, systemLogController, userController };
}
