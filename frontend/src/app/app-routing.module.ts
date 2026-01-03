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

  // ENTRENADOR (DASHBOARD)
  {
    path: 'coach-dashboard',
    loadChildren: () => import('./modules/coach/pages/coach-dashboard/coach-dashboard.module').then(m => m.CoachDashboardPageModule)
  },

  // --- OTRAS RUTAS DE COACH ---

  // 🔥 NUEVA RUTA: ESTADÍSTICAS DE EQUIPO
  {
    path: 'coach/stats',
    loadChildren: () => import('./modules/coach/pages/team-stats/team-stats.module').then( m => m.TeamStatsPageModule)
  },

  // GESTIONAR PLANTILLA
  {
    path: 'coach/my-team',
    loadChildren: () => import('./modules/coach/pages/my-team/my-team.module').then( m => m.MyTeamPageModule)
  },

  // PERFIL ENTRENADOR
  {
    path: 'coach/profile/:id',
    loadChildren: () => import('./modules/coach/pages/coach-profile/coach-profile.module').then( m => m.CoachProfilePageModule)
  },

  // CREAR CONVOCATORIA
  {
    path: 'convocations/create',
    loadChildren: () => import('./modules/coach/pages/convocations/create-convocation.module').then( m => m.CreateConvocationPageModule)
  },

  // DETALLE CONVOCATORIA
  {
    path: 'convocations/:id',
    loadChildren: () => import('./modules/coach/pages/convocations/convocation-details/convocation-details.module').then( m => m.ConvocationDetailsPageModule)
  },

  // PIZARRA TÁCTICA
  {
    path: 'tactics/:matchId',
    loadChildren: () => import('./modules/coach/pages/tactics/tactics.module').then( m => m.TacticsPageModule)
  },

  // EDITAR PARTIDO (ALINEACIÓN)
  {
    path: 'edit-match/:id',
    loadChildren: () => import('./modules/coach/pages/edit-match/edit-match.module').then( m => m.EditMatchPageModule)
  },

  // --- COMUNES / ADMIN ---

  {
    path: 'profile',
    loadChildren: () => import('./modules/user/pages/profile/profile.module').then( m => m.ProfilePageModule)
  },

  {
    path: 'match-detail/:id',
    loadChildren: () => import('./modules/match-detail/match-detail.module').then( m => m.MatchDetailPageModule)
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
    path: 'calendar',
    loadChildren: () => import('./modules/calendar/calendar.module').then( m => m.CalendarPageModule)
  },

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