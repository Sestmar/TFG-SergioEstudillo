import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { NotificationService } from 'src/app/core/services/notification/notification.service';
import { LoadingController } from '@ionic/angular';

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
    private notificationService: NotificationService,
    private loadingCtrl: LoadingController // Añadido para feedback visual nativo
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      rememberMe: [false]
    });
  }

  ngOnInit() {}

  // --- Lógica de Login ---
  async onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    
    // Opcional: Loader nativo de Ionic
    const loading = await this.loadingCtrl.create({
      message: 'Accediendo al estadio...',
      spinner: 'crescent',
      cssClass: 'custom-loading'
    });
    await loading.present();

    const credentials = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.authService.login(credentials).subscribe({
      next: async (user) => {
        this.isLoading = false;
        await loading.dismiss();
        
        const roles = user.roles || [];
        const rolesArray = typeof user.rol === 'string' ? [user.rol] : roles;

        // Redirigir según rol
        this.redirectByRole(rolesArray);
      },
      error: async (error) => {
        this.isLoading = false;
        await loading.dismiss();
        console.error('Error login:', error);
        // Aquí podrías usar tu notificationService para mostrar error
      }
    });
  }

  private redirectByRole(roles: string[]): void {
    const upperRoles = roles.map(r => r.toUpperCase());

    if (upperRoles.includes('ADMIN')) {
      // ❌ ANTES: this.router.navigate(['/user-dashboard']);
      // ✅ AHORA:
      this.router.navigate(['/admin']); 
    } else if (upperRoles.includes('ENTRENADOR')) {
      this.router.navigate(['/coach-dashboard']);
    } else {
      this.router.navigate(['/player-dashboard']);
    }
  }

  // --- Helpers UI ---
  togglePasswordVisibility() { 
    this.showPassword = !this.showPassword; 
  }
}