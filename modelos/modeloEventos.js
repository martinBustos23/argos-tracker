class ModeloEventos {
    #db
    constructor(db) {
        this.db = db;
    }

    async buscarPorId(idEvento) {
        if (id === undefined) throw new Error('id no especificada');
		if (typeof id !== 'number') throw new Error('tipo de dato invalido');
		const [result] = await this.db.query('SELECT * FROM eventos WHERE id = ?', idEvento);
		if (result[0] === undefined) return null;
		return result[0];
    }

    async agregarEvento(evento) {
        if (evento === undefined) throw new Error("evento no especificado");
        if (!(evento instanceof Evento)) throw new Error("tipo de dato invalido");
        await this.db.query("INSERT INTO eventos (tipo, contenido, timestamp) VALUES (?, ?, ?)",
            [evento.tipo, evento.contenido, evento.timestamp]);
    }
}

class Evento {
    id;
    tipo;
    timestamp;
    contenido;
    constructor(id, tipo, timestamp, contenido) {
        if (typeof id !== 'number' ||
			typeof tipo !== 'number' ||
			typeof contenido !== 'string' ||
			!(timestamp instanceof Date))
				throw new Error("tipo de datos invalidos");
        this.id = id;
        this.tipo = tipo;
        this.timestamp = timestamp;
        this.contenido = contenido;
    }
}

class Posicion extends Evento {
	latitud;
	longitud;
	constructor(id, latitud, longitud, timestamp) {
        super(id, 0, timestamp, null);
		this.latitud = latitud;
		this.longitud = longitud;
        this.descripcion = null;
        this.tipo = 0;
        this.timestamp = timestamp;
	}
}

module.exports = { Posicion, Evento, ModeloEventos }