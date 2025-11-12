import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';

// Importa el componente landing
import { LandingPage } from './pages/landing/landing.page';

// Importa los componentes
import { HeroSectionComponent } from './components/hero-section/hero-section.component';
import { TeamCardComponent } from './components/team-card/team-card.component';

const routes: Routes = [
  {
    path: '',
    component: LandingPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes)  // ¡IMPORTANTE!
  ],
  declarations: [
    LandingPage,
    HeroSectionComponent,
    TeamCardComponent
  ]
})
export class LandingPageModule {}