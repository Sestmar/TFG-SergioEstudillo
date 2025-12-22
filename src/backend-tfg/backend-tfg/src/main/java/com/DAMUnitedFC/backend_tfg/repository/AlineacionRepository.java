package com.DAMUnitedFC.backend_tfg.repository;

import com.DAMUnitedFC.backend_tfg.model.Alineacion;
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

    // Buscar ficha exacta (para actualizar si ya existe)
    @Query("SELECT a FROM Alineacion a WHERE a.partido.idPartido = :idPartido AND a.jugador.idJugador = :idJugador")
    Optional<Alineacion> findFichaExacta(@Param("idPartido") Long idPartido, @Param("idJugador") Integer idJugador);

    void deleteByPartidoIdPartido(Long idPartido);
}