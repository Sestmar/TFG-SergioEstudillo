import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'landing',
    pathMatch: 'full'
  },
  {
    path: 'landing',
    loadChildren: () => import('./modules/landing/landing.module').then(m => m.LandingPageModule)
  },
  
  // --- ¡¡ESTA ES LA LÍNEA QUE FALTABA!! ---
  // Le decimos a Angular que cuando alguien vaya a '/auth',
  // cargue el módulo de autenticación (que ya arreglamos).
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule)
  },
  // -----------------------------------------

  // (Nota: El botón "Ver Todos los Equipos" seguirá sin funcionar
  // hasta que añadamos la ruta '/teams' aquí también)
  
  {
    path: '**',
    redirectTo: 'landing' // El comodín siempre al final
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}