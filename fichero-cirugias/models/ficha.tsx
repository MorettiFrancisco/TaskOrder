class Tarjeta {
    constructor(
        public id: number,
        public nombre_tecnica: string,
        public doctor: string,
        public descripcion: string,
        public fecha: Date,
    ) {}
}

export default Tarjeta;