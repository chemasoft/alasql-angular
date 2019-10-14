import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
declare let alasql;

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
    configTablas: ConfigTabla[]; // Configuración de cada tabla
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

// Configuración de cada tabla de la base de datos
export interface ConfigTabla {
    nombreTabla: string;
    pathArchivo: string; // ruta del archivo a cargar
    tipoArchivo: tiposArchivoBD; // tipo del archivo a cargar
    separador: string; // Valido para los archivos csv
    primaryKey: string[]; // Clave primaria de la tabla
}

// Clase base de datos
export class Basedatos {
    // Propiedades de la base de datos
    private op: OpcionesBD; // Opciones de la base de datos

    private cargarTablasBD() {
        const observable = new Observable<string>(observer => {
            for (const item of (this.op.opciones as OpcionesBDFile).configTablas) {
                alasql.promise('SELECT * FROM CSV("' + item.pathArchivo + '",{separator:"' + item.separador + '"})')
                .then((data) => {
                     alasql.promise('DROP TABLE IF EXISTS ' + item.nombreTabla + '; \
                     CREATE TABLE ' + item.nombreTabla + '; \
                     SELECT * INTO ' + item.nombreTabla + ' FROM ?', [data])
                     .then(() => {
                          observer.next(item.nombreTabla);
                          observer.complete();
                     }).catch((err) => {
                          console.log('Error:', err);
                          observer.error(err);
                     });
                }).catch((err) => {
                     console.log('Error:', err);
                     observer.error(err);
                });
            }
        });

        return observable;
    }

    private ejecutarQueryFILE(sql: string) {
        const observable = new Observable<string>(observer => {
            const res = alasql.promise(sql)
            .then((data) => {
                observer.next(data);
                observer.complete();
           }).catch((err) => {
               observer.error(err);
           });
        });

        return observable;
    }

    private ejecutarQueryAPI(psql: string) {
        const observable = new Observable<string>(observer => {
            const body = {sql: psql};
            const config = { headers: new HttpHeaders().set('responseType', 'application/json') };
            this.http.post((this.op.opciones as OpcionesBDApi).url, body, config).subscribe({
                next: (data) => observer.next((data as string)),
                complete: () => observer.complete(),
                error: (err) => observer.error(err)
            });
        });

        return observable;
    }

    // Inicializar la Base de datos
    public inicializarBD() {
        const self = this;
        const observable = new Observable<string>(observer => {
            switch (this.op.tipoConexion) {
                case tiposConexion.FILE:
                    // Crear la base de datos
                    alasql.promise('CREATE INDEXEDDB DATABASE IF NOT EXISTS ' + this.op.nombre + ';\
                    ATTACH INDEXEDDB DATABASE ' + this.op.nombre + '; \
                    USE ' + this.op.nombre + ';')
                    .then(() => { // En este caso se ha creado la base de datos
                        self.cargarTablasBD().subscribe({
                            next: (tabla) => {
                                observer.next(tabla);
                            },
                            complete: () => {
                                observer.complete();
                            }
                        });
                    }).catch((err) => {
                        observer.error(err); // Error en la creacion de la base de datos
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
        return this.op.nombre;
    }

    constructor(op: OpcionesBD, private http: HttpClient) {
        this.op = op;
        this.http = http;
    }

    // Ejecutar una consulta en la base de datos
    public query(sql: string) {
        const observable = new Observable<string>(observer => {
            switch (this.op.tipoConexion) {
                case tiposConexion.FILE:
                    this.ejecutarQueryFILE(sql).subscribe({
                        next: (data) => observer.next(data),
                        complete: () => observer.complete(),
                        error: (err) => observer.error(err)
                    });
                    break;
                case tiposConexion.API:
                    this.ejecutarQueryAPI(sql);
                    break;
            }
        });

        return observable;
    }
}
