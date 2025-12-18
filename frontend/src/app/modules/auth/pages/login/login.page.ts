import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { NotificationService } from 'src/app/core/services/notification/notification.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit, OnDestroy {
  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;
  
  // Animación de fondo
  backgroundAnimation = {
    particles: [] as Array<{x: number, y: number, size: number, speedX: number, speedY: number}>,
    animationId: 0
  };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      rememberMe: [false]
    });
  }

  ngOnInit() {
    this.initializeBackgroundAnimation();
  }

  ngOnDestroy() {
    if (this.backgroundAnimation.animationId) {
      cancelAnimationFrame(this.backgroundAnimation.animationId);
    }
  }

  // --- Animación de fondo ---
  private initializeBackgroundAnimation() {
    for (let i = 0; i < 15; i++) {
      this.backgroundAnimation.particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 20 + 10,
        speedX: (Math.random() - 0.5) * 2,
        speedY: (Math.random() - 0.5) * 2
      });
    }
    this.animateBackground();
  }

  private animateBackground() {
    const animate = () => {
      this.backgroundAnimation.particles.forEach(particle => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        if (particle.x < 0 || particle.x > window.innerWidth) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > window.innerHeight) particle.speedY *= -1;
      });
      this.backgroundAnimation.animationId = requestAnimationFrame(animate);
    };
    animate();
  }

  getParticleStyle(particle: any): any {
    return {
      left: particle.x + 'px',
      top: particle.y + 'px',
      width: particle.size + 'px',
      height: particle.size + 'px'
    };
  }

  // --- Lógica de Login ---
  async onLogin() {
    if (this.loginForm.invalid || this.isLoading) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const credentials = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.authService.login(credentials).subscribe({
      next: (user) => {
        this.isLoading = false;
        
        const roles = user.roles || []; // Asumiendo que el backend devuelve roles
        // Si el backend devuelve un rol único en string (ej: "JUGADOR"), conviértelo a array
        const rolesArray = typeof user.rol === 'string' ? [user.rol] : roles;

        const message = this.getWelcomeMessage(rolesArray);
        console.log(message);
        
        // Redirigir usando las rutas correctas
        this.redirectByRole(rolesArray);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error login:', error);
      }
    });
  }

  private getWelcomeMessage(roles: string[]): string {
    const upperRoles = roles.map(r => r.toUpperCase());
    if (upperRoles.includes('ADMIN')) return '¡Bienvenido al palco VIP!';
    if (upperRoles.includes('ENTRENADOR')) return '¡Bienvenido al banquillo, Míster!';
    return '¡Bienvenido al campo! A jugar.';
  }

  // ✅ AQUÍ ESTABA EL ERROR: Rutas corregidas según tu app-routing.module.ts
  private redirectByRole(roles: string[]): void {
    const upperRoles = roles.map(r => r.toUpperCase());

    if (upperRoles.includes('ADMIN')) {
      this.router.navigate(['/user-dashboard']); // Ajustado a tu routing
    } else if (upperRoles.includes('ENTRENADOR')) {
      this.router.navigate(['/coach-dashboard']); // ✅ CORREGIDO (antes /coach/dashboard)
    } else {
      // Por defecto: JUGADOR
      this.router.navigate(['/player-dashboard']); // ✅ CORREGIDO (antes /players/dashboard)
    }
  }

  // --- Helpers UI ---
  togglePasswordVisibility() { this.showPassword = !this.showPassword; }
  goToRegister() { this.router.navigate(['/auth/register']); }
  goToForgotPassword() { this.router.navigate(['/auth/forgot-password']); }

  get emailError(): string {
    const control = this.loginForm.get('email');
    if (control?.hasError('required')) return 'El email es obligatorio para jugar.';
    if (control?.hasError('email')) return 'Formato de email inválido.';
    return '';
  }

  get passwordError(): string {
    const control = this.loginForm.get('password');
    if (control?.hasError('required')) return 'La contraseña es necesaria.';
    if (control?.hasError('minlength')) return 'Mínimo 4 caracteres.';
    return '';
  }
}