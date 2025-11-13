import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
// Tus servicios, que funcionan
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { NotificationService } from 'src/app/core/services/notification/notification.service'; 

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit { // <-- Esto exporta la clase que tu módulo necesita

  registerForm!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private notification: NotificationService, // Usamos tu servicio (como en login-futbolero)
    private router: Router
  ) {}

  ngOnInit() {
    // Este formulario coincide con el 'UserRegisterDto' de tu auth.service.ts
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      apellidos: ['', [Validators.required]], // Tu DTO lo tiene
      email: ['', [Validators.required, Validators.email]],
      telefono: [''], // Opcional (Tu DTO lo tiene)
      direccion: [''], // Opcional (Tu DTO lo tiene)
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // Validador para confirmar contraseña
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    return password && confirmPassword && password.value === confirmPassword.value 
      ? null 
      : { passwordMismatch: true };
  }

  async onRegister() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    // Usamos el mismo patrón de loading que tu login-futbolero
    await this.notification.showLoading('Creando cuenta...');

    // Creamos el DTO que tu auth.service.ts espera
    const { confirmPassword, ...registerDto } = this.registerForm.value;

    this.auth.register(registerDto).pipe( // registerDto coincide con UserRegisterDto
      finalize(async () => {
        this.isLoading = false;
        await this.notification.hideLoading(); // Ocultamos el loading
      })
    ).subscribe({
      next: (usuario) => {
        // Tu servicio de registro (según el código que me pasaste)
        // no loguea automáticamente, solo registra.
        this.notification.showSuccess(`¡Registro completado, ${usuario.nombre}! Ya puedes iniciar sesión.`);
        this.router.navigate(['/auth/login']); // Lo mandamos a login
      },
      error: (err) => {
        console.error('Error en registro:', err);
        const msg = (err.status === 409 || (err.error?.message && err.error.message.includes('Duplicate')))
          ? 'El email ya está en uso.'
          : 'Error al crear la cuenta.';
        this.notification.showError(msg); // Usamos tu servicio
      }
    });
  }

  // Getters para el HTML
  get nombre() { return this.registerForm.get('nombre'); }
  get apellidos() { return this.registerForm.get('apellidos'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
}