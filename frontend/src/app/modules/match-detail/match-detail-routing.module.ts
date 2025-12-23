import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MatchDetailPage } from './match-detail.page';

const routes: Routes = [
  {
    path: '',
    component: MatchDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MatchDetailPageRoutingModule {}