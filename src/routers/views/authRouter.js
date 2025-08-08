const express = require('express');
const router = express.Router();

router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'admin' && password === '1234') {
    return res.redirect('dashboard');
  }

  res.render('login');
});

router.get('/register', (req, res) => {
  res.render('register');
});

module.exports = router;
