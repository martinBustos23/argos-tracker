import express from 'express';
import { authToken, getUserIdFromToken } from '../../utils.js';
import systemConfig from '../../config/systemConfig.json' with { type: 'json' };

export default (
  userController,
  userLogController,
  trackerController,
  trackerLogController,
  trackerEventController,
  systemLogController,
  systemConfigController
) => {
  const router = express.Router();
  router.use(authToken);

  router.get('/', async (req, res) => {
    try {
      const token = req.cookies.authorization;
      const id = getUserIdFromToken(token);
      const trackers = await trackerController.getAll();

      const events = await trackerEventController.getAll();
      events.map((event) => {
        const nuevoEvento = event;
        nuevoEvento.timestamp = new Date(event.timestamp);
        nuevoEvento.petName = trackers.find(
          (tracker) => tracker.id === nuevoEvento.trackerId
        ).petName;
      });

      const sortedEvents = events.sort((a, b) => {
        if (a.timestamp === 'Sin registro') return 1;
        if (b.timestamp === 'Sin registro') return -1;
        return new Date(b.timestamp) - new Date(a.timestamp);
      });

      const user = await userController.find(id);
      const config = await systemConfigController.get();
      res.render('./dashboard/general', {
        user,
        config,
        trackers: trackers.sort((a, b) => (a.active===b.active) ? 0 : (a.active ? -1 : 1)),
        events: sortedEvents,
      });
    } catch (error) {
      res.status(500).send('Error al ingresar a general: ' + error.message);
    }
  });

  router.get('/devices', async (req, res) => {
    try {
      const token = req.cookies.authorization;

      const trackers = await trackerController.getAll();

      if (trackers.length == 0) {
        return res.redirect(`/dashboard/vincular`);
      }
      const firstTracker = trackers[0];
      return res.redirect(`/dashboard/devices/${firstTracker.id}`);
    } catch (error) {
      res.status(500).send('Error al ingresar a devices: ' + error.message);
    }
  });

  router.get('/devices/:trackerId', async (req, res) => {
    try {
      const token = req.cookies.authorization;
      const id = getUserIdFromToken(token);
      const trackers = await trackerController.getAll();
      const tracker = await trackerController.find(req.params.trackerId);

      let lastEvents = await trackerEventController.getAll();
      lastEvents = lastEvents.filter((event) => event.trackerId == tracker.id);

      const user = await userController.find(id);
      res.render('./dashboard/devices', { user, trackers, tracker, lastEvents, systemConfig });
    } catch (error) {
      res.status(500).send('Error al ingresar a devices: ' + error.message);
    }
  });

  router.get('/users', async (req, res, next) => {
    try {
      const users = await userController.getAll();
      // convertir timestamp a utc-3
      for (let i = 0; i < users.length; i++) {
        if (!users[i].lastLogin) {
          users[i].lastLogin = 'Todavia no logeado';
          continue;
        }
        // converite la hora de UTC a horario argentino (UTC -03:00)
        users[i].lastLogin = new Date(users[i].lastLogin + ' UTC').toLocaleString('es-AR', {
          hour12: false,
        });
      }
      const token = req.cookies.authorization;
      const id = getUserIdFromToken(token);
      const user = await userController.find(id);

      res.render('./dashboard/users', { user, users });
    } catch (error) {
      next(error);
    }
  });

  router.get('/config', async (req, res) => {
    try {
      const token = req.cookies.authorization;
      const id = getUserIdFromToken(token);
      const trackerLogs = await trackerLogController.getLatest(20);
      const userLogs = await userLogController.getLatest(20);
      const systemLogs = await systemLogController.getLatest(20);

      for (let i = 0; i < userLogs.length; i++) {
        if (!userLogs[i].timestamp) {
          userLogs[i].timestamp = 'Sin registro';
          continue;
        }
        userLogs[i].timestamp = new Date(userLogs[i].timestamp + ' UTC').toLocaleString('es-AR', {
          hour12: false,
        });
      }

      for (let i = 0; i < trackerLogs.length; i++) {
        if (!trackerLogs[i].timestamp) {
          trackerLogs[i].timestamp = 'Sin registro';
          continue;
        }
        trackerLogs[i].timestamp = new Date(trackerLogs[i].timestamp + ' UTC').toLocaleString(
          'es-AR',
          { hour12: false }
        );
      }

      for (let i = 0; i < systemLogs.length; i++) {
        if (!systemLogs[i].timestamp) {
          systemLogs[i].timestamp = 'Sin registro';
          continue;
        }
        systemLogs[i].timestamp = new Date(systemLogs[i].timestamp + ' UTC').toLocaleString(
          'es-AR',
          { hour12: false }
        );
      }

      const user = await userController.find(id);

      res.render('./dashboard/config', {
        user,
        trackerLogs,
        userLogs,
        systemLogs,
      });
    } catch (error) {
      res.status(500).send('Error al ingresar a configuracion' + error.message);
    }
  });

  router.get('/vincular', async (req, res) => {
    const token = req.cookies.authorization;
    const id = getUserIdFromToken(token);
    const user = await userController.find(id);
    res.render('./dashboard/vincular', { user });
  });

  router.get('/profile', async (req, res) => {
    const token = req.cookies.authorization;
    const id = getUserIdFromToken(token);
    const user = await userController.find(id);
    user.lastLogin = new Date(user.lastLogin + ' UTC').toLocaleString(
      'es-AR',
      { hour12: false }
    );
    res.render('./dashboard/profile', { user });
  });

  return router;
};
