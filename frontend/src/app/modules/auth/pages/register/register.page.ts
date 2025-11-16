import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

import { AuthService } from '../../../../core/services/auth/auth.service';
import { NotificationService } from '../../../../core/services/notification/notification.service';
import { UserRegisterDto } from '../../../../shared/models/models';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit, OnDestroy {

  registerForm: FormGroup;
  isLoading = false;

  private destroyed$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      apellidos: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {}

  /**
   * Validador personalizado para asegurar que las contraseñas coinciden.
   */
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    return password && confirmPassword && password.value === confirmPassword.value 
      ? null 
      : { passwordMismatch: true };
  }

  /**
   * Maneja el envío del formulario de registro.
   */
  async onRegister(): Promise<void> {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    await this.notificationService.showLoading('Creando tu cuenta...');

    const { confirmPassword, ...userData } = this.registerForm.value;
    const userToRegister: UserRegisterDto = userData;

    this.authService.register(userToRegister).pipe(
      takeUntil(this.destroyed$),
      finalize(async () => {
        this.isLoading = false;
        await this.notificationService.hideLoading();
      })
    ).subscribe({
      next: () => {
        this.notificationService.showSuccess('¡Registro completado! Ahora puedes iniciar sesión.');
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        console.error('Error en el registro:', error);
        const errorMessage = error.error?.message || 'Ha ocurrido un error. Por favor, inténtalo de nuevo.';
        this.notificationService.showError(errorMessage);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}