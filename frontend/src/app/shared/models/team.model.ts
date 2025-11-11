/**
 * Modelo de Equipo según API REST
 * Representa los equipos del club (fútbol 11, fútbol sala, etc.)
 */
export interface Team {
  id: number;
  nombre: string;
  categoria: Category;
  liga: Liga;
  entrenadorPrincipal?: Coach;
  entrenadorAsistente?: Coach;
  jugadores: Player[];
  escudo?: string;
  colorPrincipal: string;
  colorSecundario: string;
  fechaFundacion: Date;
  activo: boolean;
  estadisticas?: TeamStats;
}

/**
 * Categoría por edad del equipo
 */
export interface Category {
  id: number;
  nombre: string;
  edadMinima: number;
  edadMaxima: number;
  descripcion: string;
}

/**
 * Liga o competición
 */
export interface Liga {
  id: number;
  nombre: string;
  nivel: string;
  region: string;
  temporada: string;
}

/**
 * Estadísticas del equipo
 */
export interface TeamStats {
  partidosJugados: number;
  partidosGanados: number;
  partidosEmpatados: number;
  partidosPerdidos: number;
  golesFavor: number;
  golesContra: number;
  puntos: number;
  posicionLiga: number;
}