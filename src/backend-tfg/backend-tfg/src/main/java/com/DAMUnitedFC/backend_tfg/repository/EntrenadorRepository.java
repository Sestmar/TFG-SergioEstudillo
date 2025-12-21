package com.DAMUnitedFC.backend_tfg.repository;

import com.DAMUnitedFC.backend_tfg.model.Entrenador;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EntrenadorRepository extends JpaRepository<Entrenador, Integer> {
    Optional<Entrenador> findByUsuario_IdUsuario(Integer idUsuario);
}