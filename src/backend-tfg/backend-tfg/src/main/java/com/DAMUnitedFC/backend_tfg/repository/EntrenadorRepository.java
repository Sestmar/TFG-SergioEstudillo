package com.DAMUnitedFC.backend_tfg.repository;

import com.DAMUnitedFC.backend_tfg.model.Entrenador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EntrenadorRepository extends JpaRepository<Entrenador, Integer> {

    // Busca el perfil de entrenador asociado a un usuario (Login)
    Optional<Entrenador> findByUsuario_IdUsuario(Integer idUsuario);
}