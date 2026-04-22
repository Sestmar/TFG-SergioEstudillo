package com.DAMUnitedFC.backend_tfg.repository;

import com.DAMUnitedFC.backend_tfg.model.Reaccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReaccionRepository extends JpaRepository<Reaccion, Long> {

    List<Reaccion> findByMensaje_Id(Long mensajeId);

    Optional<Reaccion> findByMensaje_IdAndUsuario_IdUsuario(Long mensajeId, Integer usuarioId);
}
