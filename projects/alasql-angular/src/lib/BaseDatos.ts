import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { OpcionesBD, tiposConexion, OpcionesBDApi, OpcionesBDFile, PropiedadesTabla, Campo } from './tipos';
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
            });
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
            });
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

    private insertarValores(item, data) {
        const lo = [];
        for (const fila of data) {
            const sql = 'INSERT INTO ' + item.nombreTabla + ' VALUES (' + this.getValores(fila) + ')';
            lo.push(
                new Observable<any>(o => {
                    alasql.promise(sql).then(() => {
                        o.complete();
                    }).catch((err) => {
                        o.error(err);
                    });
                })
            );
        }

        return forkJoin(lo);
    }

    // Recupera los datos de todas las tablas de la base de datos desde los archivos correspondientes
    private crearTablasFromFile(): Observable<any> {
        const self = this;
        const array = [];
        for (const item of (self.op.opciones as OpcionesBDFile).configTablas) {
            array.push(
                new Observable<any>(observer => {
                    alasql('SELECT * FROM CSV("' + item.pathArchivo + '",{separator:"' + item.separador + '"})', (data) => {
                        self.crearTabla(item, self.getCampos(data[0])).subscribe({
                            complete: () => {
                                self.insertarValores(item, data).subscribe({
                                    complete: () => {
                                        observer.next(item.nombreTabla);
                                        observer.complete();
                                    },
                                    error: (err) => {
                                        observer.error(err);
                                    }
                                });
                            },
                            error: (err) => {
                                observer.error(err);
                            }
                        });
                    }, (err) => {
                        observer.error(err);
                    });
                })
            );
        }

        return forkJoin(array);
    }

    // Crear una tabla
    private crearTabla(item: PropiedadesTabla, campos: Campo[]): Observable<any> {
        const observable = new Observable<any>(observer => {
            let sql = 'CREATE TABLE ' + item.nombreTabla + ' (';
            for (const campo of campos) {
                sql = sql + '[' + campo.nombre + '] ' + campo.tipo + ',';
            }
            sql = sql.substr(0, sql.length - 1) + ')';

            alasql(sql, (data) => {
                observer.complete();
            }, (err) => {
                observer.error(err);
            });
        });

        return observable;
    }

    private isFecha = (valor) => {
        return (
            // dd/mm/yyyy o dd-mm-yyyy
            valor.match(/^([0-2][0-9]|3[0-1])(\/|-)(0[1-9]|1[0-2])\2(\d{4})$/) ||
            // hh:mm
            valor.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/) ||
            // dd/mm/yyyy hh:mm o dd-mm-yyyy hh:mm
            valor.match(/^([0-2][0-9]|3[0-1])(\/|-)(0[1-9]|1[0-2])\2(\d{4})(\s)([0-1][0-9]|2[0-3])(:)([0-5][0-9])$/) ||
            // dd/mm/yyyy hh:mm:ss o dd-mm-yyyy hh:mm:ss
            valor.match(/^([0-2][0-9]|3[0-1])(\/|-)(0[1-9]|1[0-2])\2(\d{4})(\s)([0-1][0-9]|2[0-3])(:)([0-5][0-9])(:)([0-5][0-9])$/)
            );
    }

    private isNumber = (valor) => {
        return valor.match(/^[+-]?((\d+(\.\d*)?)|(\.\d+))$/);
    }

    private isBoolean = (valor) => {
        return valor.match(/^(true|false)$/);
    }


    private getValores(fila: any): string {
        let cadValores = '';
        let valor: any;
        let check: boolean;

        // tslint:disable-next-line: forin
        for (const item in fila) {
            check = false;
            valor = String(fila[item]);
            if (this.isNumber(valor)) {
                cadValores += valor + ',';
                check = true;
            }
            if (this.isBoolean(valor)) {
                cadValores += valor + ',';
                check = true;
            }
            if (this.isFecha(valor)) {
                cadValores += '\'' + valor + '\',';
                check = true;
            }
            if (!check) {
                cadValores += '\'' + valor + '\',';
            }
        }

        return cadValores.substr(0, cadValores.length - 1);
    }

    private getCampos(fila: any): Campo[] {
        const campos: Campo[] = [];
        let valor: any;

        // tslint:disable-next-line: forin
        for (const item in fila) {
            let c: Campo;
            valor = String(fila[item]);
            if (this.isNumber(valor)) {
                c = {
                    nombre: item,
                    tipo: 'NUMBER'
                };
            }
            if (this.isBoolean(valor)) {
                c = {
                    nombre: item,
                    tipo: 'BOOLEAN'
                };
            }
            if (this.isFecha(valor)) {
                c = {
                    nombre: item,
                    tipo: 'DATETIME'
                };
            }
            if (!c) {
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
