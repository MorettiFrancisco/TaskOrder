import AsyncStorage from '@react-native-async-storage/async-storage';
import Ficha from '../models/ficha';

const STORAGE_KEY = 'fichas';

// Validar los campos de una ficha
function validarFicha(ficha: any): ficha is Ficha {
    return (
        typeof ficha.id === 'number' &&
        typeof ficha.nombre_tecnica === 'string' &&
        typeof ficha.doctor === 'string' &&
        typeof ficha.descripcion === 'string' &&
        (ficha.fecha instanceof Date || typeof ficha.fecha === 'string')
    );
}

// Guardar todas las fichas
export async function guardarFichas(fichas: Ficha[]) {
    if (!Array.isArray(fichas) || !fichas.every(validarFicha)) {
        throw new Error('Datos de fichas inválidos');
    }
    try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(fichas));
    } catch (e) {
        // Manejar error si es necesario
    }
}

// Cargar todas las fichas
export async function cargarFichas(): Promise<Ficha[]> {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        if (data) {
            const parsed = JSON.parse(data);
            if (!Array.isArray(parsed)) return [];
            return parsed
                .filter(validarFicha)
                .map((f: any) =>
                    new Ficha(
                        f.id,
                        f.nombre_tecnica,
                        f.doctor,
                        f.descripcion,
                        new Date(f.fecha)
                    )
                );
        }
        return [];
    } catch (e) {
        return [];
    }
}

// Agregar una ficha
export async function agregarFicha(ficha: Ficha) {
    if (!validarFicha(ficha)) throw new Error('Ficha inválida');
    const fichas = await cargarFichas();
    fichas.push(ficha);
    await guardarFichas(fichas);
}

// Buscar fichas por nombre de técnica (case-insensitive)
export async function buscarFichasPorTecnica(nombre: string): Promise<Ficha[]> {
    if (typeof nombre !== 'string') throw new Error('Nombre inválido');
    const fichas = await cargarFichas();
    return fichas.filter(f =>
        f.nombre_tecnica.trim().toLowerCase() === nombre.trim().toLowerCase()
    );
}

// Chequear si existe una ficha por nombre de técnica
export async function existeFichaPorTecnica(nombre: string): Promise<boolean> {
    const resultados = await buscarFichasPorTecnica(nombre);
    return resultados.length > 0;
}

// Obtener una ficha única por nombre de técnica (devuelve la primera coincidencia o null)
export async function obtenerFichaPorTecnica(nombre: string): Promise<Ficha | null> {
    const resultados = await buscarFichasPorTecnica(nombre);
    return resultados.length > 0 ? resultados[0] : null;
}

// Editar una ficha por nombre de técnica
export async function editarFichaPorTecnica(nombre: string, fichaEditada: Ficha) {
    if (!validarFicha(fichaEditada)) throw new Error('Ficha inválida');
    let fichas = await cargarFichas();
    fichas = fichas.map(f =>
        f.nombre_tecnica.trim().toLowerCase() === nombre.trim().toLowerCase() ? fichaEditada : f
    );
    await guardarFichas(fichas);
}

// Eliminar una ficha por id
export async function eliminarFichaPorId(id: number) {
    if (typeof id !== 'number') throw new Error('ID inválido');
    let fichas = await cargarFichas();
    fichas = fichas.filter(f => f.id !== id);
    await guardarFichas(fichas);
}
