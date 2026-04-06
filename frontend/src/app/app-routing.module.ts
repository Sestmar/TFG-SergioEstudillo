import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { NoAdminGuard } from './core/guards/no-admin.guard';

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
    loadChildren: () => import('./modules/user/user.module').then(m => m.UserModule),
    canActivate: [AuthGuard]
  },

  // JUGADOR
  {
    path: 'player-dashboard',
    loadChildren: () => import('./modules/players/pages/player-dashboard/player-dashboard.module').then(m => m.PlayerDashboardPageModule),
    canActivate: [AuthGuard]
  },

  // ENTRENADOR (DASHBOARD)
  {
    path: 'coach-dashboard',
    loadChildren: () => import('./modules/coach/pages/coach-dashboard/coach-dashboard.module').then(m => m.CoachDashboardPageModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'ENTRENADOR'] }
  },

  // --- OTRAS RUTAS DE COACH ---

  // ESTADÍSTICAS DE EQUIPO
  {
    path: 'coach/stats',
    loadChildren: () => import('./modules/coach/pages/team-stats/team-stats.module').then( m => m.TeamStatsPageModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'ENTRENADOR'] }
  },

  // GESTIONAR PLANTILLA
  {
    path: 'coach/my-team',
    loadChildren: () => import('./modules/coach/pages/my-team/my-team.module').then( m => m.MyTeamPageModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'ENTRENADOR'] }
  },

  // PERFIL ENTRENADOR
  {
    path: 'coach/profile/:id',
    loadChildren: () => import('./modules/coach/pages/coach-profile/coach-profile.module').then( m => m.CoachProfilePageModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'ENTRENADOR'] }
  },

  // CREAR CONVOCATORIA
  {
    path: 'convocations/create',
    loadChildren: () => import('./modules/coach/pages/convocations/create-convocation.module').then( m => m.CreateConvocationPageModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'ENTRENADOR'] }
  },

  // DETALLE CONVOCATORIA
  {
    path: 'convocations/:id',
    loadChildren: () => import('./modules/coach/pages/convocations/convocation-details/convocation-details.module').then( m => m.ConvocationDetailsPageModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'ENTRENADOR'] }
  },

  // PIZARRA TÁCTICA
  {
    path: 'tactics/:matchId',
    loadChildren: () => import('./modules/coach/pages/tactics/tactics.module').then( m => m.TacticsPageModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'ENTRENADOR'] }
  },

  // EDITAR PARTIDO (ALINEACIÓN)
  {
    path: 'edit-match/:id',
    loadChildren: () => import('./modules/coach/pages/edit-match/edit-match.module').then( m => m.EditMatchPageModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'ENTRENADOR'] }
  },

  // --- COMUNES ---

  {
    path: 'profile',
    loadChildren: () => import('./modules/user/pages/profile/profile.module').then( m => m.ProfilePageModule),
    canActivate: [AuthGuard]
  },

  {
    path: 'match-detail/:id',
    loadChildren: () => import('./modules/match-detail/match-detail.module').then( m => m.MatchDetailPageModule),
    canActivate: [AuthGuard]
  },

  {
    path: 'club',
    loadChildren: () => import('./modules/club/club.module').then( m => m.ClubPageModule),
    canActivate: [AuthGuard]
  },

  // ADMIN
  {
    path: 'admin',
    loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] }
  },

  {
    path: 'calendar',
    loadChildren: () => import('./modules/calendar/calendar.module').then( m => m.CalendarPageModule),
    canActivate: [AuthGuard]
  },

  {
    path: 'team-detail/:id',
    loadChildren: () => import('./modules/admin/pages/team-detail/team-detail.module').then( m => m.TeamDetailPageModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] }
  },

  {
    path: 'training-attendance/:id',
    loadChildren: () => import('./modules/admin/pages/training-attendance/training-attendance.module').then( m => m.TrainingAttendancePageModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'ENTRENADOR'] }
  },
  
  // CHAT
  {
    path: 'chat',
    loadChildren: () => import('./modules/chat/chat.module').then(m => m.ChatModule),
    canActivate: [AuthGuard, NoAdminGuard]
  },

  // COMODÍN (Siempre al final)
  { path: '**', redirectTo: 'landing' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}