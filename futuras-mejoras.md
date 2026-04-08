Correcto. Ya veo que AdminController tiene @PreAuthorize("hasRole('ADMIN')")
  a nivel de clase, así que cualquier endpoint que agregue ahí queda
  automáticamente protegido. Bien.

  Déjame ver el modelo Usuario y Jugador rápido para saber los campos
  disponibles antes de escribir nada.

  Searched for 2 patterns, read 2 files (ctrl+o to expand)

● Perfecto, tengo todo lo que necesito. Voy a agregar:

  1. El método actualizarUsuario() en AdminService — actualiza Usuario (nombre,
   apellidos, email, teléfono) y si tiene Jugador asociado también actualiza
  (dorsal, posición, estado, equipo)
  2. El endpoint PUT /api/admin/usuarios/{id} en AdminController — protegido
  por el @PreAuthorize de clase

● Update(src\backend-tfg\backend-tfg\src\main\java\com\DAMUnitedFC\backend_tfg\
        service\AdminService.java)
  ⎿  Added 31 lines
       97      }
       98
       99      @Transactional
      100 +    public void actualizarUsuario(Integer id, Map<String, Obj
          +ect> payload) {
      101 +        Usuario u = usuarioRepo.findById(id)
      102 +                .orElseThrow(() -> new RuntimeException("Usua
          +rio no encontrado"));
      103 +
      104 +        if (payload.containsKey("nombre")) u.setNombre((Strin
          +g) payload.get("nombre"));
      105 +        if (payload.containsKey("apellidos")) u.setApellidos(
          +(String) payload.get("apellidos"));
      106 +        if (payload.containsKey("email")) u.setEmail((String)
          + payload.get("email"));
      107 +        if (payload.containsKey("telefono")) u.setTelefono((S
          +tring) payload.get("telefono"));
      108 +        usuarioRepo.save(u);
      109 +
      110 +        jugadorRepo.findByUsuario_IdUsuario(id).ifPresent(jug
          +ador -> {
      111 +            if (payload.containsKey("dorsal")) {
      112 +                Object d = payload.get("dorsal");
      113 +                jugador.setDorsal(d != null ? Integer.valueOf
          +(d.toString()) : null);
      114 +            }
      115 +            if (payload.containsKey("posicion")) jugador.setP
          +osicion((String) payload.get("posicion"));
      116 +            if (payload.containsKey("estado")) jugador.setEst
          +ado((String) payload.get("estado"));
      117 +            if (payload.containsKey("equipoId")) {
      118 +                Object eqId = payload.get("equipoId");
      119 +                if (eqId != null) {
      120 +                    equipoRepo.findById(Integer.valueOf(eqId.
          +toString()))
      121 +                            .ifPresent(jugador::setEquipoPrin
          +cipal);
      122 +                } else {
      123 +                    jugador.setEquipoPrincipal(null);
      124 +                }
      125 +            }
      126 +            jugadorRepo.save(jugador);
      127 +        });
      128 +    }
      129 +
      130 +    @Transactional
      131      public void deleteUsuario(Integer id) {
      132          if (!usuarioRepo.existsById(id)) throw new RuntimeExc
           eption("Usuario no encontrado");
      133          jugadorRepo.findByUsuario_IdUsuario(id).ifPresent(jug
           ador -> {

● Update(src\backend-tfg\backend-tfg\src\main\java\com\DAMUnitedFC\backend_tfg\
        controller\AdminController.java)
  ⎿  Added 11 lines
      39          return ResponseEntity.ok(adminService.getUsuariosActiv
          os());
      40      }
      41
      42 +    @PutMapping("/usuarios/{id}")
      43 +    public ResponseEntity<?> actualizarUsuario(@PathVariable I
         +nteger id, @RequestBody Map<String, Object> payload) {
      44 +        try {
      45 +            adminService.actualizarUsuario(id, payload);
      46 +            return ResponseEntity.ok(Collections.singletonMap(
         +"message", "Usuario actualizado correctamente"));
      47 +        } catch (RuntimeException e) {
      48 +            if (e.getMessage().contains("no encontrado")) retu
         +rn ResponseEntity.notFound().build();
      49 +            return ResponseEntity.badRequest().body(Collection
         +s.singletonMap("error", e.getMessage()));
      50 +        }
      51 +    }
      52 +
      53      @DeleteMapping("/usuario/{id}")
      54      public ResponseEntity<?> deleteUsuario(@PathVariable Integ
          er id) {
      55          try {

● Listo. Primer cambio hecho.

  Lo que se agregó:

  - AdminService.actualizarUsuario() — actualiza Usuario (nombre, apellidos,
  email, teléfono) y si el usuario tiene un Jugador asociado también actualiza
  (dorsal, posición, estado, equipo). Todo en una sola transacción
  @Transactional.
  - PUT /api/admin/usuarios/{id} en AdminController — protegido automáticamente
   por el @PreAuthorize("hasRole('ADMIN')") de la clase.

  El payload es flexible: solo actualizás los campos que mandés, los que no
  vienen no se tocan.

  ¿Seguimos con el punto 2 — mejorar getUsuariosActivos() para que devuelva los
   datos de dorsal, posición y estado que va a necesitar el modal?


   Punto 2: 

   Voy a mejorar getUsuariosActivos(). Ya tengo el código en contexto —
  actualmente devuelve id, nombre, fotoUrl, rol, equipoNombre, equipoId.
  Necesito agregar dorsal, posicion, estado para jugadores, y también separar
  los datos individuales (nombre, apellidos, email, telefono) para que el modal
   pueda pre-cargar el formulario correctamente.

  Déjame ver rápido el modelo Entrenador para saber qué campos tiene:

  Searched for 1 pattern, read 1 file (ctrl+o to expand)

● Perfecto. Ahora actualizo getUsuariosActivos() para que devuelva todos los
  datos que el modal va a necesitar:

● Update(src\backend-tfg\backend-tfg\src\main\java\com\DAMUnitedFC\backend_tfg\
        service\AdminService.java)
  ⎿  Added 20 lines, removed 3 lines
       69              if ("ADMIN".equals(u.getRol()) || "ROLE_ADMIN".eq
           uals(u.getRol())) continue;
       70              Map<String, Object> map = new HashMap<>();
       71              map.put("id", u.getIdUsuario());
       72 -            map.put("nombre", u.getNombre() + " " + (u.getApe
          -llidos() != null ? u.getApellidos() : ""));
       72 +            map.put("nombre", u.getNombre());
       73 +            map.put("apellidos", u.getApellidos());
       74 +            map.put("nombreCompleto", u.getNombre() + " " + (
          +u.getApellidos() != null ? u.getApellidos() : ""));
       75 +            map.put("email", u.getEmail());
       76 +            map.put("telefono", u.getTelefono());
       77              map.put("fotoUrl", u.getFotoUrl());
       78              map.put("rol", u.getRol());
       79 +            map.put("fechaAlta", u.getFechaAlta());
       80 +
       81              Optional<Jugador> jugOpt = jugadorRepo.findByUsua
           rio_IdUsuario(u.getIdUsuario());
       82              if (jugOpt.isPresent()) {
       77 -                Equipo eq = jugOpt.get().getEquipoPrincipal()
          -;
       83 +                Jugador jug = jugOpt.get();
       84 +                Equipo eq = jug.getEquipoPrincipal();
       85                  map.put("equipoNombre", eq != null ? eq.getNo
           mbre() : "Sin Equipo");
       86                  map.put("equipoId", eq != null ? eq.getIdEqui
           po() : null);
       87 +                map.put("dorsal", jug.getDorsal());
       88 +                map.put("posicion", jug.getPosicion());
       89 +                map.put("estado", jug.getEstado());
       90 +                map.put("jugadorId", jug.getIdJugador());
       91              } else {
       92                  Optional<Entrenador> entOpt = entrenadorRepo.
           findByUsuario_IdUsuario(u.getIdUsuario());
       93                  if (entOpt.isPresent()) {
       83 -                    List<EquipoEntrenador> vinculaciones = eq
          -uipoEntrenadorRepo.findByEntrenador_IdEntrenador(entOpt.get()
          -.getIdEntrenador());
       94 +                    Entrenador ent = entOpt.get();
       95 +                    List<EquipoEntrenador> vinculaciones = eq
          +uipoEntrenadorRepo.findByEntrenador_IdEntrenador(ent.getIdEnt
          +renador());
       96                      if (!vinculaciones.isEmpty()) {
       97                          map.put("equipoNombre", vinculaciones
           .get(0).getEquipo().getNombre());
       98                          map.put("equipoId", vinculaciones.get
           (0).getEquipo().getIdEquipo());
       99                      } else {
      100                          map.put("equipoNombre", "Sin Equipo")
           ;
      101 +                        map.put("equipoId", null);
      102                      }
      103 +                    map.put("especialidad", ent.getEspecialid
          +ad());
      104 +                    map.put("licencia", ent.getLicencia());
      105 +                    map.put("entrenadorId", ent.getIdEntrenad
          +or());
      106                  } else {
      107                      map.put("equipoNombre", "Sin Equipo");
      108 +                    map.put("equipoId", null);
      109                  }
      110              }
      111              activos.add(map);

● Listo, punto 2 hecho.

  Lo que cambió en getUsuariosActivos():

  - Antes devolvía nombre como string concatenado — ahora devuelve nombre,
  apellidos y nombreCompleto por separado (el modal necesita los campos
  individuales para pre-cargar el formulario)
  - Agregados: email, telefono, fechaAlta
  - Para Jugadores: dorsal, posicion, estado, jugadorId
  - Para Entrenadores: especialidad, licencia, entrenadorId
  - Todos los equipoId que antes podían no existir ahora siempre tienen un
  valor (null explícito)

  ¿Pasamos al punto 3 — frontend: segments + searchbar en el admin dashboard?