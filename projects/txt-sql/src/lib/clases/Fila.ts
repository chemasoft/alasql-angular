import {Campo} from './Campo';

// Lista de campos
export class Fila {
    private campos: Campo[] = []; // Lista de campos
    private terminada: boolean; // La fila esta terminada
    private primaryKey: string[]; // Establece los campos que son la clave primaria

    public constructor(primaryKey: string[]) {
        this.terminada = false; // Se crea la fila como no terminada
        this.primaryKey = primaryKey;
    }

    public getValorPrimaryKey(): string {
        let cad = '';
        for (const item of this.primaryKey) {
            cad += this.getCampoName(item).getValor();
            cad += '_';
        }
        return cad.slice(0, -1);
    }

    // Union de dos filas
    public unirFilas(fila: Fila): void {
        for (const c1 of fila.getCampos()) {
            let existe = false;
            for (const c2 of this.campos) {
                if (c1.getNombre() === c2.getNombre()) {
                    existe = true;
                    break;
                }
            }
            if (!existe) { // Solo en este caso lo añado a la fila
                this.addCampo(c1);
            }
        }
    }

    public setCampos(campos: Campo[]): void {
        this.campos = campos;
    }

    public getCampos(): Campo[] {
        return this.campos;
    }

    public setTerminada(): void {
        this.terminada = true;
    }

    public getTerminada(): boolean {
        return this.terminada;
    }

    public addCampo(campo: Campo): void {
        this.campos.push(campo);
    }

    public getCampoName(name: string): Campo {
        for (const c of this.campos) {
            if (c.getNombre() === name) {
                return c;
            }
        }

        return new Campo();
    }

    public getCampoPos(pos: number): Campo {
        return this.campos[pos];
    }

    public mostrarColumnas(columnas: string[]) {
        for (const campo of this.campos) {
            campo.setVisible(false);
            for (const nom of columnas) {
                if (campo.getNombre() === nom) {
                    campo.setVisible(true);
                    break;
                }
            }
        }
    }

    public size(): number {
        return this.campos.length;
    }

    public clonarVacio(): Fila {
        const campos: Campo[] = [];
        const fila: Fila = new Fila(this.primaryKey);
        for (const c of this.campos) {
            campos.push(c.clonarVacio());
        }
        fila.setCampos(campos);
        if (this.terminada) {
            fila.setTerminada();
        }
        return fila;
    }

    public clonar(): Fila {
        const campos: Campo[] = [];
        const fila: Fila = new Fila(this.primaryKey);
        for (const c of this.campos) {
            campos.push(c.clonar());
        }
        fila.setCampos(campos);
        if (this.terminada) {
            fila.setTerminada();
        }
        return fila;
    }
}
