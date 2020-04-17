import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OpcionesBD, tiposConexion, OpcionesBDApi, OpcionesBDFile, PropiedadesTabla, Campo, AlaSQL } from './Tipos';
declare let alasql;

// Clase base de datos
export class Basedatos {
    private op: OpcionesBD; // Opciones de la base de datos
    public alasql: AlaSQL

    constructor(op?: OpcionesBD, private http?: HttpClient) {
        if(op) this.op = op;
        if(http) this.http = http;
        this.alasql = alasql;
    }

    // Inicializar la Base de datos
    public async inicializarBD() {
        switch (this.op.tipoConexion) {
            case tiposConexion.FILE:
                try{
                    const datos = await this.getDatosFromFile();
                    await this.crearTablas(datos);
                    this.insertarDatosEnTablas(datos);
                    await this.crearIndices();     
                } catch(err) {
                    throw err;
                }
                break;
            case tiposConexion.API:
                break;
        }
    }

    // Ejecutar una consulta en la base de datos
    public async query(query: string) {
        switch (this.op.tipoConexion) {
            case tiposConexion.FILE:
                try {
                    return await this.ejecutarQueryFILE(query);
                } catch(err) {
                    throw err;
                }
            case tiposConexion.API:
                try {
                    return await this.ejecutarQueryAPI(query);
                } catch(err) {
                    throw err;
                }
            case tiposConexion.GRAPHQL:
                try {
                    return await this.ejecutarQueryGraphQL(query);
                } catch(err) {
                    throw err;
                }
        }
    }

    // Ejecuta una consulta a la base de datos
    private async ejecutarQueryFILE(sql: string) {
        return await alasql.promise(sql);
    }

    // // Ejecuta una consulta a por medio de api
    // private async ejecutarQueryAPI(psql: string) {
    //     const body = new FormData();
    //     body.append((this.op.opciones as OpcionesBDApi).parametroSQL, psql);
    //     const url = (this.op.opciones as OpcionesBDApi).url;
    //     return this.http.post(url, body).toPromise();
    // }

    // Ejecuta una consulta a por medio de api
    private async ejecutarQueryAPI(psql: string) {
        const query = (this.op.opciones as OpcionesBDApi).parametroSQL + "="+ psql;
        const url = (this.op.opciones as OpcionesBDApi).url;
        const cabeceras = new HttpHeaders().set('Content-Type','application/x-www-form-urlencoded');
        return this.http.post(url, query, {headers: cabeceras}).toPromise();
    }


    // Ejecuta una consulta a por medio de api
    private async ejecutarQueryGraphQL(psql: string) {
        const body = JSON.stringify({
            query: psql,
            variables: {}
        });
        const url = (this.op.opciones as OpcionesBDApi).url;
        return this.http.post(url, body).toPromise();
    }


    private async insertarValores(item, data) {
        for (const fila of data) {
            const sql = 'INSERT INTO ' + item.nombreTabla + ' VALUES (' + this.getValores(fila) + ')';
            await alasql.promise(sql);
        }
    }
    
    // Crear indices de las tablas
    private async crearIndices() {
        for(const item of (this.op.opciones as OpcionesBDFile).configTablas) {
            if(item.indices.length > 0) {
                let sql = '';
                for(const index of item.indices) {
                    sql = 'CREATE INDEX ' + index.nombre + ' ON ' + item.nombreTabla + ' (';
                    for(const [i,campo] of index.campos.entries()) {
                        sql = sql + '[' + index.campos[i] + '],';
                    }
                    sql = sql.substr(0, sql.length - 1) + ')';
                }                
                
                await alasql.promise(sql);
            }
        }
    }

    // Recupera todos los datos desde los archivos
    private async getDatosFromFile() {
        const datos = []; // Array de datos
        for (const item of (this.op.opciones as OpcionesBDFile).configTablas) {
            await alasql.promise('SELECT * FROM CSV("' + item.pathArchivo + '",{separator:"' + item.separador + '"})').then((data) => {
                datos.push(data);
            }).catch(err => {
                throw err;
            });
        }
        return datos;
    }

    // Crear Todas las tablas en la base de datos
    private async crearTablas(datos: any[]) {
        for (const [i,item] of (this.op.opciones as OpcionesBDFile).configTablas.entries()) {
            const campos = this.getCampos(datos[i][0]);
            let sql = 'CREATE TABLE ' + item.nombreTabla + ' (';
            for (const campo of campos) {
                if(this.esClave(campo.nombre,item)) {
                    sql = sql + '[' + campo.nombre + '] ' + campo.tipo + ' PRIMARY KEY,';
                } else {
                    sql = sql + '[' + campo.nombre + '] ' + campo.tipo + ',';
                }                
            }
            sql = sql.substr(0, sql.length - 1) + ')';

            await alasql.promise(sql);
        }
    }

    // Crear Todas las tablas en la base de datos
    private insertarDatosEnTablas(datos: any[]) {
        for (const [i,item] of (this.op.opciones as OpcionesBDFile).configTablas.entries()) {
            alasql.tables[item.nombreTabla].data = datos[i];
        }
    }

    // Es clave
    private esClave(campo: string, pt: PropiedadesTabla): boolean {
        for(const key of pt.primaryKey) {
            if(campo === key) {
                return true;
            }
        }
        return false;
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
;