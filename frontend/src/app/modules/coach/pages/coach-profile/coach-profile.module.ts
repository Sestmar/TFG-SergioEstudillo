import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';

import { CoachProfilePage } from './coach-profile.page';

// Definimos la ruta interna del módulo
const routes: Routes = [
  {
    path: '',
    component: CoachProfilePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    // Importante: forChild para que funcione el Lazy Loading
    RouterModule.forChild(routes) 
  ],
  declarations: [CoachProfilePage]
})
export class CoachProfilePageModule {}