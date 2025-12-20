import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Routes, RouterModule } from '@angular/router'; // 1. Importamos esto

import { MyTeamPage } from './my-team.page';

// 2. Definimos la ruta aquí mismo para no depender de otro archivo
const routes: Routes = [
  {
    path: '',
    component: MyTeamPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes) // 3. Cargamos las rutas
  ],
  declarations: [MyTeamPage]
})
export class MyTeamPageModule {}