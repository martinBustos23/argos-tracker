class ModeloUsuarios {
	#db;
	constructor(db) {
		this.db = db;
	};

	/*
	* Metodo para buscar usuario por su id
	*/
	async buscarPorId(id) {
		if (id === undefined) throw new Error('id no especificada');
		if (typeof id !== 'number') throw new Error('tipo de dato invalido');
		const [result] = await this.db.query('SELECT id, username FROM users WHERE id = ?', id);
		if (result[0] === undefined) return null;
		return result[0]; // si usuario existe retorna su id y su nombre de usuario
	}

	/*
	* Metodo para buscar usuario por su nombre de usuario
	*/
	async buscarPorNombreUsuario(nombreUsuario) {
		if (nombreUsuario === undefined) throw new Error('nombre de usuario no especificado');
		if (typeof nombreUsuario !== 'string') throw new Error('tipo de dato de nombreUsuario invalido');
		const [result] = await this.db.query('SELECT id, username FROM users WHERE username = ?', nombreUsuario);
		if (result[0] === undefined) return null;
		return result[0]; // si usuario existe retorna su id y su nombre de usuario
	}

	/*
	* Metodo para agregar un usuario nuevo
	*/
	async agregarUsuario(nombreUsuario, contrasenia) {
		// verificar que el usuario no exista
		if (this.buscarPorNombreUsuario(nombreUsuario)) throw new Error('usuario existente');
		// agregar usuario a la base de datos
		await this.db.query('INSERT INTO users (username, password) VALUES (?, ?)',
		[nombreUsuario, contrasenia]);
		return true;
	}

	/*
	* Metodo para dar de baja un usuario
	*/
	async darUsuarioDeBaja(id) {
		// verificar que el usuario exista
		if (!this.buscarPorId(id)) throw new Error('usuario no existente');
		// deshabilitar usuario
		await this.db.query('UPDATE users SET enabled = false WHERE id = ?', id);
	}

	/*
	* Metodo para eliminar un usuario
	*/
	async eliminarUsuario(id) {
		// verificar que el usuario exista
		if (!this.buscarPorId(id)) throw new Error('usuario no existente');
		// eliminar usuario
		await this.db.query('DELETE FROM users WHERE id = ?', id);
	}
}

//const conectar = require('../config/db');

//async function test() {
//	try {
//		const db = await conectar();
//		const model = new ModeloUsuarios(db);
//		const user = await model.buscarPorId(7);
//		await model.darUsuarioDeBaja(user.id);
//		await model.eliminarUsuario(user.id);
//	} catch (err) {
//		console.error('Error: ', err);
//	}
//}

//test();
