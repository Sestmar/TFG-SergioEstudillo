package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.dto.PublicPlayerDto;
import com.DAMUnitedFC.backend_tfg.dto.PublicTeamDto;
import com.DAMUnitedFC.backend_tfg.service.PublicService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    private final PublicService publicService;

    public PublicController(PublicService publicService) {
        this.publicService = publicService;
    }

    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("pong");
    }

    @GetMapping("/equipos")
    public ResponseEntity<List<PublicTeamDto>> getAllPublicTeams() {
        return ResponseEntity.ok(publicService.getAllPublicTeams());
    }

    @GetMapping("/equipos/{idEquipo}/plantilla")
    public ResponseEntity<List<PublicPlayerDto>> getPublicRoster(@PathVariable Long idEquipo) {
        return ResponseEntity.ok(publicService.getPublicRoster(idEquipo));
    }
}
