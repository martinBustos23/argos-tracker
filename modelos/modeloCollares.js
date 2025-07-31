const { configDotenv } = require("dotenv");

class ModeloCollares {
	#db;
	constructor(db) {
		this.db = db;
	}

	/*
	* Metodo para buscar collares por id
	*/
	async buscarPorId(id) {
		if (id === undefined) throw new Error('id no especificada');
		if (typeof id !== 'string') throw new Error('tipo de dato invalido');
		const [result] = await this.db.query('SELECT * FROM dispositivos WHERE id = ?', id);
		if (result[0] === undefined) return null;
		return result[0];
	}

	/*
	* Metodo para agregar collares
	*/
	async agregarCollar(collar) {
		if (collar === undefined) throw new Error('collar no especificado');
		if (!(collar instanceof Collar)) throw new Error('tipo de dato invalido');
		const mensaje = `INSERT INTO dispositivos (id, nombre_mascota, intervalo_act, umbral_bat_baja, hogar_lat, hogar_lon, radio_zonaseg) VALUES (?, ?, ?, ?, ?, ?, ?)`;
		await this.db.query(mensaje, [
			collar.id,
			collar.nombreMascota,
			collar.config.intervaloActualizacion,
			collar.config.umbralBateriaBaja,
			collar.config.ubicacionZonaSegura.latitud,
			collar.config.ubicacionZonaSegura.longitud,
			collar.config.radioZonaSegura
		]);
	}

	/*
	* Metodo para deshabilitar un collar
	*/
	async darCollarDeBaja(idCollar) {
		if (idCollar === undefined) throw new Error('collar no especificado');
		if (typeof idCollar !== 'string') throw new Error('tipo de dato invalido');
		if (!this.buscarPorId(idCollar)) throw new Error('collar no existente');
		await this.db.query("UPDATE dispositivos SET habilitado = false WHERE id = ?", idCollar);
	}

	/*
	* Metodo para modificar un campo
	*/
	async modificarCollar(idCollar, modificaciones) {
		if (idCollar === undefined) throw new Error('collar no especificado');
		if (modificaciones === undefined) throw new Error('modificaciones no especificadas');
		if (typeof idCollar !== 'string' || typeof modificaciones !== 'object') throw new Error('tipo de dato invalido');
		
		let mensaje = "UPDATE dispositivos SET";
		const paresLlaveValor = Object.entries(modificaciones);
		for (let i = 0; i < paresLlaveValor.length; i++) {
			if (i === 0) {
				mensaje += ` ${paresLlaveValor[i][0]} = ${paresLlaveValor[i][1]}`;
				continue;
			}
			mensaje += `, ${paresLlaveValor[i][0]} = ${paresLlaveValor[i][1]}`;
		}
		mensaje += ' WHERE ID = ?';
		this.db.query(mensaje, idCollar);
	}
}

class Posicion {
	latitud;
	longitud;
	constructor(latitud, longitud) {
		this.latitud = latitud;
		this.longitud = longitud;
	}
}

class Configuracion {
	intervaloActualizacion;
	umbralBateriaBaja;
	ubicacionZonaSegura;
	radioZonaSegura;
	constructor(intervaloActualizacion, umbralBateriaBaja, ubicacionZonaSegura = null, radioZonaSegura = null) {
		this.intervaloActualizacion = intervaloActualizacion;
		this.umbralBateriaBaja = umbralBateriaBaja;
		this.ubicacionZonaSegura = ubicacionZonaSegura;
		this.radioZonaSegura = radioZonaSegura;
	}
}

class Collar {
	id;
	nombreMascota;
	config;
	constructor(id, config, nombreMascota = null) {
		this.id = id;
		this.nombreMascota = nombreMascota;
		this.config = config;
	}
}

module.exports = { Collar, Configuracion, Posicion, ModeloCollares };
// const conectar = require('../config/db');

// async function test() {
// 	try {
// 		const db = await conectar();
// 		const model = new ModeloCollares(db);
// 		// await model.agregarCollar(new Collar('A12dAs0', new Configuracion(1,20, new Posicion('-32.770475', '-60.786078'), 200.4)));
// 		// await model.darCollarDeBaja('A12dAs0');
// 		await model.modificarCollar('A12dAs0', {umbral_bat_baja: 420, intervalo_act: 2});
// 	} catch (err) {
// 		console.error('Error: ', err);
// 	}
// }

// test();
