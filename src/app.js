import express from 'express';

import path from 'path';

import UserDAO from './dao/userDAO.js';
import UserController from './controller/userController.js';

import createUserRouter from './routers/api/userRouter.js';
import authRouter from './routers/views/authRouter.js';
import dashboardRouter from './routers/views/dashboardRouter.js';
import { __dirname, __filename } from './config/config.js';

export default async function createApp(db) {
  const app = express();

  const userDao = new UserDAO(db);
  const userController = new UserController(userDao);
  const userRouter = createUserRouter(userController);

  app.set('view engine', 'ejs');

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, '..', 'public')));

  // app.get('/', (req, res) => {
  //   res.json({ message: 'Bienvenido ArgosTracker App' });
  // });

  app.use('/', authRouter);
  app.use('/dashboard', dashboardRouter);

  app.use('/api', userRouter);

  return app;
}
