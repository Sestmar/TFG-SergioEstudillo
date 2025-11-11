import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService, NotificationService } from '@core/services';
import { UserLoginDto } from '@shared/models';

@Component({
  selector: 'app-login-futbolero',
  templateUrl: './login-futbolero.page.html',
  styleUrls: ['./login-futbolero.page.scss'],
})
export class LoginFutboleroPage implements OnInit {
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
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
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

  /**
   * Inicializa la animación de fondo con partículas
   */
  private initializeBackgroundAnimation() {
    // Crear partículas de balones de fútbol
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

  /**
   * Animación de las partículas de fondo
   */
  private animateBackground() {
    const animate = () => {
      this.backgroundAnimation.particles.forEach(particle => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Rebotar en los bordes
        if (particle.x < 0 || particle.x > window.innerWidth) {
          particle.speedX *= -1;
        }
        if (particle.y < 0 || particle.y > window.innerHeight) {
          particle.speedY *= -1;
        }
      });
      
      this.backgroundAnimation.animationId = requestAnimationFrame(animate);
    };
    
    animate();
  }

  /**
   * Maneja el envío del formulario de login
   */
 async onLogin() {
    if (this.loginForm.invalid || this.isLoading) {
      return;
    }

    this.isLoading = true;
    
    try {
      const credentials: UserLoginDto = {
        username: this.loginForm.value.username,
        password: this.loginForm.value.password
      };
      
      await this.notificationService.showLoading('Ingresando al estadio...');
      
      this.authService.login(credentials).subscribe({
        next: async (user) => {
          await this.notificationService.hideLoading();
          
          // Mensaje personalizado según el rol
          const welcomeMessage = this.getWelcomeMessage(user.roles || []);
          this.notificationService.showSuccess(welcomeMessage);
          
          // Redirigir según el rol del usuario
          this.redirectByRole(user.roles || []);
        },
        error: async (error) => {
          await this.notificationService.hideLoading();
          
          this.isLoading = false;
          this.notificationService.showError(
            error.message || 'Credenciales incorrectas. Intenta nuevamente.'
          );
        }
      });
    } catch (error) {
      await this.notificationService.hideLoading();
      this.isLoading = false;
      this.notificationService.showError('Error al intentar ingresar');
    }
  }

  /**
   * Obtiene un mensaje de bienvenida personalizado según el rol
   */
  private getWelcomeMessage(roles: string[]): string {
    if (roles.includes('ADMIN')) {
      return '¡Bienvenido al palco VIP! Acceso total concedido';
    } else if (roles.includes('ENTRENADOR')) {
      return '¡Bienvenido al banquillo! Tu equipo te espera';
    } else if (roles.includes('JUGADOR')) {
      return '¡Bienvenido al campo! Es hora de jugar';
    } else {
      return '¡Bienvenido al estadio! Disfruta del partido';
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

  /**
   * Método para obtener la posición de las partículas para la animación
   */
  getParticleStyle(particle: any): any {
    return {
      left: particle.x + 'px',
      top: particle.y + 'px',
      width: particle.size + 'px',
      height: particle.size + 'px'
    };
  }
}