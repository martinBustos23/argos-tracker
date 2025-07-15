// modulos 
const express = require('express');

const app = express();

app.get('/', (req, res) => {
	res.send('bienvenido!');
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
	console.log(`servidor iniciado en http://localhost:${PORT}`);
});
