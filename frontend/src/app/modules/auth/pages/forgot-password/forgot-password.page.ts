import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { NotificationService } from 'src/app/core/services/notification/notification.service';
import { finalize } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  // He puesto el HTML y CSS aquí mismo para que solo crees un archivo
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar class="transparent-toolbar">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/auth/login" color="light"></ion-back-button>
        </ion-buttons>
        <ion-title>RECUPERAR CONTRASEÑA</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <div class="auth-wrapper animate-fade-in">

        <div class="header-section">
          <div class="logo-wrapper">
            <img src="assets/img/mi-club-logo.png" alt="Logo Club">
          </div>
          <h2>Recuperar Contraseña</h2>
          <p>Introducí tu email y te enviaremos un enlace para restablecer tu contraseña.</p>
        </div>

        <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()">
          <div class="input-group">
            <label>CORREO ELECTRÓNICO</label>
            <div class="input-container">
              <input type="email" formControlName="email" placeholder="ejemplo@email.com" class="neon-input">
              <ion-icon name="mail-outline"></ion-icon>
            </div>
            <div class="error-msg" *ngIf="email?.invalid && (email?.dirty || email?.touched)">
              <span *ngIf="email?.errors?.['required']">El email es requerido.</span>
              <span *ngIf="email?.errors?.['email']">El formato del email no es válido.</span>
            </div>
          </div>

          <button type="submit" class="submit-btn" [disabled]="forgotForm.invalid || isLoading">
            <span *ngIf="!isLoading">ENVIAR EMAIL</span>
            <ion-spinner *ngIf="isLoading" name="dots"></ion-spinner>
          </button>
        </form>

        <div class="footer-link">
          <p>¿Ya recordaste tu contraseña? <a routerLink="/auth/login">Inicia sesión</a></p>
        </div>

      </div>
    </ion-content>
  `,
  styles: [`
    :host {
      --primary:      #8b5cf6;
      --primary-glow: rgba(139, 92, 246, 0.12);
      --text-white:   #f0edf8;
      --text-gray:    #8b85a0;
      --input-bg:     rgba(15, 12, 26, 0.85);
    }
    ion-content { --background: transparent; }
    ion-content::part(background) {
      background:
        url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E"),
        radial-gradient(ellipse 80% 70% at 50% 30%, #13102a 0%, #080612 60%, #04030d 100%);
    }
    .transparent-toolbar {
      --background: transparent;
      --color: var(--text-white);
      --border-width: 0;
    }
    .transparent-toolbar ion-title {
      font-weight: 800;
      letter-spacing: 2px;
      font-size: 0.82rem;
      color: rgba(240, 237, 248, 0.5);
    }
    .auth-wrapper {
      padding: 12px 24px 48px;
      max-width: 520px;
      margin: 0 auto;
    }
    .header-section {
      text-align: center;
      margin-bottom: 36px;
      padding-bottom: 28px;
      position: relative;
    }
    .header-section .logo-wrapper {
      width: 90px; height: 90px;
      margin: 0 auto 18px;
      display: flex; align-items: center; justify-content: center;
    }
    .header-section .logo-wrapper img {
      width: 100%; height: 100%; object-fit: contain;
      filter: drop-shadow(0 0 12px rgba(139, 92, 246, 0.5));
    }
    .header-section h2 {
      margin: 0 0 6px;
      font-size: 1.9rem; font-weight: 800;
      color: var(--text-white);
      letter-spacing: 0.3px;
    }
    .header-section p {
      margin: 0;
      color: var(--text-gray);
      font-size: 0.9rem;
      line-height: 1.5;
    }
    .header-section::after {
      content: '— ✦ —';
      position: absolute;
      bottom: 0; left: 50%;
      transform: translateX(-50%);
      font-size: 0.7rem;
      color: rgba(139, 92, 246, 0.4);
      letter-spacing: 4px;
      white-space: nowrap;
    }
    .input-group { margin-bottom: 22px; }
    .input-group label {
      display: block;
      font-size: 0.65rem; font-weight: 800;
      color: var(--primary);
      letter-spacing: 1.5px; margin-bottom: 8px; opacity: 0.9;
    }
    .input-container { position: relative; }
    .neon-input {
      width: 100%; height: 50px;
      background: var(--input-bg);
      border: 1px solid rgba(139, 92, 246, 0.2);
      border-radius: 8px;
      padding: 0 46px 0 16px;
      color: var(--text-white);
      font-size: 0.95rem; outline: none;
      transition: all 0.25s;
      box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.4);
      box-sizing: border-box;
    }
    .neon-input::placeholder { color: #3d3655; }
    .neon-input:focus {
      border-color: rgba(139, 92, 246, 0.55);
      box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.4), 0 0 12px rgba(139, 92, 246, 0.12);
    }
    .input-container ion-icon {
      position: absolute; right: 14px; top: 50%;
      transform: translateY(-50%);
      color: rgba(139, 92, 246, 0.4);
      font-size: 1.2rem; pointer-events: none;
    }
    .error-msg {
      color: #e07070; font-size: 0.72rem;
      margin-top: 5px; font-weight: 500;
      display: flex; align-items: center;
    }
    .error-msg::before { content: '•'; margin-right: 5px; }
    .submit-btn {
      width: 100%; height: 52px;
      border: none; outline: none;
      background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
      border-radius: 8px;
      color: white; font-weight: 800;
      letter-spacing: 2px; font-size: 0.95rem;
      margin-top: 8px; cursor: pointer;
      box-shadow: 0 4px 20px rgba(124, 58, 237, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.1);
      transition: all 0.15s;
    }
    .submit-btn:active { transform: translateY(1px); box-shadow: 0 2px 10px rgba(124, 58, 237, 0.3); }
    .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .footer-link {
      text-align: center;
      margin-top: 28px; padding-top: 20px;
      border-top: 1px solid rgba(139, 92, 246, 0.1);
    }
    .footer-link p { color: var(--text-gray); font-size: 0.875rem; margin: 0; }
    .footer-link a {
      color: var(--primary); text-decoration: none;
      font-weight: 700; margin-left: 4px;
    }
    .footer-link a:hover { text-decoration: underline; }
    .animate-fade-in { animation: fadeIn 0.5s ease-out; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ForgotPasswordPage implements OnInit {

  private destroyRef = inject(DestroyRef);

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
      takeUntilDestroyed(this.destroyRef),
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