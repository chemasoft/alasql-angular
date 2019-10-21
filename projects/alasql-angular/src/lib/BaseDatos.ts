import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
declare let alasql;

// Clase base de datos
export class Basedatos {
    private op: OpcionesBD; // Opciones de la base de datos

    constructor(op: OpcionesBD, private http: HttpClient) {
        this.op = op;
        this.http = http;
    }

    // Inicializar la Base de datos
    public inicializarBD() {
        const self = this;
        const observable = new Observable<any>(observer => {
            switch (self.op.tipoConexion) {
                case tiposConexion.FILE:
                    self.cargarTablasBD().subscribe({
                        complete: () => {
                            observer.complete();
                        },
                        error: (err) => {
                            observer.error(err);
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

    // Ejecutar una consulta en la base de datos
    public query(sql: string) {
        const self = this;
        const observable = new Observable<any>(observer => {
            switch (self.op.tipoConexion) {
                case tiposConexion.FILE:
                    self.ejecutarQueryFILE(sql).subscribe({
                        next: (data) => observer.next(data),
                        complete: () => observer.complete(),
                        error: (err) => observer.error(err)
                    });
                    break;
                case tiposConexion.API:
                    self.ejecutarQueryAPI(sql).subscribe({
                        next: (data) => observer.next(data),
                        complete: () => observer.complete(),
                        error: (err) => observer.error(err)
                    });
                    break;
            }
        });

        return observable;
    }

    // cargar todas las tablas en la base de datos
    private cargarTablasBD(): Observable<any> {
        const self = this;
        const observable = new Observable<any>(observer => {
            self.crearTablasFromFile().subscribe({
                next: () => {
                    observer.complete();
                },
                error: (err) => {
                    observer.error(err);
                }
            })
        });
        
        return observable;
    }

    // Ejecuta una consulta a la base de datos
    private ejecutarQueryFILE(sql: string) {
        const observable = new Observable<any>(observer => {
            const res = alasql(sql, (data) => {
                observer.next(data);
                observer.complete();
            }, (err) => {
                observer.error(err);
            })
        });

        return observable;
    }

    // Ejecuta una consulta a por medio de api
    private ejecutarQueryAPI(psql: string) {
        const self = this;
        const observable = new Observable<any>(observer => {
            const body = new FormData();
            body.append((self.op.opciones as OpcionesBDApi).parametroSQL, psql);
            const url = (self.op.opciones as OpcionesBDApi).url;
            self.http.post(url, body).subscribe({
                next: (data) => observer.next((data as string)),
                complete: () => observer.complete(),
                error: (err) => observer.error(err)
            });
        });

        return observable;
    }

    // Recupera los datos de todas las tablas de la base de datos desde los archivos correspondientes
    private crearTablasFromFile(): Observable<any> {
        const array = [];
        for (const item of (this.op.opciones as OpcionesBDFile).configTablas) {
            array.push(
                new Observable<any>(observer => {
                    alasql('SELECT * FROM CSV("' + item.pathArchivo + '",{separator:"' + item.separador + '"})', (data) => {
                        this.crearTabla(item, this.getCampos(data[0])).subscribe({
                            next: () => {
                                alasql.tables[item.nombreTabla].data = data;
                                observer.next();
                                observer.complete();
                            },
                            error: (err) => {
                                observer.error(err);
                            }
                        })
                    }, (err) => {
                        observer.error(err);
                    });
                })
            )
        }

        return forkJoin(array);
    }

    // Crear una tabla
    private crearTabla(item: PropiedadesTabla, campos: Campo[]): Observable<any> {
        const observable = new Observable<any>(observer => {
            let sql = 'CREATE TABLE ' + item.nombreTabla + ' (';
            for(const campo of campos) {
                sql = sql + '[' + campo.nombre + '] ' + campo.tipo + ',';
            }
            sql = sql.substr(0, sql.length-1) + ')';

            alasql(sql, (data) => {
                observer.next(data);
                observer.complete();
            }, (err) => {
                observer.error(err);
            });
        });

        return observable;
    }

    private getCampos(fila: any): Campo[] {
        const campos: Campo[] = [];
        let valor: any;
        let c: Campo;  
        let check: boolean;        

        let isFecha = () => {
            return !check && valor.match(/^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/);
        }
    
        let isHora = () => {
            return !check && valor.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/);
        }
    
        let isNumber = () => {
            return !check && (!isNaN(parseFloat(valor)));
        }
    
        let isBoolean = () => {
            return !check && ((valor === 'true') || (valor === 'false'));
        }

        for (const item in fila) {  
            check = false;
            valor = String(fila[item]);
            if(isFecha()) {   
                c = {
                    nombre: item,
                    tipo: 'FECHA'
                };
                check = true;
            }
            if(isHora()) {   
                c = {
                    nombre: item,
                    tipo: 'HORA'
                };
                check = true;
            }
            if(isNumber()) {
                c = {
                    nombre: item,
                    tipo: 'NUMBER'
                };
                check = true;
            }
            if(isBoolean()) {
                c = {
                    nombre: item,
                    tipo: 'BOOLEAN'
                };
                check = true;
            }
            if(!check) {
                c = {
                    nombre: item,
                    tipo: 'STRING'
                };
            }
            campos.push(c);
        }

        return campos;
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
