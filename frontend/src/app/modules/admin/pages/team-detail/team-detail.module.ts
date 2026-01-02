import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';

import { TeamDetailPage } from './team-detail.page';

// Definimos la ruta interna de este módulo
const routes: Routes = [
  {
    path: '',
    component: TeamDetailPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes) // 🔥 Importante: Esto conecta la página con el routing principal
  ],
  declarations: [TeamDetailPage] // Declaramos el componente aquí
})
export class TeamDetailPageModule {}