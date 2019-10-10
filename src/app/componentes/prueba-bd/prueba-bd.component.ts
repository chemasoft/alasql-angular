
import { Component, OnInit } from '@angular/core';
import { Basedatos, tiposConexion, tiposArchivoBD } from 'projects/txt-sql/src/public-api';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-prueba-bd',
  templateUrl: './prueba-bd.component.html',
  styleUrls: ['./prueba-bd.component.css']
})
export class PruebaBDComponent implements OnInit {
  bd: Basedatos;

  estados: string[] = []; // Estados por los que va pasando la base de datos al abrirse
  sql = '';
  resultado: string;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.iniciarBDCSV();
    //this.iniciarBDAPI();
  }

  ejecutarSQL() {
    this.bd.query(this.sql);
  }

  private iniciarBDCSV() {
    // Configurar la base de datos
    this.bd = new Basedatos({
      tipoConexion: tiposConexion.FILE,
      opciones: {
        nombre: 'prueba',
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
        console.log("Inicialización de Base de datos completada");
      }
    });
  }

  private iniciarBDAPI() {
    // Configurar la base de datos
    this.bd = new Basedatos({
      tipoConexion: tiposConexion.API,
      opciones: {
        nombre: 'prueba',
        url: 'https://34.77.1.10/query',
        parametroSQL: 'sql'
      }
    }, this.http);

    this.bd.inicializarBD(); // Inicializar la Base de datos
  }
}
