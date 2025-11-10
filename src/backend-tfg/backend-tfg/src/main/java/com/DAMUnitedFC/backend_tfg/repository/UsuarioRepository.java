package com.DAMUnitedFC.backend_tfg.repository;

import com.DAMUnitedFC.backend_tfg.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    // Puedes definir métodos personalizados aquí si lo necesitas
}

