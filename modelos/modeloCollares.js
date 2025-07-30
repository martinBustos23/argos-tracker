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
}
