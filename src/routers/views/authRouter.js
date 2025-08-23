import express from 'express';
import { generateToken, getUserFromToken } from '../../utils.js';

export default (UserController) => {
  const router = express.Router();

  router.get('/login', (req, res) => {
    const token = req.cookies.authorization;
    if (token) return res.redirect('/dashboard');
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
        .cookie('authorization', token, {
          httpOnly: true, // la cookie solo puede ser obtenida por nuestro servidor
          maxAge: 1000 * 60 * 60, // 1h
        })
        .redirect('dashboard');
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/logout', async (req, res) => {
    try {
      const token = req.cookies.authorization;
      if (token) {
        const username = getUserFromToken(token);
        await UserController.logout(username);
        return res.clearCookie('authorization').redirect('/login');
      }
      res.redirect('/login');
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  return router;
};
