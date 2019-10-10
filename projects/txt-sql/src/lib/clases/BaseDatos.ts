import { Tabla } from './Tabla';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import parser from 'js-sql-parser';

// Clase base de datos
export class Basedatos {
    // Propiedades de la base de datos
    private op: OpcionesBD; // Opciones de la base de datos
    private tablas: Tabla[] = []; // Conjunto de tablas de la base de datos

    private cargarTablasBD() {
        const observable = new Observable<string>(observer => {
            for (const item of (this.op.opciones as OpcionesBDFile).configTablas) {
                const tabla = new Tabla(this.http);
                tabla.cargarCSV(item.pathArchivo, item.separador).subscribe({
                    complete: () => {
                        observer.next(item.nombreTabla);
                        this.tablas.push(tabla); // Añade la tabla a la lista
                    }
                });
            }
        });

        return observable;
    }

    private ejecutarQueryFILE(sql: string) {
        const sqlJSON = parser.parse(sql);
        console.log(sqlJSON);
    }

    private ejecutarQueryAPI(sql: string) {
        console.log(sql);
    }

    // Inicializar la Base de datos
    public inicializarBD() {
        const self = this;
        const observable = new Observable<string>(observer => {
            switch(this.op.tipoConexion) {
                case tiposConexion.FILE: 
                    self.cargarTablasBD().subscribe({
                        next: (tabla) => {
                            observer.next(tabla);
                        },
                        complete: () => {
                            observer.complete();
                        }
                    });
                    break;
                case tiposConexion.API:
                    observer.complete();
                    break;
            }
        });
        
        return observable;
    }

    // Devuelve el nombre de la base de datos
    public getNombreBD(op: OpcionesBD) {
        return this.op.opciones.nombre;
    }

    constructor(op: OpcionesBD, private http: HttpClient) {
        this.op = op;
        this.http = http;
    }

    // Ejecutar una consulta en la base de datos
    public query(sql: string) {
        switch(this.op.tipoConexion) {
            case tiposConexion.FILE:
                this.ejecutarQueryFILE(sql);                                
                break;
            case tiposConexion.API:
                this.ejecutarQueryAPI(sql);
                break;
        }
    }
}

// Definición de tipos

// Interfaz para las distintas opciones de la base de datos
export enum tiposConexion {
    FILE,
    API
}
export enum tiposArchivoBD {
    CSV
}
export interface OpcionesBD {
    tipoConexion: tiposConexion,
    opciones: OpcionesBDApi | OpcionesBDFile
}
export interface OpcionesBDFile {
    nombre: string;              // Nombre de la base de datos
    configTablas: ConfigTabla[]; // Configuración de cada tabla
}

export interface OpcionesBDApi {
    nombre: string;       // Nombre de la base de datos
    url: string;          // Nombre de la cadena de conexion
    parametroSQL: string; // paremetro donde se envia la SQL
}

// Configuración de cada tabla de la base de datos
export interface ConfigTabla {
    nombreTabla: string;
    pathArchivo: string; // ruta del archivo a cargar
    tipoArchivo: tiposArchivoBD; // tipo del archivo a cargar
    separador: string; // Valido para los archivos csv
    primaryKey: string[]; // Clave primaria de la tabla
}

