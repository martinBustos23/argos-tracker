const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
	host: process.env.DB_URL,
	port: process.env.DB_PORT,
	database: process.env.DB_NAME,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD
});

module.exports = db;
