const mysql = require('mysql2/promise');
require('dotenv').config({path: '../.env'});

async function conectarBaseDatos() {
	const db = await mysql.createConnection({
		host: process.env.DB_URL,
		port: process.env.DB_PORT,
		database: process.env.DB_NAME,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD
	});
	console.log('conectado a base de datos');
	return db;
}

module.exports = conectarBaseDatos;
