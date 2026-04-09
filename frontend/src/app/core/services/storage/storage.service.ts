import { Injectable } from '@angular/core';

/**
 * Servicio de almacenamiento para gestionar localStorage
 * Proporciona métodos seguros para guardar y recuperar datos
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private isStorageAvailable: boolean;
  private readonly TOKEN_KEY = 'auth_token'; // Clave fija para el token

  constructor() {
    this.isStorageAvailable = this.checkStorageAvailability();
  }

  /**
   * Verifica si localStorage está disponible
   */
  private checkStorageAvailability(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  // ==========================================
  // === MÉTODOS ESPECIALES PARA EL TOKEN ===
  // ==========================================

  /**
   * Guarda el token SIN comillas (texto plano)
   * IMPORTANTE: Usar este método para el token JWT
   */
  setToken(token: string): void {
    if (!this.isStorageAvailable) return;
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
    } catch {}
  }

  /**
   * Recupera el token limpio
   */
  getToken(): string | null {
    if (!this.isStorageAvailable) return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Elimina solo el token
   */
  removeToken(): void {
    if (!this.isStorageAvailable) return;
    localStorage.removeItem(this.TOKEN_KEY);
  }

  // ==========================================
  // === MÉTODOS GENÉRICOS (Para objetos) ===
  // ==========================================

  /**
   * Guarda un valor serializado (JSON)
   * Úsalo para guardar objetos de usuario, preferencias, etc.
   */
  set(key: string, value: any): boolean {
    if (!this.isStorageAvailable) return false;

    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Recupera un valor serializado
   */
  get(key: string): any {
    if (!this.isStorageAvailable) return null;

    try {
      const value = localStorage.getItem(key);
      if (value === null) {
        return null;
      }
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  /**
   * Elimina un valor específico
   */
  remove(key: string): boolean {
    if (!this.isStorageAvailable) return false;

    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Limpia todo localStorage
   */
  clear(): boolean {
    if (!this.isStorageAvailable) return false;

    try {
      localStorage.clear();
      return true;
    } catch {
      return false;
    }
  }

  keys(): string[] {
    if (!this.isStorageAvailable) return [];
    try {
      return Object.keys(localStorage);
    } catch (error) {
      return [];
    }
  }

  exists(key: string): boolean {
    return this.get(key) !== null;
  }
}