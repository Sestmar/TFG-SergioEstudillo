import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { NotificationService } from 'src/app/core/services/notification/notification.service';
import { finalize } from 'rxjs/operators';
import { AbstractControl, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  // HTML y CSS integrados
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Restablecer Contraseña</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div *ngIf="!token">
        <p>Token inválido o expirado.</p>
        <ion-button routerLink="/auth/login">Volver a Login</ion-button>
      </div>
      <form *ngIf="token" [formGroup]="resetForm" (ngSubmit)="onSubmit()">
        <p>Introduce tu nueva contraseña.</p>
        <ion-item lines="full" class="ion-margin-bottom auth-item">
          <ion-icon name="lock-closed-outline" slot="start"></ion-icon>
          <ion-input label="Nueva Contraseña" labelPlacement="stacked" formControlName="password" type="password" required></ion-input>
        </ion-item>
        <div *ngIf="password?.invalid && (password?.dirty || password?.touched)" class="validation-error">
          <span *ngIf="password?.errors?.['required']">La contraseña es requerida.</span>
          <span *ngIf="password?.errors?.['minlength']">Debe tener al menos 6 caracteres.</span>
        </div>
        <ion-item lines="full" class="ion-margin-bottom auth-item">
          <ion-icon name="shield-checkmark-outline" slot="start"></ion-icon>
          <ion-input label="Confirmar Contraseña" labelPlacement="stacked" formControlName="confirmPassword" type="password" required></ion-input>
        </ion-item>
         <div *ngIf="resetForm.errors?.['passwordMismatch'] && (confirmPassword?.dirty || confirmPassword?.touched)" class="validation-error">
            <span>Las contraseñas no coinciden.</span>
         </div>
        <ion-button type="submit" expand="block" [disabled]="resetForm.invalid || isLoading">
          <span *ngIf="!isLoading">Restablecer</span>
          <ion-spinner *ngIf="isLoading" name="crescent"></ion-spinner>
        </ion-button>
      </form>
    </ion-content>
  `,
  styles: [`
    .auth-item { border-radius: 8px; --background: var(--ion-color-light, #f4f5f7); }
    .validation-error { color: var(--ion-color-danger); font-size: 0.8rem; padding-left: 1rem; margin-top: -0.75rem; margin-bottom: 0.5rem; font-weight: 500; }
  `]
})
export class ResetPasswordPage implements OnInit {
  resetForm!: FormGroup;
  isLoading = false;
  token: string | null = null;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService, // Tu auth.service.ts
    private notification: NotificationService, // Tu notification.service.ts
    private router: Router,
    private route: ActivatedRoute // Para leer el token de la URL
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token'); // Captura el token de la URL

    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    return password && confirmPassword && password.value === confirmPassword.value 
      ? null 
      : { passwordMismatch: true };
  }
  
  get password() { return this.resetForm.get('password'); }
  get confirmPassword() { return this.resetForm.get('confirmPassword'); }

  async onSubmit() {
    if (this.resetForm.invalid || !this.token) return;

    this.isLoading = true;
    await this.notification.showLoading('Guardando...'); // Usando tu servicio

    this.auth.resetPassword(this.token, this.password!.value).pipe(
      finalize(async () => {
        this.isLoading = false;
        await this.notification.hideLoading(); // Usando tu servicio
      })
    ).subscribe({
      next: () => {
        this.notification.showSuccess('Contraseña actualizada. Ya puedes iniciar sesión.');
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.notification.showError('El enlace es inválido o ha expirado.');
        this.router.navigate(['/auth/login']);
      }
    });
  }
}