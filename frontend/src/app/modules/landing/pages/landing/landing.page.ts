import { Component } from '@angular/core';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
})
export class LandingPage {
  featuredTeams$: Observable<any[]> = of([
    { nombre: 'Equipo Senior A', categoria: 'Senior', entrenador: 'Carlos Ruiz' },
    { nombre: 'Equipo Junior B', categoria: 'Junior', entrenador: 'Ana Martínez' },
    { nombre: 'Equipo Infantil C', categoria: 'Infantil', entrenador: 'David López' }
  ]);

  constructor() {
    console.log('Landing page cargada correctamente');
  }
}