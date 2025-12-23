import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EditMatchPage } from './edit-match.page';

const routes: Routes = [
  {
    path: '',
    component: EditMatchPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditMatchPageRoutingModule {}