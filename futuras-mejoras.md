he entendido el plan completo. Gemini ha redactado en
futuras-mejoras.md el plan completo, pero en instruccion.md
 te ha dado los pasos exactos para ir implementandolo poco
a poco. Lee instruccion.md y pasemos a la accion! dejemos
la app lista para el despegue como un cohete de la NASAç

  Read 1 file (ctrl+o to expand)

● Fantástico. 6 pasos, dos fases. Arrancamos con el Paso 1 —
   Modelo y DTOs.

  Antes de tocar código, leo lo que existe para no inventar
  nada:

● Bash(find "/c/Users/Usuario/Documents/2DAM/TFG-SergioEstud
      illo/TFG-SergioEstudillo/src" -name "*.java" | xargs
      grep -l "EquipoDto\|EquipoResumen" 2>/dev/null |
      head…)
  ⎿  /c/Users/Usuario/Documents/2DAM/TFG-SergioEstudill
     o/TFG-SergioEstudillo/src/backend-tfg/backend-tfg/
     src/main/java/com/DAMUnitedFC/backend_tfg/controll
     … +18 lines (ctrl+o to expand)

  Searched for 2 patterns, read 1 file (ctrl+o to expand)

● Tengo todo lo que necesito. Arranco el Paso 1:

  Qué voy a tocar:
  - Equipo.java — añadir campo puntosObjetivo
  - EquipoDto.java — añadir puntosObjetivo para que el admin
   pueda setearlo
  - Crear SeasonStatsDto.java — el contrato de respuesta del
   nuevo endpoint

● Update(/c/Users/Usuario/Documents/2DAM/TFG-SergioEstudillo
        /TFG-SergioEstudillo/src/backend-tfg/backend-tfg/src
        /main/java/com/DAMUnitedFC/backend_tfg/model/Equipo.
        java)
  ⎿  Added 3 lines
      41      @JsonIgnoreProperties({"equipos", "hibe
          rnateLazyInitializer", "handler"})
      42      private Liga liga;
      43
      44 +    @Column(name = "puntos_objetivo")
      45 +    private Integer puntosObjetivo;
      46 +
      47      @OneToOne
      48      @JoinColumn(name = "id_entrenador")
      49      @ToString.Exclude

● Update(/c/Users/Usuario/Documents/2DAM/TFG-SergioEstudillo
        /TFG-SergioEstudillo/src/backend-tfg/backend-tfg/src
        /main/java/com/DAMUnitedFC/backend_tfg/dto/EquipoDto
        .java)
  ⎿  Added 1 line
      10      private Integer idCategoria;
      11      private Integer idLiga;
      12      private String escudoUrl;
      13 +    private Integer puntosObjetivo;
      14  }
      15   No newline at end of file

● Write(/c/Users/Usuario/Documents/2DAM/TFG-SergioEstudillo/
       TFG-SergioEstudillo/src/backend-tfg/backend-tfg/src/m
       ain/java/com/DAMUnitedFC/backend_tfg/dto/SeasonStatsD
       to.java)
  ⎿  Wrote 19 lines to
     ..\..\..\..\..\..\..\c\Users\Usuario\Documents\2DA
     M\TFG-SergioEstudillo\TFG-SergioEstudillo\src\back
     end-tfg\backend-tfg\src\main\java\com\DAMUnitedFC\
     backend_tfg\dto\SeasonStatsDto.java
       1 package com.DAMUnitedFC.backend_tfg.dto;
       2
       3 import lombok.Data;
       4 import java.util.List;
       5
       6 @Data
       7 public class SeasonStatsDto {
       8
       9     private Integer pj;               // Par
         tidos jugados
      10     private Integer g;                // Vic
         torias
     … +9 lines (ctrl+o to expand)

● Paso 1 ✅ — Modelo y DTOs

  Tres cambios quirúrgicos:

  Archivo: Equipo.java
  Cambio: Campo puntosObjetivo (Integer, nullable) — JPA lo
    añade como columna en la BD al arrancar con
    spring.jpa.hibernate.ddl-auto=update
  ────────────────────────────────────────
  Archivo: EquipoDto.java
  Cambio: Campo puntosObjetivo — el admin puede setearlo via

    el endpoint de edición existente
  ────────────────────────────────────────
  Archivo: SeasonStatsDto.java
  Cambio: DTO nuevo con pj, g, e, p, gf, gc, puntos,
    puntosObjetivo, categoriaNombre, racha[] — incluye
    categoriaNombre para aprovechar el campo que mencionaste

  ¿OK para el Paso 2 — lógica de negocio en el Service?