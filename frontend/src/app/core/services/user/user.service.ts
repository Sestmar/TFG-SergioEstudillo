import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../api/api.service';
import { User, UserRegisterDto, UserUpdateDto } from '@shared/models';

/**
 * Servicio para gestión de usuarios
 * Maneja operaciones CRUD relacionadas con usuarios
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private apiService: ApiService) {}

  /**
   * Registra un nuevo usuario
   */
  register(userData: UserRegisterDto): Observable<User> {
    return this.apiService.post<User>('usuarios', userData);
  }

  /**
   * Obtiene todos los usuarios (solo admin)
   */
  getAllUsers(params?: { page?: number; size?: number; role?: string }): Observable<{ users: User[]; total: number }> {
    return this.apiService.get<{ users: User[]; total: number }>('usuarios', params);
  }

  /**
   * Obtiene un usuario por ID
   */
  getUserById(id: number): Observable<User> {
    return this.apiService.get<User>(`usuarios/${id}`);
  }

  /**
   * Obtiene el usuario actual
   */
  getCurrentUser(): Observable<User> {
    return this.apiService.get<User>('usuarios/current');
  }

  /**
   * Actualiza el perfil del usuario
   */
  updateProfile(userId: number, data: UserUpdateDto): Observable<User> {
    return this.apiService.put<User>(`usuarios/${userId}`, data);
  }

  /**
   * Actualiza el perfil del usuario actual
   */
  updateCurrentUser(data: UserUpdateDto): Observable<User> {
    return this.apiService.put<User>('usuarios/current', data);
  }

  /**
   * Desactiva un usuario (soft delete)
   */
  deactivateUser(userId: number): Observable<void> {
    return this.apiService.put<void>(`usuarios/${userId}/deactivate`, {});
  }

  /**
   * Reactiva un usuario desactivado
   */
  activateUser(userId: number): Observable<void> {
    return this.apiService.put<void>(`usuarios/${userId}/activate`, {});
  }

  /**
   * Cambia el rol de un usuario
   */
  changeUserRole(userId: number, newRole: string): Observable<User> {
    return this.apiService.put<User>(`usuarios/${userId}/role`, { role: newRole });
  }

  /**
   * Busca usuarios por término
   */
  searchUsers(term: string, params?: { page?: number; size?: number }): Observable<{ users: User[]; total: number }> {
    return this.apiService.get<{ users: User[]; total: number }>('usuarios/search', {
      term,
      ...params
    });
  }

  /**
   * Obtiene estadísticas de usuarios (solo admin)
   */
  getUserStats(): Observable<{ 
    totalUsers: number;
    activeUsers: number;
    usersByRole: { [key: string]: number };
    newUsersThisMonth: number;
  }> {
    return this.apiService.get<any>('usuarios/stats');
  }
}