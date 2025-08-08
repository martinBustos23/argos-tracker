class UserController {
  constructor(userDao) {
    this.userDao = userDao;
  }

  create = async (req, res) => {
    try {
      const newUser = await this.userDao.create(req.body);
      console.table(newUser);
      res.status(201).json(newUser);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  getAll = async (req, res) => {
    try {
      const users = await this.userDao.getAll();
      console.table(users);
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  findByID = async (req, res) => {
    try {
      const user = await this.userDao.findByID(req.params.uid);
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      console.table(user);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  update = async (req, res) => {
    try {
      const updatedUser = await this.userDao.update(req.params.uid, req.body);
      console.table(updatedUser);
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  delete = async (req, res) => {
    try {
      const result = await this.userDao.delete(req.params.uid);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
}

module.exports = UserController;
