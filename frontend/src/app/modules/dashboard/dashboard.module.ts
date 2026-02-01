import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { DashboardPage } from './pages/dashboard/dashboard.page';
// Si DashboardCardComponent existe y no da error, déjalo. Si da error, bórralo también.
import { DashboardCardComponent } from './components/dashboard-card/dashboard-card.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild([
      {
        path: '',
        component: DashboardPage
      }
    ])
  ],
  declarations: [
    DashboardPage,
    DashboardCardComponent 
    // ❌ BORRADO: QuickActionsComponent (causaba el error)
  ]
})
export class DashboardModule {}