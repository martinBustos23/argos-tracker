import express from 'express';

export default (userController) => {
  const router = express.Router();

  router.get('/login', (req, res) => {
    res.render('login');
  });

  router.post('/login', userController.login);

  router.get('/register', (req, res) => {
    res.render('register');
  });

  router.post('/register', userController.register);

  return router;
};
