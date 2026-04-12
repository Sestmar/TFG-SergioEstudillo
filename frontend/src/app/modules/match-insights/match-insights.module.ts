import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { MatchInsightsPage } from './match-insights.page';

const routes: Routes = [
  { path: '', component: MatchInsightsPage }
];

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [MatchInsightsPage]
})
export class MatchInsightsPageModule {}
