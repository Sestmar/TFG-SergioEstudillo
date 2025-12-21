import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // ✅ Necesario para formularios
import { IonicModule } from '@ionic/angular';

import { CreateConvocationPage } from './create-convocation.page';

// ❌ AQUÍ BORRAMOS LAS RUTAS (const routes...) PARA EVITAR EL CONFLICTO

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule
  ],
  declarations: [CreateConvocationPage],
  exports: [CreateConvocationPage] // ✅ EXPORTAMOS LA PÁGINA PARA QUE EL DASHBOARD PUEDA USARLA
})
export class CreateConvocationPageModule {}