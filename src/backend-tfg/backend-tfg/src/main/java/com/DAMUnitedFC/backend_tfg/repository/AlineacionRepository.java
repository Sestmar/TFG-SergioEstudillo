package com.DAMUnitedFC.backend_tfg.repository;

import com.DAMUnitedFC.backend_tfg.model.Alineacion;
import com.DAMUnitedFC.backend_tfg.model.Jugador;
import com.DAMUnitedFC.backend_tfg.model.Partido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

@Repository
public interface AlineacionRepository extends JpaRepository<Alineacion, Long> {

    List<Alineacion> findByPartidoIdPartido(Long idPartido);

    @Query("SELECT a FROM Alineacion a WHERE a.partido.idPartido = :idPartido AND a.jugador.idJugador = :idJugador")
    Optional<Alineacion> findFichaExacta(@Param("idPartido") Long idPartido, @Param("idJugador") Integer idJugador);

    Optional<Alineacion> findByPartidoAndJugador(Partido partido, Jugador jugador);

    List<Alineacion> findByJugador(Jugador jugador);
    void deleteByJugador(Jugador jugador);

    // 👇 ESTE ES EL QUE FALTA Y CAUSA EL ERROR
    void deleteByPartido(Partido partido);

    // Este otro ya lo tenías, puedes dejarlo si lo usas en otro sitio
    void deleteByPartidoIdPartido(Long idPartido);

    // --- ESTADÍSTICAS ---
    @Query("SELECT COUNT(a) FROM Alineacion a WHERE a.jugador.idJugador = :idJugador AND a.minutosJugados > 0")
    Integer countPartidosJugados(@Param("idJugador") Integer idJugador);

    @Query("SELECT SUM(a.goles) FROM Alineacion a WHERE a.jugador.idJugador = :idJugador")
    Integer sumGoles(@Param("idJugador") Integer idJugador);

    @Query("SELECT SUM(a.asistencias) FROM Alineacion a WHERE a.jugador.idJugador = :idJugador")
    Integer sumAsistencias(@Param("idJugador") Integer idJugador);

    @Query("SELECT SUM(a.minutosJugados) FROM Alineacion a WHERE a.jugador.idJugador = :idJugador")
    Integer sumMinutos(@Param("idJugador") Integer idJugador);
}