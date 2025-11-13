import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
// ¡ARREGLO! Importamos desde 'models.ts'
import { User, UserRegisterDto, UserUpdateDto } from 'src/app/shared/models/models';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private apiService: ApiService) {}

  // (Asumo que tus funciones eran así)

  updateUser(userId: number, data: UserUpdateDto): Observable<User> {
    return this.apiService.put<User>(`usuarios/${userId}`, data);
  }
  
  updateCurrentUser(data: UserUpdateDto): Observable<User> {
    return this.apiService.put<User>('usuarios/current', data);
  }
  
  deactivateUser(userId: number): Observable<void> {
    return this.apiService.put<void>(`usuarios/${userId}/deactivate`, {});
  }
  
  activateUser(userId: number): Observable<void> {
    return this.apiService.put<void>(`usuarios/${userId}/activate`, {});
  }
  
  changeUserRole(userId: number, newRole: string): Observable<User> {
    return this.apiService.put<User>(`usuarios/${userId}/role`, { role: newRole });
  }
}