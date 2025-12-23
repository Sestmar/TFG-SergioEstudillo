import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // ReactiveForms es clave aquí
import { IonicModule } from '@ionic/angular';
import { EditMatchPageRoutingModule } from './edit-match-routing.module';
import { EditMatchPage } from './edit-match.page';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule, EditMatchPageRoutingModule],
  declarations: [EditMatchPage]
})
export class EditMatchPageModule {}