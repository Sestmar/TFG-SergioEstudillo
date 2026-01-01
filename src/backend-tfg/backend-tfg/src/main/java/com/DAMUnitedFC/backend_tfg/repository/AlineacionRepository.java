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

    // Buscar alineación completa de un partido
    List<Alineacion> findByPartidoIdPartido(Long idPartido);

    // Buscar historial de alineaciones de un jugador
    List<Alineacion> findByJugador(Jugador jugador);

    // 🔥 NUEVO: Necesario para borrar en cascada
    void deleteByJugador(Jugador jugador);

    // 🔥 NUEVO Y CRÍTICO: Busca si un jugador concreto ya está en la alineación de un partido
    // Devuelve Optional para poder hacer if(isPresent) en el controlador
    @Query("SELECT a FROM Alineacion a WHERE a.partido.idPartido = :idPartido AND a.jugador.idJugador = :idJugador")
    Optional<Alineacion> findFichaExacta(@Param("idPartido") Long idPartido, @Param("idJugador") Integer idJugador);

    void deleteByPartidoIdPartido(Long idPartido);

    // --- ESTADÍSTICAS (Se mantienen igual, funcionan bien) ---

    @Query("SELECT COUNT(a) FROM Alineacion a WHERE a.jugador.idJugador = :idJugador AND a.minutosJugados > 0")
    Integer countPartidosJugados(@Param("idJugador") Integer idJugador);

    @Query("SELECT SUM(a.goles) FROM Alineacion a WHERE a.jugador.idJugador = :idJugador")
    Integer sumGoles(@Param("idJugador") Integer idJugador);

    @Query("SELECT SUM(a.asistencias) FROM Alineacion a WHERE a.jugador.idJugador = :idJugador")
    Integer sumAsistencias(@Param("idJugador") Integer idJugador);

    @Query("SELECT SUM(a.minutosJugados) FROM Alineacion a WHERE a.jugador.idJugador = :idJugador")
    Integer sumMinutos(@Param("idJugador") Integer idJugador);
}