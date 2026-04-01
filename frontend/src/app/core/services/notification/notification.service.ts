import { Injectable } from '@angular/core';
import { ToastController, AlertController, LoadingController } from '@ionic/angular';

/**
 * Servicio de notificaciones para mostrar mensajes al usuario
 * Envuelve los componentes de Ionic para una experiencia consistente
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private loading: HTMLIonLoadingElement | null = null;

  constructor(
    private toastController: ToastController,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  /**
   * Muestra un toast con mensaje
   */
  async showToast(
    message: string,
    duration: number = 3000,
    position: 'top' | 'bottom' | 'middle' = 'bottom',
    color: string = 'primary'
  ): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration,
      position,
      color,
      buttons: duration === 0 ? [
        {
          text: 'Cerrar',
          role: 'cancel'
        }
      ] : undefined
    });

    await toast.present();
  }

  /**
   * Muestra un toast de éxito
   */
  async showSuccess(message: string, duration?: number): Promise<void> {
    await this.showToast(message, duration || 2000, 'bottom', 'success');
  }

  /**
   * Muestra un toast de error
   */
  async showError(message: string, duration?: number): Promise<void> {
    await this.showToast(message, duration || 4000, 'bottom', 'danger');
  }

  /**
   * Muestra un toast de información
   */
  async showInfo(message: string, duration?: number): Promise<void> {
    await this.showToast(message, duration || 3000, 'bottom', 'primary');
  }

  /**
   * Muestra un toast de advertencia
   */
  async showWarning(message: string, duration?: number): Promise<void> {
    await this.showToast(message, duration || 4000, 'bottom', 'warning');
  }

  /**
   * Muestra una alerta simple
   */
  async showAlert(
    header: string,
    message: string,
    buttons: string[] = ['OK']
  ): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      cssClass: 'night-alert',
      buttons: buttons.map(text => ({ text }))
    });

    await alert.present();
  }

  /**
   * Muestra una alerta de confirmación
   */
  async showConfirm(
    header: string,
    message: string,
    confirmText: string = 'Confirmar',
    cancelText: string = 'Cancelar'
  ): Promise<boolean> {
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        header,
        message,
        cssClass: 'night-alert',
        buttons: [
          {
            text: cancelText,
            role: 'cancel',
            handler: () => resolve(false)
          },
          {
            text: confirmText,
            handler: () => resolve(true)
          }
        ]
      });

      await alert.present();
    });
  }

  /**
   * Muestra un loading
   */
  async showLoading(message: string = 'Cargando...'): Promise<void> {
    if (this.loading) {
      await this.loading.dismiss();
    }

    this.loading = await this.loadingController.create({
      message,
      spinner: 'crescent',
      translucent: true,
      backdropDismiss: false
    });

    await this.loading.present();
  }

  /**
   * Oculta el loading
   */
  async hideLoading(): Promise<void> {
    if (this.loading) {
      await this.loading.dismiss();
      this.loading = null;
    }
  }

  /**
   * Muestra una alerta con inputs
   */
  async showPrompt(
    header: string,
    message: string,
    inputs: any[] = [],
    confirmText: string = 'OK',
    cancelText: string = 'Cancelar'
  ): Promise<any> {
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        header,
        message,
        cssClass: 'night-alert',
        inputs,
        buttons: [
          {
            text: cancelText,
            role: 'cancel',
            handler: () => resolve(null)
          },
          {
            text: confirmText,
            handler: (data) => resolve(data)
          }
        ]
      });

      await alert.present();
    });
  }

  // ─── Notificaciones Pro — API simplificada Night Stadium ────────────────────

  async success(message: string): Promise<void> {
    await this.presentNightToast(message, 2500, 'toast-success');
  }

  async error(message: string): Promise<void> {
    await this.presentNightToast(message, 4000, 'toast-error');
  }

  async warning(message: string): Promise<void> {
    await this.presentNightToast(message, 3500, 'toast-warning');
  }

  async info(message: string): Promise<void> {
    await this.presentNightToast(message, 3000, 'toast-info');
  }

  private async presentNightToast(message: string, duration: number, typeClass: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration,
      position: 'top',
      cssClass: ['night-toast', typeClass],
      buttons: [{ icon: 'close-outline', role: 'cancel' }]
    });
    await toast.present();
  }

  /**
   * Muestra un toast con acción
   */
  async showToastWithAction(
    message: string,
    actionText: string,
    actionHandler: () => void,
    color: string = 'primary'
  ): Promise<void> {
    const toast = await this.toastController.create({
      message,
      color,
      buttons: [
        {
          text: actionText,
          handler: actionHandler
        },
        {
          text: 'Cerrar',
          role: 'cancel'
        }
      ]
    });

    await toast.present();
  }
}