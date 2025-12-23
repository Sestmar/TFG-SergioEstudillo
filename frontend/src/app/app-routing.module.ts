import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'landing', pathMatch: 'full' },
  
  // LANDING
  { 
    path: 'landing', 
    loadChildren: () => import('./modules/landing/landing.module').then(m => m.LandingPageModule) 
  },
  
  // AUTENTICACIÓN
  { 
    path: 'auth', 
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule) 
  },
  
  // USUARIO
  {
    path: 'user-dashboard',
    loadChildren: () => import('./modules/user/user.module').then(m => m.UserModule)
  },

  // JUGADOR
  {
    path: 'player-dashboard',
    loadChildren: () => import('./modules/players/pages/player-dashboard/player-dashboard.module').then(m => m.PlayerDashboardPageModule)
  },

  // ENTRENADOR
  {
    path: 'coach-dashboard',
    loadChildren: () => import('./modules/coach/pages/coach-dashboard/coach-dashboard.module').then(m => m.CoachDashboardPageModule)
  },

  // RUTA CREAR CONVOCATORIA
  {
    path: 'convocations/create',
    loadChildren: () => import('./modules/coach/pages/convocations/create-convocation.module').then( m => m.CreateConvocationPageModule)
  },

  // RUTA DE DETALLE (Con parámetro ID)
  {
    path: 'convocations/:id',
    loadChildren: () => import('./modules/coach/pages/convocations/convocation-details/convocation-details.module').then( m => m.ConvocationDetailsPageModule)
  },

  // ✅ RUTA GESTIONAR PLANTILLA
  // Al corregir el archivo my-team.module.ts, este error desaparecerá.
  {
    path: 'coach/my-team',
    loadChildren: () => import('./modules/coach/pages/my-team/my-team.module').then( m => m.MyTeamPageModule)
  },

  // ✅ RUTA DE PERFIL (Para todos los usuarios)
  {
    path: 'profile',
    loadChildren: () => import('./modules/user/pages/profile/profile.module').then( m => m.ProfilePageModule)
  },

  {
    path: 'tactics/:matchId',
    loadChildren: () => import('./modules/coach/pages/tactics/tactics.module').then( m => m.TacticsPageModule)
  },

  {
    path: 'match-detail/:id',
    loadChildren: () => import('./modules/match-detail/match-detail.module').then( m => m.MatchDetailPageModule)
  },

  {
    path: 'edit-match/:id',
    loadChildren: () => import('./modules/coach/pages/edit-match/edit-match.module').then( m => m.EditMatchPageModule)
  },

  // COMODÍN (Siempre al final)
  { path: '**', redirectTo: 'landing' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}