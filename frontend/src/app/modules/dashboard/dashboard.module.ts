import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { DashboardPage } from './pages/dashboard/dashboard.page';
import { DashboardCardComponent } from './components/dashboard-card/dashboard-card.component';
import { QuickActionsComponent } from './components/quick-actions/quick-actions.component';

@NgModule({
  imports: [
    CommonModule,
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
    DashboardCardComponent,
    QuickActionsComponent
  ]
})
export class DashboardModule {}