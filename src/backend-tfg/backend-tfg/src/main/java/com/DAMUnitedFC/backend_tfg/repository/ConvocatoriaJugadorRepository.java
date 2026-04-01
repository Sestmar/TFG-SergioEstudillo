package com.DAMUnitedFC.backend_tfg.repository;

import com.DAMUnitedFC.backend_tfg.model.ConvocatoriaJugador;
import com.DAMUnitedFC.backend_tfg.model.ConvocatoriaJugadorId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ConvocatoriaJugadorRepository extends JpaRepository<ConvocatoriaJugador, ConvocatoriaJugadorId> {

    @Query("SELECT cj FROM ConvocatoriaJugador cj WHERE cj.jugador.idJugador = :idJugador ORDER BY cj.convocatoria.fechaEvento DESC")
    List<ConvocatoriaJugador> findByJugadorId(@Param("idJugador") Integer idJugador);
}