import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { CreateConvocationPage } from './create-convocation.page';

const routes: Routes = [
  {
    path: '',
    component: CreateConvocationPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule, // <--- OBLIGATORIO PARA FORMULARIOS
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [CreateConvocationPage]
})
export class CreateConvocationPageModule {}