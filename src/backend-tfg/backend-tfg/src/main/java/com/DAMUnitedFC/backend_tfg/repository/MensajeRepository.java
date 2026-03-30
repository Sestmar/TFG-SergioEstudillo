package com.DAMUnitedFC.backend_tfg.repository;

import com.DAMUnitedFC.backend_tfg.model.Mensaje;
import com.DAMUnitedFC.backend_tfg.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MensajeRepository extends JpaRepository<Mensaje, Long> {

    // Historial de chat grupal de un equipo
    List<Mensaje> findByEquipo_IdEquipoOrderByFechaHoraAsc(Integer idEquipo);

    // Historial de chat privado entre dos usuarios (en cualquier dirección)
    List<Mensaje> findByRemitenteAndDestinatarioOrDestinatarioAndRemitenteOrderByFechaHoraAsc(
            Usuario remitente, Usuario destinatario,
            Usuario destinatario2, Usuario remitente2);

    // Mensajes no leídos de un usuario
    List<Mensaje> findByDestinatario_IdUsuarioAndLeidoFalse(Integer idUsuario);
}
