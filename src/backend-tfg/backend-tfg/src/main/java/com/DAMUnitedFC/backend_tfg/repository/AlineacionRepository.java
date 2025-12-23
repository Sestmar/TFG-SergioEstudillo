package com.DAMUnitedFC.backend_tfg.repository;

import com.DAMUnitedFC.backend_tfg.model.Alineacion;
import com.DAMUnitedFC.backend_tfg.model.Jugador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

@Repository
public interface AlineacionRepository extends JpaRepository<Alineacion, Long> {

    // Buscar alineación de un partido
    List<Alineacion> findByPartidoIdPartido(Long idPartido);
    // ✅ ESTE ES EL QUE FALTABA para el PublicController:
    List<Alineacion> findByJugador(Jugador jugador);

    // Buscar ficha exacta
    @Query("SELECT a FROM Alineacion a WHERE a.partido.idPartido = :idPartido AND a.jugador.idJugador = :idJugador")
    Optional<Alineacion> findFichaExacta(@Param("idPartido") Long idPartido, @Param("idJugador") Integer idJugador);

    void deleteByPartidoIdPartido(Long idPartido);

    // --- 🔥 QUERIES PARA ESTADÍSTICAS ---

    // 1. Partidos Jugados (cuenta cuántas veces aparece el jugador en la tabla alineación)
    @Query("SELECT COUNT(a) FROM Alineacion a WHERE a.jugador.idJugador = :idJugador")
    Integer countPartidosJugados(@Param("idJugador") Integer idJugador);

    // 2. Suma de Goles
    @Query("SELECT SUM(a.goles) FROM Alineacion a WHERE a.jugador.idJugador = :idJugador")
    Integer sumGoles(@Param("idJugador") Integer idJugador);

    // 3. Suma de Asistencias
    @Query("SELECT SUM(a.asistencias) FROM Alineacion a WHERE a.jugador.idJugador = :idJugador")
    Integer sumAsistencias(@Param("idJugador") Integer idJugador);

    // 4. Suma de Minutos
    @Query("SELECT SUM(a.minutosJugados) FROM Alineacion a WHERE a.jugador.idJugador = :idJugador")
    Integer sumMinutos(@Param("idJugador") Integer idJugador);
}