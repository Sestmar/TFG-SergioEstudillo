package com.DAMUnitedFC.backend_tfg.repository;

import com.DAMUnitedFC.backend_tfg.model.JugadorEquipo;
import com.DAMUnitedFC.backend_tfg.model.JugadorEquipoId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JugadorEquipoRepository extends JpaRepository<JugadorEquipo, JugadorEquipoId> {}