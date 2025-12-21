import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DragDropModule } from '@angular/cdk/drag-drop'; // ✅ Importante

import { TacticsPageRoutingModule } from './tactics-routing.module';
import { TacticsPage } from './tactics.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DragDropModule, // ✅ Inyectado
    TacticsPageRoutingModule
  ],
  declarations: [TacticsPage]
})
export class TacticsPageModule {}