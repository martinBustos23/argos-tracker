import express from 'express';
import cookieParser from 'cookie-parser';

import path from 'path';

import UserDAO from './dao/userDAO.js';
import UserController from './controller/userController.js';
import LogDAO from './dao/logDAO.js';
import UserLogController from './controller/userLogController.js';

import TrackerDAO from './dao/trackerDAO.js';
import TrackerController from './controller/trackerController.js';
import TrackerLogController from './controller/trackerLogController.js';

import createUserRouter from './routers/api/userRouter.js';
import createAuthRouter from './routers/views/authRouter.js';
import createUserLogRouter from './routers/api/userLogRouter.js';
import createTrackerLogRouter from './routers/api/trackerLogRouter.js';
import createDashboardRouter from './routers/views/dashboardRouter.js';
import createTrackerRouter from './routers/api/trackerRouter.js';
import { __dirname, Exception } from './utils.js';

export default async function createApp(db) {
  const app = express();

  const userDao = new UserDAO(db);
  const userLogDao = new LogDAO(db, 'usersLog');
  const trackerDao = new TrackerDAO(db);
  const trackerLogDao = new LogDAO(db, 'trackersLog');
  const userLogController = new UserLogController(userLogDao);
  const userController = new UserController(userDao, userLogController);
  const trackerLogController = new TrackerLogController(trackerLogDao);
  const trackerController = new TrackerController(trackerDao, trackerLogController);
  const userRouter = createUserRouter(userController);
  const authRouter = createAuthRouter(userController);
  const userLogRouter = createUserLogRouter(userLogController)
  const dashboardRouter = createDashboardRouter(userController);
  const trackerRouter = createTrackerRouter(trackerController, userController);
  const trackerLogRouter = createTrackerLogRouter(trackerLogController);

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname + '/views'));
  //console.log(__dirname);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, '..', 'public')));
  app.use(cookieParser());
  // app.get('/', (req, res) => {
  //   res.json({ message: 'Bienvenido ArgosTracker App' });
  // });

  app.use('/', authRouter);
  app.use('/dashboard', dashboardRouter);

  app.use('/api', userRouter, trackerRouter, userLogRouter, trackerLogRouter);

  app.use((error, req, res, next) => {
    if (error instanceof Exception) {
      res.status(error.status).json({ status: 'error', message: error.message });
    } else {
      const message = `Ocurrio un error desconocido: ${error.message}`;
      console.log(message);
      res.status(500).json({ status: 'error', message });
    }
  });

  return app;
}
