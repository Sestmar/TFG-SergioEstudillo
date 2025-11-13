import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-auth-form',
  // Template vacío por ahora para que compile
  template: `` 
})
export class AuthFormComponent { // <-- Esto exporta la clase que tu módulo necesita
  
  @Input() formGroup!: FormGroup; // Recibe un formulario
  
  constructor() {}
}