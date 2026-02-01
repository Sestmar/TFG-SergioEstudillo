import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';

import { LandingPage } from './pages/landing/landing.page';

// ✅ IMPORTAMOS LOS COMPONENTES HIJOS
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
    RouterModule.forChild(routes)
  ],
  declarations: [
    LandingPage,
    HeroSectionComponent, // ✅ Declarado para que funcione su HTML
    TeamCardComponent     // ✅ Declarado también por si acaso
  ] 
})
export class LandingPageModule {}