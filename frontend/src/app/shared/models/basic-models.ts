// Modelos básicos temporales para que compile
export interface User {
  id: number;
  nombre: string;
  email: string;
  roles: UserRole[];
}

export interface Team {
  id: number;
  nombre: string;
  categoria: string;
}

export interface Player {
  id: number;
  nombre: string;
}

export interface Coach {
  id: number;
  nombre: string;
}

export interface Convocation {
  id: number;
  fecha: string;
}

export type PlayerPosition = 'PORTERO' | 'DEFENSA' | 'MEDIO' | 'DELANTERO';
export type UserRole = 'ADMIN' | 'USUARIO' | 'ENTRENADOR' | 'JUGADOR';