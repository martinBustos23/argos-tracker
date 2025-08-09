import express from 'express';

import path from 'path';

import UserDAO from './dao/userDAO.js';
import UserController from './controller/userController.js';

import createUserRouter from './routers/api/userRouter.js';
import createAuthRouter from './routers/views/authRouter.js';
import createDashboardRouter from './routers/views/dashboardRouter.js';
import { __dirname } from './utils.js';

export default async function createApp(db) {
  const app = express();

  const userDao = new UserDAO(db);
  const userController = new UserController(userDao);
  const userRouter = createUserRouter(userController);
  const authRouter = createAuthRouter(userController);
  const dashboardRouter = createDashboardRouter(userController);

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname + '/views'));
  //console.log(__dirname);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, '..', 'public')));

  // app.get('/', (req, res) => {
  //   res.json({ message: 'Bienvenido ArgosTracker App' });
  // });

  app.use('/', authRouter);
  app.use('/dashboard', dashboardRouter);

  app.use('/api', userRouter);

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
