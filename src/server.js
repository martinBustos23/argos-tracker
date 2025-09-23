import createApp from './app.js';
import config from './config/config.js';
import { initDB } from './config/db.js';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

async function startServer() {
  try {
    const webSocketClients = []; // array que contiene todos los clientes activos de websocket
    const db = await initDB();
    const app = await createApp(db, webSocketClients);
    const PORT = config.PORT || 8080;

    const server = createServer(app);
    const wss = new WebSocketServer({ server, path: '/ws' }); // crear servidor websocket

    wss.on('connection', (ws) => {
      ws.on('message', (data) => {
        webSocketClients.push({ conn: ws, tracker: JSON.parse(data) }); // cuando se conecta un cliente lo agrega a la lista
      });

      ws.on('close', () => {
        // elimina el cliente de la lista cuando se desconecta
        const index = webSocketClients.indexOf(ws);
        if (index !== -1) webSocketClients.splice(index, 1);
      });
    });

    server.listen(PORT, () => {
      console.log(`Servidor iniciado en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error iniciando servidor:', error);
  }
}

startServer();
