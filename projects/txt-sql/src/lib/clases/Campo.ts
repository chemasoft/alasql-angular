// Es un campo del listdatos
export class Campo {
    private nombre: string;
    private valor: string;
    private visible: boolean;

    public getNombre(): string {
        return this.nombre;
    }

    public setNombre(n: string) {
        this.nombre = n;
    }

    public getValor(): string {
        return this.valor;
    }

    public setvalor(v: string) {
        this.valor = v;
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
    public setCampo(n: string, v: any): Campo {
        this.nombre = n;
        this.valor = v;

        this.normalizar();

        return this;
    }

    // Establece el campo sin normalizar
    public setCampoSN(n: string, v: any): Campo {
        this.nombre = n;
        this.valor = v;

        return this;
    }

    public setValor(v: any): Campo {
        this.valor = v;
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
