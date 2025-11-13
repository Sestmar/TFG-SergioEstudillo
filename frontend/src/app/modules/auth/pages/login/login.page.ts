import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { NotificationService } from 'src/app/core/services/notification/notification.service';
// (Tu auth.service.ts define 'UserLoginDto' dentro de sí mismo,
// así que no necesitamos importarlo)

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html', // Asumo que tienes estos
  styleUrls: ['./login.page.scss'], // Asumo que tienes estos
})
export class LoginPage implements OnInit {

  loginForm!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      // ¡ARREGLO! Usamos 'email' para que coincida con el DTO de auth.service.ts
      email: ['', [Validators.required, Validators.email]], 
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    await this.notificationService.showLoading('Iniciando sesión...');
    
    // ¡ARREGLO! El objeto 'credentials' ahora SÍ coincide
    // con el UserLoginDto de tu auth.service.ts
    const credentials = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.authService.login(credentials).pipe(
      finalize(async () => {
        this.isLoading = false;
        await this.notificationService.hideLoading();
      })
    ).subscribe({
      next: (user) => {
        this.notificationService.showSuccess(`¡Bienvenido de nuevo, ${user.nombre}!`);
        // Redirigir según el rol
        const roles = user.roles || [];
        if (roles.includes('ADMIN')) {
          this.router.navigate(['/admin/dashboard']);
        } else if (roles.includes('ENTRENADOR')) {
          this.router.navigate(['/coach/dashboard']);
        } else if (roles.includes('JUGADOR')) {
          this.router.navigate(['/player/dashboard']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        console.error('Error en login:', err);
        this.notificationService.showError('Email o contraseña incorrectos.');
      }
    });
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}