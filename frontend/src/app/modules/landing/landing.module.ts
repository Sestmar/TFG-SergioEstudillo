import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { LandingPage } from './pages/landing/landing.page';
import { TeamCardComponent } from './components/team-card/team-card.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild([
      {
        path: '',
        component: LandingPage
      }
    ])
  ],
  declarations: [
    LandingPage,
    TeamCardComponent
  ]
})
export class LandingPageModule {}