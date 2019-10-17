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
import { Basedatos, tiposConexion, tiposArchivoBD } from 'alasql-angular';
import { HttpClient } from '@angular/common/http';

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
  }

  ejecutarSQL() {
    this.bd.query(this.sql).subscribe({
      next: (datos) => {
        this.resultado = '';
        this.resultado = JSON.stringify(datos);
      },
      error: (err) => {
        this.resultado = '';
        this.resultado = err.message;
      }
    });
  }

  private iniciarBDCSV() {
    // Configurar la base de datos
    this.bd = new Basedatos({
      nombre: 'prueba',
      tipoConexion: tiposConexion.FILE,
      opciones: {
        configTablas: [
          {
            nombreTabla: 'embalses',
            pathArchivo: './assets/embalses.csv',
            tipoArchivo: tiposArchivoBD.CSV,
            separador: ';',
            primaryKey: ['Numero_de_estacion', 'fecha']
          }
        ]
      }
    }, this.http);

    this.estados.push('Iniciando la carga de tablas...');
    let start = Date.now();
    this.bd.inicializarBD().subscribe({
      next: (tabla) => {
        const end = Date.now();
        this.estados.push('Tabla ' + tabla + ' cargada: ' + (end - start) + ' ms');
        start = Date.now();
      },
      complete: () => {
        this.estados.push('Inicialización de Base de datos completada');
      }
    });
  }
}
```
