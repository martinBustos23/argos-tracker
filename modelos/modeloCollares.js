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
		if (typeof id !== 'number') throw new Error('tipo de dato invalido');
		const [result] = await this.db.query('SELECT * FROM dispositivos WHERE id = ?', id);
		if (result[0] === undefined) return null;
		return result[0];
	}

	/*
	* Metodo para agregar collares
	*/
	async agregarCollar(collar) {
		if (id === undefined) throw new Error('collar no especificado');
		if (!(collar instanceof Collar)) throw new Error('tipo de dato invalido');
		const mensaje = `INSERT INTO dispositivos (id, nombre_mascota, intervalo_act, umbral_bat_baja, hogar_lat, hogar_lon, radio_zonaseg) VALUES (?, ?, ?, ?, ?, ?)`;
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
}

class Posicion {
	#latitud;
	#longitud;
	constructor(latitud, longitud) {
		this.#latitud = latitud;
		this.#longitud = longitud;
	}
}

class Configuracion {
	#intervaloActualizacion;
	#umbralBateriaBaja;
	#ubicacionZonaSegura;
	#radioZonaSegura;
	constructor(intervaloActualizacion, umbralBateriaBaja, ubicacionZonaSegura = null, radioZonaSegura = null) {
		this.#intervaloActualizacion = intervaloActualizacion;
		this.#umbralBateriaBaja = umbralBateriaBaja;
		this.#ubicacionZonaSegura = ubicacionZonaSegura;
		this.#radioZonaSegura = radioZonaSegura;
	}
}

class Collar {
	#id;
	#nombreMascota;
	#config;
	constructor(id, config, nombreMascota = null) {
		this.#id = id;
		this.#nombreMascota = nombreMascota;
		this.#config = config;
	}
}