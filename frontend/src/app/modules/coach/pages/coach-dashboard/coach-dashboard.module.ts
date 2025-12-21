import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';

import { CoachDashboardPage } from './coach-dashboard.page';
import { CreateConvocationPageModule } from '../convocations/create-convocation.module';

// ✅ IMPORTAMOS EL MÓDULO (Asegúrate de que la ruta del archivo es correcta)
// Si está en una carpeta hermana suele ser '../create-convocation/create-convocation.module'

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
    
    // ✅ LO MANTENEMOS AQUÍ: 
    // Ahora que le quitamos las rutas al otro archivo, esto solo carga 
    // la lógica visual para que el Modal funcione bien.
    CreateConvocationPageModule
  ],
  declarations: [CoachDashboardPage]
})
export class CoachDashboardPageModule {}