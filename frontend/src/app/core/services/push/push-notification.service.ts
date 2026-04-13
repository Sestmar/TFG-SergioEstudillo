import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, ActionPerformed, PushNotificationSchema } from '@capacitor/push-notifications';
import { ToastController } from '@ionic/angular';
import { ApiService } from 'src/app/core/services/api/api.service';
import { StorageService } from 'src/app/core/services/storage/storage.service';

const FCM_TOKEN_KEY = 'fcm_token';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {

  private listenersRegistered = false;
  private activeToast: HTMLIonToastElement | null = null;

  constructor(
    private apiService: ApiService,
    private storageService: StorageService,
    private toastController: ToastController,
    private router: Router
  ) {}

  /**
   * Punto de entrada: llamar después del login exitoso.
   * En web/browser no hace nada (solo aplica a nativo).
   */
  async initialize(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    const permission = await PushNotifications.requestPermissions();
    if (permission.receive !== 'granted') return;

    await PushNotifications.register();

    // Evitar registrar listeners duplicados en re-login
    if (!this.listenersRegistered) {
      this.registerListeners();
      this.listenersRegistered = true;
    }
  }

  private registerListeners(): void {
    // Token recibido — registrarlo en el backend
    PushNotifications.addListener('registration', (token: Token) => {
      this.registerTokenOnBackend(token.value);
    });

    // Error de registro
    PushNotifications.addListener('registrationError', (err) => {
      console.error('Error registrando push notifications:', err);
    });

    // Notificación recibida con la app en FOREGROUND — mostrar toast
    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      const title = notification.title?.trim() ?? '';
      const body = notification.body?.trim() ?? '';
      if (!title && !body) return;
      this.showForegroundToast(title, body);
    });

    // Usuario tocó la notificación — navegar a la pantalla según el data payload
    PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
      const data = action.notification.data as Record<string, string> | undefined;
      const route = data?.['route'];
      if (route) {
        this.router.navigateByUrl(route);
      }
    });
  }

  private registerTokenOnBackend(token: string): void {
    const storedToken = this.storageService.get(FCM_TOKEN_KEY);
    if (storedToken === token) return;

    this.apiService.put<void>('/usuarios/fcm-token', { fcmToken: token }).subscribe({
      next: () => {
        this.storageService.set(FCM_TOKEN_KEY, token);
      },
      error: (err) => {
        console.error('Error registrando FCM token en backend:', err);
      }
    });
  }

  private async showForegroundToast(title: string, body: string): Promise<void> {
    // Descarta el toast anterior si sigue visible
    if (this.activeToast) {
      await this.activeToast.dismiss().catch(() => {});
      this.activeToast = null;
    }

    const toast = await this.toastController.create({
      header: title || undefined,
      message: body,
      duration: 5000,
      position: 'top',
      cssClass: ['night-toast', 'toast-info'],
      buttons: [{ icon: 'close-outline', role: 'cancel' }]
    });

    toast.onDidDismiss().then(() => {
      this.activeToast = null;
    });

    this.activeToast = toast;
    await toast.present();
  }
}
