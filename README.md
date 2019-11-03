# alasql-angular

Proporciona una clase BaseDatos, utilizada para incorporar un conjunto de ficheros locales CSV, al almacenamiento IndexedBD del navegador, y posteriormente poder usarlo mediante consultas SQL, como si se tratara de una base de datos relacional, para ello utiliza la libreria alasql

## Instalación

- Paso 1: Abre el fichero index.html de tu proyecto angular e incluye el CDN de alasql dentro del body 
<script src="https://cdn.jsdelivr.net/npm/alasql@0.5"></script>

- Paso 2: Importa la clase BaseDatos, donde la necesitas:
import { Basedatos } from 'alasql-angular';

- Paso 3: Codigo de ejemplo:

```
import { Component, OnInit, Input } from '@angular/core';
import { Basedatos } from 'projects/alasql-angular/src/public-api';
import { HttpClient } from '@angular/common/http';
import { tiposConexion, tiposArchivoBD } from '../../../../projects/alasql-angular/src/lib/Tipos';

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
