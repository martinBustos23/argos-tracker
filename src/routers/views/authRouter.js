import express from 'express';
import { generateToken, getUserIdFromToken } from '../../utils.js';

export default (UserController) => {
  const router = express.Router();

  router.get('/login', (req, res) => {
    const token = req.cookies.authorization;
    if (token) return res.redirect('/dashboard');
    res.render('login');
  });

  router.post('/login', async (req, res, next) => {
    try {
      const user = await UserController.login(req.body);

      if (user.status === 'pwd_change')
        return res.render('new-password', { user });
        // return res.redirect('new-password?' + new URLSearchParams({ id: user.id }));
      const token = generateToken(user.id);
      res
        .cookie('authorization', token, {
          httpOnly: true, // la cookie solo puede ser obtenida por nuestro servidor
          maxAge: 1000 * 60 * 60 * 24 * 90, // 90d
        })
        .redirect('dashboard');
    } catch (error) {
      console.log(error.message);
      res.render('login', { errorMessage: error.message });
    }
  });

  router.get('/logout', async (req, res, next) => {
    try {
      const token = req.cookies.authorization;
      if (token) {
        const id = getUserIdFromToken(token);
        const user = await UserController.find(id);
        await UserController.logout(user.id);
        return res.clearCookie('authorization').redirect('/login');
      }
      res.redirect('/login');
    } catch (error) {
      next(error);
    }
  });
  return router;
};
