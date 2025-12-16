import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'landing', pathMatch: 'full' },
  { 
    path: 'landing', 
    loadChildren: () => import('./modules/landing/landing.module').then(m => m.LandingPageModule) 
  },
  { 
    path: 'auth', 
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule) 
  },
  
  // USUARIO (Usa el UserModule que ya tenías)
  {
    path: 'user-dashboard',
    loadChildren: () => import('./modules/user/user.module').then(m => m.UserModule)
  },

  // JUGADOR (Usa el módulo nuevo que acabas de crear)
  {
    path: 'player-dashboard',
    loadChildren: () => import('./modules/players/pages/player-dashboard/player-dashboard.module').then(m => m.PlayerDashboardPageModule)
  },

  // ENTRENADOR (Usa el módulo nuevo que acabas de crear)
  {
    path: 'coach-dashboard',
    loadChildren: () => import('./modules/coach/pages/coach-dashboard/coach-dashboard.module').then(m => m.CoachDashboardPageModule)
  },

  { path: '**', redirectTo: 'landing' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}