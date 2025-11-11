import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { LandingPage } from './pages/landing/landing.page';
import { TeamCardComponent } from './components/team-card/team-card.component';
import { HeroSectionComponent } from './components/hero-section/hero-section.component';
import { FeaturesSectionComponent } from './components/features-section/features-section.component';

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
    TeamCardComponent,
    HeroSectionComponent,
    FeaturesSectionComponent
  ]
})
export class LandingPageModule {}