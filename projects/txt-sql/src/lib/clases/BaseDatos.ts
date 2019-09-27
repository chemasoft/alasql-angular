import { Tabla } from './Tabla';

// Clase base de datos
export class Basedatos {
    // Tipos de fichero
    public static mscCSV = 'CSV';

    // Propiedades de la base de datos
    private nombre: string; // Nombre de la base de datos
    private tablas: Tabla[] = []; // Conjunto de tablas de la base de datos

    private cargarTablasBD(confTablas: ConfigTabla[]) {

    }

    // Devuelve el nombre de la base de datos
    public getNombreBD(op: OpcionesBD) {
        return this.nombre;
        this.cargarTablasBD(op.configTablas);
    }

    constructor(op: OpcionesBD) {
        this.nombre = op.nombre;

    }

    // Ejecutar una consulta en la base de datos
    public query(sql: string) {

    }
}

// Definición de tipos

// Interfaz para las opciones de la base de datos
export interface OpcionesBD {
    nombre: string;              // Nombre de la base de datos
    configTablas: ConfigTabla[]; // Configuración de cada tabla
}

// Configuración de cada tabla de la base de datos
export interface ConfigTabla {
    pathArchivo: string; // ruta del archivo a cargar
    tipoArchivo: string; // tipo del archivo a cargar
}

