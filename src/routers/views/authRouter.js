import express from 'express';
import { generateToken, getUserFromToken } from '../../utils.js';

export default (UserController) => {
  const router = express.Router();

  router.get('/login', (req, res) => {
    const token = req.cookies.authorization;
    if (token) return res.redirect('/dashboard');
    res.render('login');
  });

  router.post('/login', async (req, res, next) => {
    try {
      await UserController.login(req.body);

      const token = generateToken(req.body.username);
      res
        .cookie('authorization', token, {
          httpOnly: true, // la cookie solo puede ser obtenida por nuestro servidor
          maxAge: 1000 * 60 * 60, // 1h
        })
        .redirect('dashboard');
    } catch (error) {
      res.render('login', { errorMessage: 'Usuario o contraseña incorrectos' });
    }
  });

  router.get('/logout', async (req, res, next) => {
    try {
      const token = req.cookies.authorization;
      if (token) {
        const username = getUserFromToken(token);
        await UserController.logout(username);
        return res.clearCookie('authorization').redirect('/login');
      }
      res.redirect('/login');
    } catch (error) {
      next(error);
    }
  });
  return router;
};
