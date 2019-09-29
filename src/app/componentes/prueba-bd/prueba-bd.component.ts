
import { Component, OnInit } from '@angular/core';
import { Basedatos } from 'projects/txt-sql/src/public-api';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-prueba-bd',
  templateUrl: './prueba-bd.component.html',
  styleUrls: ['./prueba-bd.component.css']
})
export class PruebaBDComponent implements OnInit {
  bd: Basedatos;
  
  estado: string;
  sql: string;
  resultado: string;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    //Configurar la base de datos
    this.bd = new Basedatos({
      nombre: 'prueba',
      configTablas: [
        {
          pathArchivo: './assets/embalses.csv',
          tipoArchivo: Basedatos.mscCSV,
          primaryKey: ['Numero_de_estacion','fecha'],
          separador: ';',
          nombreTabla: 'embalses'
        }
      ]
    }, this.http);

    this.estado = 'Iniciando la carga de tablas';
    this.bd.cargarTablasBD().subscribe((nombre) => {
      this.estado += 'Tabla ' + nombre + ' cargada' + '\n'; 
    });

  }

}
