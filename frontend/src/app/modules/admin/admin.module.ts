import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';

// Components
import { AdminDashboardPage } from './pages/admin-dashboard/admin-dashboard.page';

// Services
import { StatisticsService } from '@core/services/statistics.service';

const routes: Routes = [
  {
    path: 'dashboard',
    component: AdminDashboardPage
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];

@NgModule({
  declarations: [
    AdminDashboardPage
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  providers: [
    StatisticsService
  ]
})
export class AdminModule {}