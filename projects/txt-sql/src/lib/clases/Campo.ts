// Es un campo del listdatos
export enum TipoDatos {
    string = 1,
    number = 2,
    date = 3,
    boolean = 4
}

export class Campo {
    private nombre: string;
    private tipo: TipoDatos;
    private valor: any;
    private visible: boolean;

    // Establece el tipo de dato
    private setTipoDato(val: string): void {
        let d: any;

        // Compruebo numero
        d = parseFloat(d);
        if (!isNaN(d)) {
            this.tipo = TipoDatos.number;
            this.valor = d;
            return;
        }

        // Compruebo fecha
        d = new Date(val);
        if (!isNaN(d.getTime())) {
            this.tipo = TipoDatos.date;
            this.valor = d;
            return;
        }

        // Compruebo boolean
        d = Boolean(val);
        if (!isNaN(d)) {
            this.tipo = TipoDatos.boolean;
            this.valor = d;
            return;
        }

        // En otro caso es string
        this.tipo = TipoDatos.string;
        this.valor = val;
    }


    public getNombre(): string {
        return this.nombre;
    }

    public setNombre(n: string) {
        this.nombre = n;
    }

    public getValor(): any {
        return this.valor;
    }

    public setvalor(v: string) {
        this.setTipoDato(v);
    }

    public getVisible(): boolean {
        return this.visible;
    }

    public setVisible(b: boolean) {
        this.visible = b;
    }

    public constructor() {
        this.visible = true;
    }

    // Establece el valor del campo y normaliza
    public setCampo(n: string, v: string): Campo {
        this.nombre = n;
        this.setTipoDato(v);

        this.normalizar();

        return this;
    }

    // Establece el campo sin normalizar
    public setCampoSN(n: string, v: string): Campo {
        this.nombre = n;
        this.setTipoDato(v);

        return this;
    }

    public setValor(v: string): Campo {
        this.setTipoDato(v);
        this.normalizar();
        return this;
    }

    public clonarVacio(): Campo {
        return(new Campo().setCampo(this.nombre, ''));
    }

    public clonar(): Campo {
        return(new Campo().setCampo(this.nombre, this.valor));
    }

    // Normaliza el nombre y el valor del campo
    private normalizar(): void {
        this.nombre = this.nombre.split(':').join('');
        this.nombre = this.nombre.split('---').join('0');
        this.nombre = this.nombre.split(' ').join('_');
        this.nombre = this.nombre.split('[').join('');
        this.nombre = this.nombre.split(']').join('');
        this.nombre = this.nombre.split('á').join('a');
        this.nombre = this.nombre.split('é').join('e');
        this.nombre = this.nombre.split('í').join('i');
        this.nombre = this.nombre.split('ó').join('o');
        this.nombre = this.nombre.split('ú').join('u');
        this.nombre = this.nombre.split('ü').join('u');
        this.nombre = this.nombre.split('ñ').join('n');
        this.nombre = this.nombre.split('\r').join('');

        this.valor = this.valor.split('---').join('0');
        this.valor = this.valor.split('\r').join('');
        // this.valor = this.valor.split(',').join('.');
    }
}
