
import { Component, OnInit } from '@angular/core';
import { Basedatos } from 'projects/txt-sql/src/public-api';
import { HttpClient } from '@angular/common/http';
import { parse } from 'url';
import * as parser from 'js-sql-parser';

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

  ejecutarSQL() {
    const ast = parser.parse('select * from dual');

    console.log(JSON.stringify(ast, null, 2));

  }

  ngOnInit() {
    // Configurar la base de datos
    this.bd = new Basedatos({
      nombre: 'prueba',
      configTablas: [  // Para este ejemplo cargamos la misma tabla varias veces
        {
          pathArchivo: './assets/embalses.csv',
          tipoArchivo: Basedatos.mscCSV,
          primaryKey: ['Numero_de_estacion', 'fecha'],
          separador: ';',
          nombreTabla: 'embalses'
        }
      ]
    }, this.http);

    this.estados.push('Iniciando la carga de tablas...');
    let start = Date.now();
    this.bd.cargarTablasBD().subscribe((nombre) => {
      const end = Date.now();
      this.estados.push('Tabla ' + nombre + ' cargada: ' + (end - start) + ' ms');
      start = Date.now();
    });

  }

}
