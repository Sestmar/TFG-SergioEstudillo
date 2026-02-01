import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

// ✅ Importamos el RoutingModule en vez de definir rutas aquí
import { MyTeamPageRoutingModule } from './my-team-routing.module';
import { MyTeamPage } from './my-team.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyTeamPageRoutingModule // ✅ Usamos el archivo de rutas separado
  ],
  declarations: [MyTeamPage]
})
export class MyTeamPageModule {}