package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.dto.AlineacionDto;
import com.DAMUnitedFC.backend_tfg.model.Alineacion;
import com.DAMUnitedFC.backend_tfg.model.Partido;
import com.DAMUnitedFC.backend_tfg.model.Jugador;
import com.DAMUnitedFC.backend_tfg.repository.AlineacionRepository;
import com.DAMUnitedFC.backend_tfg.repository.PartidoRepository;
import com.DAMUnitedFC.backend_tfg.repository.JugadorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/alineaciones")
@CrossOrigin(origins = "*")
public class AlineacionController {

    @Autowired
    private AlineacionRepository alineacionRepo;
    @Autowired
    private PartidoRepository partidoRepo;
    @Autowired
    private JugadorRepository jugadorRepo;

    @GetMapping("/partido/{idPartido}")
    public List<Alineacion> getAlineacion(@PathVariable Long idPartido) {
        return alineacionRepo.findByPartidoIdPartido(idPartido);
    }

    @PostMapping("/guardar")
    @Transactional
    public ResponseEntity<?> guardarAlineacion(@RequestBody List<AlineacionDto> fichas) {

        // Mapa para la respuesta JSON (Soluciona el error de "parsing" en Angular)
        Map<String, Object> response = new HashMap<>();

        if (fichas == null || fichas.isEmpty()) {
            response.put("mensaje", "No hay fichas para guardar");
            return ResponseEntity.ok(response);
        }

        try {
            for (AlineacionDto ficha : fichas) {

                // Validación de seguridad
                if (ficha.getIdPartido() == null || ficha.getIdJugador() == null) continue;

                // 1. Buscamos si la ficha ya existe
                Alineacion alineacion = alineacionRepo
                        .findFichaExacta(ficha.getIdPartido(), ficha.getIdJugador())
                        .orElse(new Alineacion());

                // 2. Si es nueva, asignamos las relaciones
                if (alineacion.getId() == null) {
                    Partido p = partidoRepo.findById(ficha.getIdPartido())
                            .orElseThrow(() -> new RuntimeException("Partido no encontrado"));

                    Jugador j = jugadorRepo.findById(ficha.getIdJugador())
                            .orElseThrow(() -> new RuntimeException("Jugador no encontrado"));

                    alineacion.setPartido(p);
                    alineacion.setJugador(j);

                    // --- ASIGNACIÓN DE EQUIPO (Corrección de Tipos) ---
                    if (j.getEquipoPrincipal() != null) {
                        // Convertimos Integer a Long de forma segura
                        Number equipoId = j.getEquipoPrincipal().getIdEquipo();
                        alineacion.setIdEquipo(equipoId.longValue());
                    } else {
                        // Si el jugador no tiene equipo, usamos el del partido como respaldo
                        // (Necesitamos evitar que idEquipo sea NULL para que no falle la BD)
                        System.out.println("ADVERTENCIA: Jugador " + j.getIdJugador() + " sin equipo principal.");
                        // Aquí podrías poner un valor por defecto o lanzar error si es crítico
                        // alineacion.setIdEquipo(1L); // Ejemplo de parche si fuera necesario
                        continue; // Saltamos este jugador para no romper el guardado del resto
                    }
                }

                // 3. Actualizamos posición
                alineacion.setSlotId(ficha.getSlotId());
                alineacion.setEsTitular(true);

                alineacionRepo.save(alineacion);
            }

            response.put("success", true);
            response.put("mensaje", "Alineación guardada correctamente");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace(); // Ver error en consola backend
            response.put("success", false);
            response.put("error", "Error interno: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}