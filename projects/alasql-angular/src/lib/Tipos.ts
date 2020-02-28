// Definición de tipos

// Interfaz para las distintas opciones de la base de datos
export enum tiposConexion {
    FILE,
    API,
    GRAPHQL
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

export interface OpcionesBDGrapthQL {
    url: string;
}

export interface OpcionesBD {
    nombre: string; // Nombre de la base de datos
    tipoConexion: tiposConexion;
    opciones: OpcionesBDApi | OpcionesBDFile | OpcionesBDGrapthQL;
}

// Propiedades de cada tabla de la base de datos
export interface PropiedadesTabla {
    nombreTabla: string;
    pathArchivo: string; // ruta del archivo a cargar
    tipoArchivo: tiposArchivoBD; // tipo del archivo a cargar
    separador: string; // Valido para los archivos csv
    primaryKey: string[]; // Clave primaria de la tabla
    indices: Index[]; // Indices de la tabla
}

// Indices de una tabla
export interface Index {
    nombre: string;     // Nombre del indice
    campos: string[];   // Campos del indice
}

export interface Campo {
    nombre: string;
    tipo: string;
}

// alasql Tipos

import * as xlsx from 'xlsx';

export interface AlaSQLCallback {
    (data?: any, err?: Error): void;
}

export interface AlaSQLOptions {
    errorlog: boolean;
    valueof: boolean;
    dropifnotexists: boolean; // drop database in any case
    datetimeformat: string; // how to handle DATE and DATETIME types
    casesensitive: boolean; // table and column names are case sensitive and converted to lower-case
    logtarget: string; // target for log. Values: 'console', 'output', 'id' of html tag
    logprompt: boolean; // print SQL at log
    modifier: any; // values: RECORDSET, VALUE, ROW, COLUMN, MATRIX, TEXTSTRING, INDEX
    columnlookup: number; // how many rows to lookup to define columns
    autovertex: boolean; // create vertex if not found
    usedbo: boolean; // use dbo as current database (for partial T-SQL comaptibility)
    autocommit: boolean; // the AUTOCOMMIT ON | OFF
    cache: boolean; // use cache
    nocount: boolean; // for SET NOCOUNT OFF
    nan: boolean; // check for NaN and convert it to undefined
    angularjs: boolean;
    tsql: boolean;
    mysql: boolean;
    postgres: boolean;
    oracle: boolean;
    sqlite: boolean;
    orientdb: boolean;
}

// compiled Statement
export interface AlaSQLStatement {
    (params?: any, cb?: AlaSQLCallback, scope?: any): any;
}

// abstract Syntax Tree
export interface AlaSQLAST {
    compile(databaseid: string): AlaSQLStatement;
}

// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/es6-promise/es6-promise.d.ts
export interface Thenable<T> {
    then<U>(onFulfilled?: (value: T) => U | Thenable<U>, onRejected?: (error: any) => U | Thenable<U>): Thenable<U>;
    then<U>(onFulfilled?: (value: T) => U | Thenable<U>, onRejected?: (error: any) => void): Thenable<U>;
    catch<U>(onRejected?: (error: any) => U | Thenable<U>): Thenable<U>;
}

// see https://github.com/agershun/alasql/wiki/User%20Defined%20Functions
export interface userDefinedFunction {
    (x: any): any;
}
export interface userDefinedFunctionLookUp {
    [x: string]: userDefinedFunction;
}
// see https://github.com/agershun/alasql/wiki/User%20Defined%20Functions
export interface userAggregator {
    (value: any, accumulator: any, stage: number): any;
}
export interface userAggregatorLookUp {
    [x: string]: userAggregator;
}

export interface AlaSQL {
    options: AlaSQLOptions;
    error: Error;
    (sql: any, params?: any, cb?: AlaSQLCallback, scope?: any): any;
    parse(sql: any): AlaSQLAST;
    promise(sql: any, params?: any): Thenable<any>;
    fn: userDefinedFunctionLookUp;
    aggr: userAggregatorLookUp;
    autoval(tablename: string, colname: string, getNext?:boolean): number;
    yy:{};
    setXLSX(xlsxlib: typeof xlsx): void;
}

