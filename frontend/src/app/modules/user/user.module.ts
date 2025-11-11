import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';

// Components
import { UserDashboardPage } from './pages/user-dashboard/user-dashboard.page';

// Services
import { UserService } from '@core/services/user.service';

const routes: Routes = [
  {
    path: 'dashboard',
    component: UserDashboardPage
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];

@NgModule({
  declarations: [
    UserDashboardPage
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  providers: [
    UserService
  ]
})
export class UserModule {}