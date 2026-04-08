import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';

// Componente
import { AdminDashboardPage } from './pages/admin-dashboard/admin-dashboard.page';
import { UserEditModalComponent } from './components/user-edit-modal/user-edit-modal.component';

// Rutas
const routes: Routes = [
  {
    path: '', // Si entran a /admin, carga el dashboard
    component: AdminDashboardPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    AdminDashboardPage,
    UserEditModalComponent
  ]
})
export class AdminModule {}