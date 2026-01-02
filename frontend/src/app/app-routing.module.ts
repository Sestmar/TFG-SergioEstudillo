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

  // RUTA GESTIONAR PLANTILLA
  {
    path: 'coach/my-team',
    loadChildren: () => import('./modules/coach/pages/my-team/my-team.module').then( m => m.MyTeamPageModule)
  },

  // RUTA DE PERFIL DE USUARIO GENÉRICO
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

  {
    path: 'club',
    loadChildren: () => import('./modules/club/club.module').then( m => m.ClubPageModule)
  },

  {
    path: 'admin',
    loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule)
  },

  {
    path: 'coach/profile/:id',
    loadChildren: () => import('./modules/coach/pages/coach-profile/coach-profile.module').then( m => m.CoachProfilePageModule)
  },

  // 🔥 CORRECCIÓN 1: Quitamos el .ts de la importación
  {
    path: 'calendar',
    loadChildren: () => import('./modules/calendar/calendar.module').then( m => m.CalendarPageModule)
  },

  // 🔥 CORRECCIÓN 2: Aseguramos la ruta correcta (sin .ts y verificando path)
  {
    path: 'team-detail/:id',
    loadChildren: () => import('./modules/admin/pages/team-detail/team-detail.module').then( m => m.TeamDetailPageModule)
  },

  // COMODÍN (Siempre al final)
  { path: '**', redirectTo: 'landing' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}