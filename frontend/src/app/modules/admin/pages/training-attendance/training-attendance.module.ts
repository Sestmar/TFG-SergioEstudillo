import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { TrainingAttendancePageRoutingModule } from './training-attendance-routing.module';
import { TrainingAttendancePage } from './training-attendance.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TrainingAttendancePageRoutingModule
  ],
  declarations: [TrainingAttendancePage]
})
export class TrainingAttendancePageModule {}