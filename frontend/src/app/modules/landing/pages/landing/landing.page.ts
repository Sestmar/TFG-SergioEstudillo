import { Component } from '@angular/core';
import { Observable, of } from 'rxjs';

// (Interfaz para que los datos de prueba funcionen)
interface Equipo {
  id: number;
  nombre: string;
  categoria: any;
  entrenador?: string;
}

@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
})
export class LandingPage {

  // Tus datos de prueba originales
  featuredTeams$: Observable<Equipo[]> = of([
    { id: 1, nombre: 'Equipo Senior A', categoria: 'Senior', entrenador: 'Carlos Ruiz' },
    { id: 2, nombre: 'Equipo Junior B', categoria: 'Junior', entrenador: 'Ana Martínez' },
    { id: 3, nombre: 'Equipo Infantil C', categoria: 'Infantil', entrenador: 'David López' }
  ]);
  
  // Tu HTML (del mensaje #68) usa la variable 'isLoading'
  isLoading = false; 

  constructor() {
    console.log('Landing page cargada correctamente');
  }

  // (Dejamos las funciones de navegación fuera 
  // para volver al estado "botones no funcionan")
}