# alasql-angular

It provides a class called BaseDatos, used to incorporate a set of local files of type CSV, into the browser's memory, as if they were tables, and then be able to use them through SQL queries, as a relational database, for this purpose it is used alasql library

Proporciona una clase llamada BaseDatos, utilizada para incorporar un conjunto de ficheros locales de tipo CSV, a la memoria del navegador, como si se tratara de tablas, y posteriormente poder usarlas mediante consultas SQL, como una base de datos relacional, para ello se utiliza la libreria alasql.

- IMPORTANT NOTE: If you want to use the alasql library directly, we only do Step 1, and write the following code:
- NOTA IMPORTANTE: Si se quiere usar la libreria alasql directamente, hacemos solo el Paso 1, y escribimos el siguiente código:

```
import { Basedatos } from 'alasql-angular';

const bd: Basedatos();
bd.alasql;

......
```

- Paso 1: Abre el fichero index.html de tu proyecto angular e incluye el CDN de alasql dentro del body https://cdn.jsdelivr.net/npm/alasql@0.5.3

- Paso 2: Importa las siguientes clases, donde las necesitas:
import { Basedatos, tiposConexion, tiposArchivoBD } from 'alasql-angular';

- Paso 3: Codigo de ejemplo:

```
import { Component, OnInit, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Basedatos, tiposConexion, tiposArchivoBD } from 'alasql-angular';

@Component({
  selector: 'app-prueba-bd',
  templateUrl: './prueba-bd.component.html',
  styleUrls: ['./prueba-bd.component.css']
})
export class PruebaBDComponent implements OnInit {
  public sql = '';

  bd: Basedatos;
  estados: string[] = []; // Estados por los que va pasando la base de datos al abrirse
  resultado: string;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.iniciarBDCSV();
    // this.iniciarBDAPI();
  }

  async ejecutarSQL() {
    try {
      const datos = await this.bd.query(this.sql);
      this.resultado = '';
      this.resultado = JSON.stringify(datos);
    } catch(err) {
      this.resultado = '';
      this.resultado = err.message;
    }
  }

  private async iniciarBDCSV() {
    // Configurar la base de datos
    this.bd = new Basedatos({
      nombre: 'prueba',
      tipoConexion: tiposConexion.FILE,
      opciones: {
        configTablas: [
          {
            nombreTabla: 'embalses1',
            pathArchivo: './assets/embalses1.csv',
            tipoArchivo: tiposArchivoBD.CSV,
            separador: ';',
            primaryKey: ['Numero_de_estacion', 'fecha'],
            indices: [{nombre: 'idx1', campos: ['LocalX']}]
          },
          {
            nombreTabla: 'embalses2',
            pathArchivo: './assets/embalses2.csv',
            tipoArchivo: tiposArchivoBD.CSV,
            separador: ';',
            primaryKey: ['Numero_de_estacion', 'fecha'],
            indices: [{nombre: 'idx1', campos: ['LocalX','LocalY']}]
          },
          {
            nombreTabla: 'embalses3',
            pathArchivo: './assets/embalses3.csv',
            tipoArchivo: tiposArchivoBD.CSV,
            separador: ';',
            primaryKey: ['Numero_de_estacion', 'fecha'],
            indices: []
          }
        ]
      }
    }, this.http);

    // new Test(this.bd).iniTest();

    this.estados.push('Iniciando la carga de tablas...');
    let start = Date.now();
    await this.bd.inicializarBD();
    const end = Date.now();
    this.estados.push('Inicialización de Base de datos completada...' + (end - start) + ' ms');
  }

  private iniciarBDAPI() {
    // Configurar la base de datos
    this.bd = new Basedatos({
      nombre: 'prueba',
      tipoConexion: tiposConexion.API,
      opciones: {
        url: 'http://localhost:3000/query/',
        parametroSQL: 'sql'
      }
    }, this.http);

    this.bd.inicializarBD(); // Inicializar la Base de datos
  }
}
```