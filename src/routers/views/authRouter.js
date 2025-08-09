import express from 'express';
import { generateToken } from '../../utils.js';

export default (UserController) => {
  const router = express.Router();

  router.get('/login', (req, res) => {
    res.render('login');
  });

  router.get('/register', (req, res) => {
    res.render('register');
  });

  router.post('/login', async (req, res) => {
    try {
      await UserController.login(req.body);

      console.log('-- Login --');
      console.log(req.body); //test

      const token = generateToken(req.body.username);

      res
        .cookie('token', token, {
          httpOnly: true, // la cookie solo puede ser obtenida por nuestro servidor
          maxAge: 1000 * 60 * 60, // 1h
        })
        .redirect('dashboard');
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/register', async (req, res) => {
    try {
      const newUser = await UserController.register(req.body);

      console.log('-- Registrar usuario --');
      console.log(req.body); //test
      console.table(newUser); //

      res.redirect('login');
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
