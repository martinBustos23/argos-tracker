const createApp = require('./app');
const config = require('./config/config');
const { initDB } = require('./config/db');

async function startServer() {
  try {
    const db = await initDB();
    const app = await createApp(db);
    const PORT = config.PORT || 8080;

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error iniciando servidor:', error);
  }
}

startServer();
