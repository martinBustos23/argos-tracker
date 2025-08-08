const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('./dashboard/general');
});

router.get('/devices', (req, res) => {
  res.render('./dashboard/devices');
});

router.get('/config', (req, res) => {
  res.render('./dashboard/config');
});

router.get('/users', (req, res) => {
  res.render('./dashboard/users');
});

module.exports = router;
