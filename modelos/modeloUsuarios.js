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
			const user = result[0];
			return callback(null, user);
		});
	}
}	
