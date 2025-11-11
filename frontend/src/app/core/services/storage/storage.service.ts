import { Injectable } from '@angular/core';

/**
 * Servicio de almacenamiento para gestionar localStorage y sessionStorage
 * Proporciona métodos seguros para guardar y recuperar datos
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private isStorageAvailable: boolean;

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

  /**
   * Guarda un valor en localStorage
   */
  set(key: string, value: any): boolean {
    if (!this.isStorageAvailable) {
      console.warn('localStorage no está disponible');
      return false;
    }

    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
      return true;
    } catch (error) {
      console.error('Error guardando en localStorage:', error);
      return false;
    }
  }

  /**
   * Recupera un valor de localStorage
   */
  get(key: string): any {
    if (!this.isStorageAvailable) {
      return null;
    }

    try {
      const value = localStorage.getItem(key);
      if (value === null) {
        return null;
      }
      return JSON.parse(value);
    } catch (error) {
      console.error('Error leyendo de localStorage:', error);
      this.remove(key);
      return null;
    }
  }

  /**
   * Elimina un valor de localStorage
   */
  remove(key: string): boolean {
    if (!this.isStorageAvailable) {
      return false;
    }

    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error eliminando de localStorage:', error);
      return false;
    }
  }

  /**
   * Limpia todo localStorage
   */
  clear(): boolean {
    if (!this.isStorageAvailable) {
      return false;
    }

    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error limpiando localStorage:', error);
      return false;
    }
  }

  /**
   * Obtiene todas las claves de localStorage
   */
  keys(): string[] {
    if (!this.isStorageAvailable) {
      return [];
    }

    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.error('Error obteniendo claves de localStorage:', error);
      return [];
    }
  }

  /**
   * Verifica si una clave existe en localStorage
   */
  exists(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Obtiene el tamaño total de localStorage en bytes
   */
  getSize(): number {
    if (!this.isStorageAvailable) {
      return 0;
    }

    try {
      return new Blob(Object.values(localStorage)).size;
    } catch (error) {
      console.error('Error calculando tamaño de localStorage:', error);
      return 0;
    }
  }

  /**
   * Guarda un valor con expiración en localStorage
   */
  setWithExpiry(key: string, value: any, ttlMinutes: number): boolean {
    const item = {
      value: value,
      expiry: Date.now() + (ttlMinutes * 60 * 1000)
    };
    return this.set(key, item);
  }

  /**
   * Recupera un valor con verificación de expiración
   */
  getWithExpiry(key: string): any {
    const itemStr = localStorage.getItem(key);
    
    if (!itemStr) {
      return null;
    }

    try {
      const item = JSON.parse(itemStr);
      
      if (Date.now() > item.expiry) {
        this.remove(key);
        return null;
      }
      
      return item.value;
    } catch (error) {
      console.error('Error leyendo item con expiración:', error);
      this.remove(key);
      return null;
    }
  }
}