const express = require('express');

module.exports = (UserController) => {
  const router = express.Router();

  router.get('/users/', UserController.getAll);
  router.get('/users/:uid', UserController.findByID);
  router.post('/users', UserController.create);
  router.put('/users/:uid', UserController.update);
  router.delete('/users/:uid', UserController.delete);

  return router;
};
