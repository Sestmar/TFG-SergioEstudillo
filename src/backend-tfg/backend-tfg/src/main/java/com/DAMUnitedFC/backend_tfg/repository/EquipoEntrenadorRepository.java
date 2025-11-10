package com.DAMUnitedFC.backend_tfg.repository;

import com.DAMUnitedFC.backend_tfg.model.EquipoEntrenador;
import com.DAMUnitedFC.backend_tfg.model.EquipoEntrenadorId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EquipoEntrenadorRepository extends JpaRepository<EquipoEntrenador, EquipoEntrenadorId> {}