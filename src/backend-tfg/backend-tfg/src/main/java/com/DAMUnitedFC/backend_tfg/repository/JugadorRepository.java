package com.DAMUnitedFC.backend_tfg.repository;

import com.DAMUnitedFC.backend_tfg.model.Jugador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JugadorRepository extends JpaRepository<Jugador, Integer> {

    // 1. Para el Dashboard (Privado):
    // Busca la ficha de jugador usando el ID del Usuario (Login)
    Optional<Jugador> findByUsuario_IdUsuario(Long idUsuario);

    // 2. Para la Zona Pública:
    // Busca todos los jugadores que tengan asignado cierto ID de equipo
    // Spring Data se encarga de la conversión de tipos si la columna es compatible
    List<Jugador> findByEquipoPrincipal_IdEquipo(Long idEquipo);
}