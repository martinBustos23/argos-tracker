import createApp from './app.js';
import config from './config/config.js';
import { initDB } from './config/db.js';
import { createServer } from 'https';
import { WebSocketServer } from 'ws';
import { readFileSync } from "fs";
import path from "path";
import { __dirname } from './utils.js';

async function startServer() {
  try {
    const webSocketClients = [];  // array que contiene todos los clientes activos de websocket
    const db = await initDB();
    const app = await createApp(db, webSocketClients);
    const PORT = config.PORT || 8080;

    const options = {
      key: readFileSync(path.join(__dirname, '../cert/server.key')),
      cert: readFileSync(path.join(__dirname, '../cert/server.cert')),
    };

    const server = createServer(options, app);
    const wss = new WebSocketServer({ server, path: '/ws' }); // crear servidor websocket
    
    wss.on('connection', (ws) => {

      ws.on('message', (data) => {
        webSocketClients.push({ conn: ws, tracker: JSON.parse(data) });  // cuando se conecta un cliente lo agrega a la lista
      });

      ws.on('close', () => {
          // elimina el cliente de la lista cuando se desconecta
          const index = webSocketClients.indexOf(ws);
          if (index !== -1) webSocketClients.splice(index, 1);
      });
    });

    server.listen(PORT, () => {
      console.log(`Servidor iniciado en https://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error iniciando servidor:', error);
  }
}

startServer();
