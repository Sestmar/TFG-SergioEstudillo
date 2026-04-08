import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { AdminUserDto } from '@shared/models/models';
import { AdminService } from '@core/services/admin/admin.service';
import { NotificationService } from '@core/services/notification/notification.service';

@Component({
  selector: 'app-user-edit-modal',
  templateUrl: './user-edit-modal.component.html',
  styleUrls: ['./user-edit-modal.component.scss'],
})
export class UserEditModalComponent implements OnInit {
  @Input() user!: AdminUserDto;
  @Input() teams: any[] = []; // Para el select de equipos
  
  editForm: FormGroup;
  isSaving = false;

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private adminService: AdminService,
    private notificationService: NotificationService
  ) {
    this.editForm = this.fb.group({
      // Identidad
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: [''],
      
      // Perfil Deportivo (Jugador)
      dorsal: [null],
      posicion: [''],
      estado: ['ACTIVO'],
      equipoId: [null]
    });
  }

  ngOnInit() {
    if (this.user) {
      this.editForm.patchValue({
        nombre: this.user.nombre,
        apellidos: this.user.apellidos,
        email: this.user.email,
        telefono: this.user.telefono,
        dorsal: this.user.dorsal,
        posicion: this.user.posicion,
        estado: this.user.estado || 'ACTIVO',
        equipoId: this.user.equipoId
      });
    }
  }

  close() {
    this.modalCtrl.dismiss();
  }

  async onSave() {
    if (this.editForm.invalid) {
      return this.notificationService.error('⚠️ Por favor, revisa los campos obligatorios');
    }

    this.isSaving = true;
    const payload = this.editForm.value;

    this.adminService.updateUser(this.user.id!, payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.notificationService.success('¡Perfil actualizado correctamente! ⚽');
        this.modalCtrl.dismiss(true);
      },
      error: (err) => {
        this.isSaving = false;
        console.error('Error actualizando usuario', err);
        this.notificationService.error('No se pudo actualizar el perfil');
      }
    });
  }
}
