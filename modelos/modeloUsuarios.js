const db = require('../config/db.js');

class ModeloUsuarios {
	constructor(){};

	/*
	* Metodo para buscar usuario por su id
	*/
	buscarPorId(id, callback) {
		if (id === undefined) return callback(new Error('id no especificada'));
		if (typeof id !== 'number') return callback(new Error('tipo de dato invalido'));
		db.query('SELECT id, username FROM users WHERE id = ?', id, (err, result) => {
			if (err) return callback(err);
			if (result[0] === undefined) return callback(null, null);
			const user = result[0];
			return callback(null, user);
		});
	}

	/*
	* Metodo para buscar usuario por su nombre de usuario
	*/
	buscarPorNombreUsuario(nombreUsuario, callback) {
		if (nombreUsuario === undefined) return callback(new Error('nombre de usuario no especificado'));
		if (typeof nombreUsuario !== 'string') return callback(new Error('tipo de dato de nombreUsuario invalido'));
		db.query('SELECT id, username FROM users WHERE username = ?', nombreUsuario, (err, result) => {
			if (err) return callback(err);
			if (result[0] === undefined) return callback(null, null);
			const user = result[0];
			return callback(null, user);
		});
	}
}
