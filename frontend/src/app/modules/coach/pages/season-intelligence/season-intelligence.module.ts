import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';

import { SeasonIntelligencePage } from './season-intelligence.page';

const routes: Routes = [
  { path: '', component: SeasonIntelligencePage }
];

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    NgApexchartsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [SeasonIntelligencePage]
})
export class SeasonIntelligencePageModule {}
