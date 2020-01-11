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
