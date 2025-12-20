import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { ConvocationDetailsPage } from './convocation-details.page';

const routes: Routes = [
  {
    path: '',
    component: ConvocationDetailsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ConvocationDetailsPage]
})
export class ConvocationDetailsPageModule {}