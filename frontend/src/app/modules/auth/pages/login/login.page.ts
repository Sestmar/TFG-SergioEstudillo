import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';

import { AuthService, NotificationService } from '@core/services';
import { UserLoginDto } from '@shared/models';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private notificationService: NotificationService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {}

  /**
   * Maneja el envío del formulario de login
   */
  async onLogin() {
    if (this.loginForm.invalid || this.isLoading) {
      return;
    }

    this.isLoading = true;
    
    try {
      const credentials: UserLoginDto = this.loginForm.value;
      
      await this.notificationService.showLoading('Iniciando sesión...');
      
      this.authService.login(credentials).subscribe({
        next: async (user) => {
          await this.notificationService.hideLoading();
          
          this.notificationService.showSuccess('¡Bienvenido!');
          
          // Redirigir según el rol del usuario
          this.redirectByRole(user.roles || []);
        },
        error: async (error) => {
          await this.notificationService.hideLoading();
          
          this.isLoading = false;
          this.notificationService.showError(
            error.message || 'Usuario o contraseña incorrectos'
          );
        }
      });
    } catch (error) {
      await this.notificationService.hideLoading();
      this.isLoading = false;
      this.notificationService.showError('Error al iniciar sesión');
    }
  }

  /**
   * Redirige al usuario según su rol
   */
  private redirectByRole(roles: string[]): void {
    const isAdmin = roles.includes('ADMIN');
    const isCoach = roles.includes('ENTRENADOR');
    const isPlayer = roles.includes('JUGADOR');

    if (isAdmin) {
      this.router.navigate(['/admin/dashboard']);
    } else if (isCoach) {
      this.router.navigate(['/coach/dashboard']);
    } else if (isPlayer) {
      this.router.navigate(['/player/dashboard']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  /**
   * Navega a la página de registro
   */
  goToRegister() {
    this.router.navigate(['/auth/register']);
  }

  /**
   * Navega a la página de recuperación de contraseña
   */
  goToForgotPassword() {
    this.router.navigate(['/auth/forgot-password']);
  }

  /**
   * Alterna la visibilidad de la contraseña
   */
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  /**
   * Obtiene los mensajes de error para el campo username
   */
  get usernameError(): string {
    const control = this.loginForm.get('username');
    if (control?.hasError('required')) {
      return 'El nombre de usuario es requerido';
    }
    if (control?.hasError('minlength')) {
      return 'El nombre de usuario debe tener al menos 3 caracteres';
    }
    return '';
  }

  /**
   * Obtiene los mensajes de error para el campo password
   */
  get passwordError(): string {
    const control = this.loginForm.get('password');
    if (control?.hasError('required')) {
      return 'La contraseña es requerida';
    }
    if (control?.hasError('minlength')) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }
    return '';
  }
}