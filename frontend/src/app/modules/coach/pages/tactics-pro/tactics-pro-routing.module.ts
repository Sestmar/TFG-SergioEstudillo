import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TacticsProPage } from './tactics-pro.page';

const routes: Routes = [
  {
    path: '',
    component: TacticsProPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TacticsProPageRoutingModule {}
