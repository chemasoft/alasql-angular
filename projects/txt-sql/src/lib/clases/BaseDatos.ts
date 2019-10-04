import { Tabla } from './Tabla';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Clase base de datos
export class Basedatos {
    // Tipos de fichero
    public static mscCSV = 'CSV';

    // Propiedades de la base de datos
    private op: OpcionesBD; // Opciones de la base de datos
    private tablas: Tabla[] = []; // Conjunto de tablas de la base de datos


    public cargarTablasBD() {
        const observable = new Observable<string>(observer => {
            for (const item of this.op.configTablas) {
                const tabla = new Tabla(this.http, item.primaryKey);
                tabla.cargarCSV(item.pathArchivo, item.separador).subscribe((Tabla) => {
                    observer.next(item.nombreTabla);
                });
            }
        });

        return observable;
    }

    // Devuelve el nombre de la base de datos
    public getNombreBD(op: OpcionesBD) {
        return this.op.nombre;
    }

    constructor(op: OpcionesBD, private http: HttpClient) {
        this.op = op;
        this.http = http;
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
    nombreTabla: string;
    pathArchivo: string; // ruta del archivo a cargar
    tipoArchivo: string; // tipo del archivo a cargar
    separador: string; // Valido para los archivos csv
    primaryKey: string[]; // Clave primaria de la tabla
}

