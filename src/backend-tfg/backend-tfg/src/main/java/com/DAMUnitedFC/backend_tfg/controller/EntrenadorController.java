package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.dto.EntrenadorDto;
import com.DAMUnitedFC.backend_tfg.model.Entrenador;
import com.DAMUnitedFC.backend_tfg.repository.EntrenadorRepository;
import com.DAMUnitedFC.backend_tfg.repository.UsuarioRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/entrenadores")
public class EntrenadorController {

    private final EntrenadorRepository repo;
    private final UsuarioRepository usuarioRepo;

    public EntrenadorController(EntrenadorRepository repo, UsuarioRepository usuarioRepo) {
        this.repo = repo;
        this.usuarioRepo = usuarioRepo;
    }

    @GetMapping
    public List<Entrenador> listar() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public Entrenador obtener(@PathVariable Integer id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Entrenador no encontrado"));
    }

    @PostMapping
    public Entrenador crear(@RequestBody EntrenadorDto dto) {
        Entrenador e = new Entrenador();
        e.setUsuario(usuarioRepo.findById(dto.getIdUsuario()).orElseThrow());
        e.setEspecialidad(dto.getEspecialidad());
        e.setLicencia(dto.getLicencia());
        return repo.save(e);
    }

    @PutMapping("/{id}")
    public Entrenador actualizar(@PathVariable Integer id, @RequestBody EntrenadorDto dto) {
        Entrenador e = repo.findById(id).orElseThrow(() -> new RuntimeException("Entrenador no encontrado"));
        e.setUsuario(usuarioRepo.findById(dto.getIdUsuario()).orElseThrow());
        e.setEspecialidad(dto.getEspecialidad());
        e.setLicencia(dto.getLicencia());
        return repo.save(e);
    }

    @DeleteMapping("/{id}")
    public void borrar(@PathVariable Integer id) {
        repo.deleteById(id);
    }
}