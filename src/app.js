const express = require('express');

const path = require('path');

const UserDAO = require('./dao/userDAO');
const UserController = require('./controller/userController');

const createUserRouter = require('./routers/api/userRouter');
const authRouter = require('./routers/views/authRouter.js');
const dashboardRouter = require('./routers/views/dashboardRouter.js');

async function createApp(db) {
  const app = express();

  const userDao = new UserDAO(db);
  const userController = new UserController(userDao);
  const userRouter = createUserRouter(userController);

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname + '/views'));

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

module.exports = createApp;
