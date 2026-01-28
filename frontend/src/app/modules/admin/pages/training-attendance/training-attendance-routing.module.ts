import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TrainingAttendancePage } from './training-attendance.page';

const routes: Routes = [
  {
    path: '',
    component: TrainingAttendancePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TrainingAttendancePageRoutingModule {}