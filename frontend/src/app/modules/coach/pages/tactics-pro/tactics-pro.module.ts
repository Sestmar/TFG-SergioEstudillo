import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { TacticsProPageRoutingModule } from './tactics-pro-routing.module';
import { TacticsProPage } from './tactics-pro.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DragDropModule,
    TacticsProPageRoutingModule
  ],
  declarations: [TacticsProPage]
})
export class TacticsProPageModule {}
