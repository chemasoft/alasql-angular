import { Fila } from './Fila';
import { Campo } from './Campo';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Clase donde se almacenan los datos

export interface Iquery {
    nombreCampos: string[];
    comparadores: string[];
    valores: any[];
}
export class Tabla {
    private datos: Fila[] = []; // Lista de filas
    private primaryKey: string[]; // Establece los campos que son la clave primaria

    constructor(private http: HttpClient) {}

    public setPrimaryKey(primaryKey: string[]) {
        this.primaryKey = primaryKey;
    }

    // Devuelve la primary key
    getPrimaryKey(): string[] {
        return this.primaryKey;
    }

    // Devuelve el array de filas de datos
    public getDatos(): Fila[] {
        return this.datos;
    }

    // Cargar CSV en Tabla
    public cargarCSV(readPath: string, separador: string): Observable<Tabla> {
        const observable = new Observable<Tabla>(observer => {
            this.http.get(readPath, { responseType: 'text' }).subscribe(data => {
                const lineas = data.split('\n'); // Dividimos en lineas
                // leemos la cabecera
                const cab: string[] = [];
                for (const campo of lineas[0].split(separador)) {
                    cab.push(campo);
                }
                // Añadimos los datos
                for (let i = 1; i < lineas.length; i++) {
                    if (lineas[i] !== '') {
                        const fila: Fila = new Fila(this.primaryKey);
                        const campos = lineas[i].split(separador);
                        for (let j = 0; j < campos.length; j++) {
                            const val = campos[j];
                            fila.addCampo(new Campo().setCampo(cab[j], val));
                        }
                        this.datos.push(fila);
                    }
                }
                observer.next(this);
            });
        });

        return observable;
    }

    // Devuelve la ultima fila, si no hay devuelve vacia
    public getUltimaFila(): Fila {
        if (this.datos.length > 0) {
            return this.datos[this.datos.length - 1];
        } else {
            this.datos.push(new Fila(this.primaryKey));
            return this.datos[this.datos.length - 1];
        }
    }

    // Añade una fila a los datos
    public addFila(f: Fila): void {
        this.datos.push(f);
    }

    // Añade una nueva fila vacia al Tabla con la misma estructura ya existente
    public addNewFila(): Fila {
        let f: Fila;
        if (this.datos.length > 0) {
            f = this.datos[this.datos.length - 1].clonarVacio();
            this.datos.push(f);
            return f;
        } else {
            f = new Fila(this.primaryKey);
            this.datos.push(f);
            return f;
        }
    }

    // Solo muestra las columnas que me interesan
    public mostrarColumnas(columnas: string[]): Tabla {
        for (const fila of this.datos) {
            fila.mostrarColumnas(columnas);
        }

        return this;
    }

    // Trunca una columna del Tabla
    public truncarColumna(nomCampo: string, posInicial: number, numCaracteres?: number) {
        for (const fila of this.datos) {
            if (numCaracteres) {
                fila.getCampoName(nomCampo).setvalor(fila.getCampoName(nomCampo).getValor().substring(posInicial, numCaracteres));
            } else {
                fila.getCampoName(nomCampo).setValor(
                    fila.getCampoName(nomCampo).getValor().substring(posInicial, fila.getCampoName(nomCampo).getValor().length));
            }
        }

        return this;
    }

    // filtro OR, unir 2 Tablas
    public UNION(datos: Tabla): Tabla {
        let encontrado: boolean;
        for (const fila of datos.getDatos()) { // Fila que voy a insertar
            for (const item of this.datos) {   // Fila que voy a ampliar
                encontrado = true;
                for (const key of this.primaryKey) {
                    if (item.getCampoName(key).getNombre() !== fila.getCampoName(key).getNombre()) {
                        encontrado = false;
                    }
                }
                if (encontrado) { // En este caso uno las filas
                    item.unirFilas(fila);
                }
            }
        }

        return this;
    }

    // Filtro AND
    public AND(pQuery: Iquery): Tabla {
        const d: Tabla = new Tabla(this.http);

        // Dada una fila devuelve true si se cumple el criterio y false en otro caso
        const comprobarCriterio = (fila: Fila, q: Iquery): boolean => {
            for (const [i, nom] of q.nombreCampos.entries()) {
                switch (q.comparadores[i]) {
                    case '=':
                        if (fila.getCampoName(nom).getValor() !== q.valores[i]) {
                            return(false);
                        }
                        break;
                    case '!=':
                        if (fila.getCampoName(nom).getValor() === q.valores[i]) {
                            return(false);
                        }
                        break;
                    case '>':
                        if (fila.getCampoName(nom).getValor() <= q.valores[i]) {
                            return(false);
                        }
                        break;
                    case '<':
                        if (fila.getCampoName(nom).getValor() >= q.valores[i]) {
                            return(false);
                        }
                        break;
                    case '>=':
                        if (fila.getCampoName(nom).getValor() < q.valores[i]) {
                            return(false);
                        }
                        break;
                    case '<=':
                        if (fila.getCampoName(nom).getValor() > q.valores[i]) {
                            return(false);
                        }
                        break;
                }
            }

            return(true);
        };

        for (const fila of this.datos) {
            if (comprobarCriterio(fila, pQuery)) {
                d.addFila(fila);
            }
        }

        return d;
    }

    // Agrupar por varios campos
    public agruparPorCampo(nomcampo: string[]): Tabla {
        const ldatos: Tabla = new Tabla(this.http);
        const valCampo: string[][] = [];
        const arraysIguales = (a1: string[], a2: string[]) => {
            for (const [i, a] of a1.entries()) {
                if (a !== a2[i]) {
                    return(false);
                }
            }
            return(true);
        };
        const existe = (valor: string[]) => {
            for (const aux of valCampo) {
                if (arraysIguales(aux, valor)) {
                    return(true);
                }
            }
            return false;
        };

        for (const item of this.datos) {
            const val: string[] = [];
            for (const nom of nomcampo) {
                val.push(item.getCampoName(nom).getValor());
            }
            if (!existe(val)) {
                valCampo.push(val);
                ldatos.addFila(item); // Si aun no existe añado la fila
            }
        }

        return ldatos;
    }


    // Dada una columna hace un split y crea nuevas columnas
    public splitColumna(nomCol: string, simbolo: string, nuevosNombres: string[]): Tabla {
        for (const fila of this.datos) {
            const aux = fila.getCampoName(nomCol).getValor().split(simbolo);
            for (const [i, nom] of nuevosNombres.entries()) {
                const c = new Campo();
                c.setCampoSN(nom, aux[i]);
                fila.addCampo(c);
            }
        }

        return this;
    }

    // Añade una columna calculada, los campos empiezan van entre []
    public addColumnaCalculada(nomCampo: string, expresion: string): Tabla {
        let pos: number;
        let aux: string;
        let op1: number;
        let op2: number;
        let operacion: string;
        let item: string;
        let acumulador: number;

        const inicializarVbles = () => {
            pos = 1;
            aux = '';
            op1 = 0;
            op2 = 0;
            operacion = '';
            item = '';
            acumulador = 0;
        };

        for (const fila of this.datos) {
            inicializarVbles();
            for (const caracter of expresion) {
                switch (pos) {
                    case 1:
                        switch (caracter) {
                            case '[':
                                item += aux;
                                aux = '';
                                pos = 2;
                                break;
                            default:
                                aux += caracter;
                                break;
                        }
                        break;
                    case 2:
                        switch (caracter) {
                            case ']':
                                pos = 3;
                                break;
                            default:
                                aux += caracter;
                                break;
                        }
                        break;
                    case 3:
                        switch (caracter) {
                            case '[':
                                if (aux.length > 0) {
                                    item += fila.getCampoName(aux).getValor();
                                    aux = '';
                                } else {
                                    item += acumulador;
                                }
                                pos = 2;
                                break;
                            case '+': case '-': case '*': case '/':
                                operacion = caracter; // Tomo la operación
                                if (aux.length > 0) {
                                    op1 = parseFloat(fila.getCampoName(aux).getValor());
                                    aux = '';
                                } else {
                                    op1 = acumulador;
                                }
                                pos = 4;
                                break;
                            default:
                                if (aux.length > 0) {
                                    item += fila.getCampoName(aux).getValor();
                                    aux = '';
                                } else {
                                    item += acumulador;
                                }
                                aux += caracter;
                                pos = 1;
                                break;
                        }
                        break;
                    case 4:
                        switch (caracter) {
                            case '[':
                                pos = 5;
                                break;
                        }
                        break;
                    case 5:
                        switch (caracter) {
                            case ']':
                                op2 = parseFloat(fila.getCampoName(aux).getValor());
                                aux = '';
                                switch (operacion) {
                                    case '+':
                                        acumulador = op1 + op2;
                                        break;
                                    case '-':
                                        acumulador = op1 - op2;
                                        break;
                                    case '*':
                                        acumulador = op1 * op2;
                                        break;
                                    case '/':
                                        acumulador = op1 / op2;
                                        break;
                                }
                                pos = 3;
                                break;
                            default:
                                aux += caracter;
                                break;
                        }
                        break;
                }
            }

            // Final de cadena
            switch (pos) {
                case 1:
                    if (aux.length > 0) {
                        item += aux;
                    }
                    break;
                case 2:
                    if (aux.length > 0) {
                        console.log('Expresión incorrecta');
                    }
                    break;
                case 3:
                    if (aux.length > 0) {
                        item += fila.getCampoName(aux).getValor();
                    } else {
                        item += acumulador;
                    }
                    break;
                case 4:
                    if (aux.length > 0) {
                        console.log('Expresión incorrecta');
                    }
                    break;
                case 5:
                    if (aux.length > 0) {
                        console.log('Expresión incorrecta');
                    }
                    break;
            }

            // Añadimos el campo a la fila
            const c = new Campo();
            c.setCampoSN(nomCampo, item);
            fila.addCampo(c);
        }

        return this;
    }
}
