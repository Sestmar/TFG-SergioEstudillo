import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { NotificationService } from '../../../../core/services/notification/notification.service';
import { finalize } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  // He puesto el HTML y CSS aquí mismo para que solo crees un archivo
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/auth/login"></ion-back-button>
        </ion-buttons>
        <ion-title>Recuperar Contraseña</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()">
        <p>Introduce tu email y te enviaremos un enlace para recuperar tu contraseña.</p>
        <ion-item lines="full" class="ion-margin-bottom auth-item">
          <ion-icon name="mail-outline" slot="start"></ion-icon>
          <ion-input label="Email" labelPlacement="stacked" formControlName="email" type="email" required></ion-input>
        </ion-item>
         <div *ngIf="email?.invalid && (email?.dirty || email?.touched)" class="validation-error">
            <span *ngIf="email?.errors?.['required']">El email es requerido.</span>
            <span *ngIf="email?.errors?.['email']">El formato del email no es válido.</span>
         </div>
        <ion-button type="submit" expand="block" [disabled]="forgotForm.invalid || isLoading">
          <span *ngIf="!isLoading">Enviar Email</span>
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
export class ForgotPasswordPage implements OnInit {
  forgotForm!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService, // Tu auth.service.ts
    private notification: NotificationService, // Tu notification.service.ts
    private router: Router
  ) {}

  ngOnInit() {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get email() { return this.forgotForm.get('email'); }

  async onSubmit() {
    if (this.forgotForm.invalid) return;

    this.isLoading = true;
    await this.notification.showLoading('Enviando...'); // Usando tu servicio

    this.auth.requestPasswordReset(this.email!.value).pipe(
      finalize(async () => {
        this.isLoading = false;
        await this.notification.hideLoading(); // Usando tu servicio
      })
    ).subscribe({
      next: () => {
        this.notification.showSuccess('Email enviado. Revisa tu bandeja de entrada.');
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.notification.showError('No se pudo enviar el email. Verifica la dirección.');
      }
    });
  }
}