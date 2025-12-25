import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';

import { CoachDashboardPage } from './coach-dashboard.page';

// Importamos el módulo del modal para que Angular lo reconozca al abrirlo
import { CreateConvocationPageModule } from '../convocations/create-convocation.module';

const routes: Routes = [
  {
    path: '',
    component: CoachDashboardPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    // Mantenemos esto para que el Modal de "Nueva Convocatoria" funcione
    CreateConvocationPageModule 
  ],
  declarations: [CoachDashboardPage]
})
export class CoachDashboardPageModule {}