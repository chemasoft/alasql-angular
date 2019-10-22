// Definición de tipos

// Interfaz para las distintas opciones de la base de datos
export enum tiposConexion {
    FILE,
    API
}
export enum tiposArchivoBD {
    CSV
}
export interface OpcionesBDFile {
    configTablas: PropiedadesTabla[]; // Configuración de cada tabla
}

export interface OpcionesBDApi {
    url: string;          // Nombre de la cadena de conexion
    parametroSQL: string; // paremetro donde se envia la SQL
}

export interface OpcionesBD {
    nombre: string; // Nombre de la base de datos
    tipoConexion: tiposConexion;
    opciones: OpcionesBDApi | OpcionesBDFile;
}

// Propiedades de cada tabla de la base de datos
export interface PropiedadesTabla {
    nombreTabla: string;
    pathArchivo: string; // ruta del archivo a cargar
    tipoArchivo: tiposArchivoBD; // tipo del archivo a cargar
    separador: string; // Valido para los archivos csv
    primaryKey: string[]; // Clave primaria de la tabla
}

export interface Campo {
    nombre: string;
    tipo: string;
}
