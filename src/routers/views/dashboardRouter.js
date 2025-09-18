import express from 'express';
import { authToken, getUserFromToken } from '../../utils.js';

export default (
  userController,
  userLogController,
  trackerController,
  trackerLogController,
  trackerEventController
) => {
  const router = express.Router();
  router.use(authToken);

  router.get('/', async (req, res) => {
    try {
      const token = req.cookies.authorization;
      const username = getUserFromToken(token);
      const trackers = await trackerController.getAll();

      const allEvents = [];

      for (const tracker of trackers) {
        const events = await trackerEventController.getLatest(tracker.id, 5);

        for (let i = 0; i < events.length; i++) {
          if (!events[i].timestamp) {
            events[i].timestamp = 'Sin registro';
          } else {
            events[i].timestamp = new Date(events[i].timestamp + ' UTC').toLocaleString('es-AR', {
              hour12: false,
            });
          }

          allEvents.push({
            trackerId: tracker.id,
            trackerName: tracker.petName,
            ...events[i],
          });
        }
      }

      const sortedEvents = allEvents.sort((a, b) => {
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
      const firstTracker = trackers[0];
      return res.redirect(`/dashboard/devices/${firstTracker.id}`);
    } catch (error) {
      res.status(500).send('Error al ingresar a devices: ' + error.message);
    }
  });

  router.get('/config', async (req, res) => {
    try {
      const token = req.cookies.authorization;
      const username = getUserFromToken(token);
      const trackerLogs = await trackerLogController.getLatest(20);
      const userLogs = await userLogController.getLatest(20);

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

      res.render('./dashboard/config', { username, trackerLogs, userLogs });
    } catch (error) {
      res.status(500).send('Error al ingresar a configuracion' + error.message);
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

      const user = await userController.findByID(req.user);
      let admin = false;
      if (user.admin) admin = true;

      res.render('./dashboard/users', { username, admin, users });
    } catch (error) {
      next(error);
    }
  });

  router.get('/vincular', (req, res) => {
    const token = req.cookies.authorization;
    const username = getUserFromToken(token);
    res.render('./dashboard/vincular', { username });
  });

  router.get('/devices/:trackerId', async (req, res) => {
    try {
      const token = req.cookies.authorization;
      const username = getUserFromToken(token);
      const trackers = await trackerController.getAll();
      const tracker = await trackerController.findByID(req.params.trackerId);

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

  return router;
};
