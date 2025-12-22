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

    @PostMapping("/guardar/{idPartido}")
    @Transactional
    public ResponseEntity<?> guardarAlineacion(@PathVariable Long idPartido, @RequestBody List<AlineacionDto> fichas) {

        Map<String, Object> response = new HashMap<>();

        try {
            // 🔥 PASO 1: BORRADO E INMEDIATA CONFIRMACIÓN (FLUSH)
            // Esto soluciona el error "Duplicate Key". Obligamos a la BD a borrar ANTES de insertar.
            alineacionRepo.deleteByPartidoIdPartido(idPartido);
            alineacionRepo.flush(); // <--- ¡ESTA ES LA LÍNEA MÁGICA! 🪄

            if (fichas == null || fichas.isEmpty()) {
                response.put("success", true);
                response.put("mensaje", "Pizarra limpiada correctamente");
                return ResponseEntity.ok(response);
            }

            // 🔥 PASO 2: GUARDAR LOS NUEVOS
            for (AlineacionDto ficha : fichas) {
                if (ficha.getIdJugador() == null) continue;

                Alineacion alineacion = new Alineacion(); // Creamos nueva siempre

                Partido p = partidoRepo.findById(idPartido)
                        .orElseThrow(() -> new RuntimeException("Partido no encontrado"));

                Jugador j = jugadorRepo.findById(ficha.getIdJugador())
                        .orElseThrow(() -> new RuntimeException("Jugador no encontrado"));

                alineacion.setPartido(p);
                alineacion.setJugador(j);

                if (j.getEquipoPrincipal() != null) {
                    Number equipoId = j.getEquipoPrincipal().getIdEquipo();
                    alineacion.setIdEquipo(equipoId.longValue());
                } else {
                    continue;
                }

                alineacion.setSlotId(ficha.getSlotId());
                alineacion.setEsTitular(true);

                alineacionRepo.save(alineacion);
            }

            response.put("success", true);
            response.put("mensaje", "Alineación guardada correctamente");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("error", "Error interno: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}