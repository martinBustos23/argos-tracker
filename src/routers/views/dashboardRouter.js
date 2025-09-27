import express from 'express';
import { authToken, getUserFromToken } from '../../utils.js';

export default (
  userController,
  userLogController,
  trackerController,
  trackerLogController,
  trackerEventController,
  systemLogController
) => {
  const router = express.Router();
  router.use(authToken);

  router.get('/', async (req, res) => {
    try {
      const token = req.cookies.authorization;
      const username = getUserFromToken(token);
      const trackers = await trackerController.getAll();

      const events = await trackerEventController.getAll();
      events.map(event => {
        const nuevoEvento = event;
        nuevoEvento.timestamp = new Date(event.timestamp);
        nuevoEvento.petName = trackers.find(tracker => tracker.id === nuevoEvento.trackerId).petName;
      });

      const sortedEvents = events.sort((a, b) => {
        if (a.timestamp === 'Sin registro') return 1;
        if (b.timestamp === 'Sin registro') return -1;
        return new Date(b.timestamp) - new Date(a.timestamp);
      });

      res.render('./dashboard/general', {
        username,
        trackers,
        events: sortedEvents,
      });
    } catch (error) {
      res.status(500).send('Error al ingresar a general: ' + error.message);
    }
  });

  router.get('/devices', async (req, res) => {
    try {
      const token = req.cookies.authorization;
      const username = getUserFromToken(token);

      const trackers = await trackerController.getAll();
      //prob se tilde si no hay trackers je
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
      const username = getUserFromToken(token);
      const trackers = await trackerController.getAll();
      const tracker = await trackerController.find(req.params.trackerId);

      let lastEvents = [];
      if (tracker) {
        lastEvents = await trackerEventController.getAll(tracker.id);
        lastEvents.forEach((event) => {
          if (event.timestamp) {
            event.timestamp = new Date(event.timestamp + ' UTC').toLocaleString('es-AR', {
              hour12: false,
            });
          } else {
            event.timestamp = 'Sin registro';
          }
        });
      }

      res.render('./dashboard/devices', { username, trackers, tracker, lastEvents });
    } catch (error) {
      res.status(500).send('Error al ingresar a devices: ' + error.message);
    }
  });

  router.get('/users', async (req, res) => {
    try {
      const users = await userController.getAll();
      // convertir timestamp a utc-3
      for (let i = 0; i < users.length; i++) {
        if (!users[i].lastLogin) {
          users[i].lastLogin = 'Todavia no logeado';
          continue;
        }
        // converite la hora de UTC a horario argentino (UTC -03:00)
        users[i].lastLogin = new Date(users[i].lastLogin).toLocaleString('es-AR', {
          hour12: false,
        });
      }
      const token = req.cookies.authorization;
      const username = getUserFromToken(token);

      const user = await userController.find(req.user);
      let admin = false;
      if (user.admin) admin = true;

      res.render('./dashboard/users', { username, admin, users });
    } catch (error) {
      next(error);
    }
  });

  router.get('/config', async (req, res) => {
    try {
      const token = req.cookies.authorization;
      const username = getUserFromToken(token);
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

      res.render('./dashboard/config', { username, trackerLogs, userLogs, systemLogs });
    } catch (error) {
      res.status(500).send('Error al ingresar a configuracion' + error.message);
    }
  });

  router.get('/vincular', (req, res) => {
    const token = req.cookies.authorization;
    const username = getUserFromToken(token);
    res.render('./dashboard/vincular', { username });
  });

  return router;
};
