package com.DAMUnitedFC.backend_tfg.repository;

import com.DAMUnitedFC.backend_tfg.model.Jugador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface JugadorRepository extends JpaRepository<Jugador, Integer> {

    // CORRECCIÓN:
    // Spring busca "id" por defecto. Como tu campo se llama "idUsuario",
    // debemos llamarlo findByUsuario_IdUsuario (o findByUsuarioIdUsuario).
    // El guion bajo (_) ayuda a Spring a separar la Entidad del Campo.

    Optional<Jugador> findByUsuario_IdUsuario(Long idUsuario);
}