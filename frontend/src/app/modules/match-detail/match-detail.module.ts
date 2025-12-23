import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

// ✅ IMPORTANTE: Verifica que estos imports no tengan la 's'
import { MatchDetailPageRoutingModule } from './match-detail-routing.module';
import { MatchDetailPage } from './match-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MatchDetailPageRoutingModule
  ],
  declarations: [MatchDetailPage]
})
export class MatchDetailPageModule {}