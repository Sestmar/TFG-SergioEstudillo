import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';

import { PlayerPerformancePage } from './player-performance.page';

const routes: Routes = [
  { path: '', component: PlayerPerformancePage }
];

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    NgApexchartsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [PlayerPerformancePage]
})
export class PlayerPerformancePageModule {}
