/**
 * Modelo de Usuario base según API REST
 * Representa el perfil fundamental del sistema
 */
export interface User {
  id: number;
  username: string;
  email: string;
  nombre: string;
  apellidos: string;
  telefono?: string;
  fechaNacimiento?: Date;
  fotoPerfil?: string;
  activo: boolean;
  fechaRegistro: Date;
  fechaActualizacion: Date;
  roles: UserRole[];
}

/**
 * Roles disponibles en el sistema
 */
export type UserRole = 'USUARIO' | 'JUGADOR' | 'ENTRENADOR' | 'ADMIN';

/**
 * DTO para registro de nuevos usuarios
 */
export interface UserRegisterDto {
  username: string;
  email: string;
  password: string;
  nombre: string;
  apellidos: string;
  telefono?: string;
  fechaNacimiento?: Date;
}

/**
 * DTO para actualización de perfil de usuario
 */
export interface UserUpdateDto {
  nombre?: string;
  apellidos?: string;
  telefono?: string;
  fechaNacimiento?: Date;
  fotoPerfil?: string;
}

/**
 * DTO para login de usuario
 */
export interface UserLoginDto {
  username: string;
  password: string;
}

/**
 * Respuesta de autenticación con JWT
 */
export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
  expiresIn: number;
}