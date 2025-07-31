class ModeloEventos {
    #db
    constructor(db) {
        this.db = db;
    }

}

class Evento {
    id;
    tipo;
    timestamp;
    descripcion;
    constructor(id, tipo, timestamp, descripcion) {
        if (typeof id !== 'number' ||
			typeof tipo !== 'number' ||
			typeof descripcion !== 'string' ||
			!(timestamp instanceof Date))
				throw new Error("tipo de datos invalidos");
        this.id = id;
        this.tipo = tipo;
        this.timestamp = timestamp;
        this.descricion = descripcion;
    }
}

class Posicion extends Evento {
	latitud;
	longitud;
	constructor(id, latitud, longitud, timestamp) {
        if (typeof id !== 'number' ||
			typeof latitud !== 'number' ||
			typeof longitud !== 'number' ||
			!(timestamp instanceof Date))
				throw new Error("tipo de datos invalidos");
        this.id = id;
		this.latitud = latitud;
		this.longitud = longitud;
        this.descripcion = null;
        this.tipo = 0;
        this.timestamp = timestamp;
	}
}

module.exports = { Posicion, Evento, ModeloEventos }