import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { MediaService } from 'src/app/core/services/media/media.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss']
})
export class RegisterPage implements OnInit {

  private destroyRef = inject(DestroyRef);

  showPassword = false;
  registerForm!: FormGroup;
  isLoading = false;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private mediaService: MediaService,
    private router: Router,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.initForm();
  }

  private initForm(): void {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      // El teléfono es opcional en tu HTML, pero si lo pones, valida el formato
      // telefono: ['', [Validators.pattern(/^[0-9]{9}$/)]], 
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: (group: FormGroup) => {
        const pass = group.get('password')?.value;
        const confirm = group.get('confirmPassword')?.value;
        return pass === confirm ? null : { passwordMismatch: true };
      }
    });
  }

  // --- GETTERS (Necesarios para que el HTML detecte los errores) ---
  get nombre() { return this.registerForm.get('nombre'); }
  get apellidos() { return this.registerForm.get('apellidos'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
  // ---------------------------------------------------------------

  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  // Renombrado a onRegister para coincidir con el HTML (ngSubmit)="onRegister()"
  async onRegister(): Promise<void> {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched(); // Marca los campos en rojo si hay error
      return;
    }

    this.isLoading = true;
    const { confirmPassword, ...userData } = this.registerForm.value;

    // 1. Si hay foto, la subimos primero
    if (this.selectedFile) {
      this.mediaService.uploadImage(this.selectedFile).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (response) => {
          userData.fotoUrl = response.url; // Añadimos la URL al usuario
          this.doRegister(userData);
        },
        error: (err) => {
          console.error('Fallo subida imagen', err);
          this.showToast('No se pudo subir la imagen, registrando sin ella...', 'warning');
          this.doRegister(userData);
        }
      });
    } else {
      // 2. Si no hay foto, registro directo
      this.doRegister(userData);
    }
  }

  private doRegister(userData: any) {
    this.authService.register(userData).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: async () => {
        this.isLoading = false;
        await this.showToast('¡Fichaje completado! Inicia sesión.', 'success');
        this.router.navigate(['/auth/login']);
      },
      error: async (error) => {
        this.isLoading = false;
        console.error('Error registro:', error);
        await this.showToast('Error al registrar usuario. Intenta con otro email.', 'danger');
      }
    });
  }

  private async showToast(message: string, color: string): Promise<void> {
    const toast = await this.toastController.create({ message, duration: 3000, color, position: 'top' });
    await toast.present();
  }
}