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


  PUNTO 4: 

  Bien. El método va justo después de deleteUser. El payload es un
  Record<string, any> porque el backend acepta un Map<String, Object> — solo
  mandamos los campos que cambiaron.

● Update(frontend\src\app\core\services\admin\admin.service.ts)
  ⎿  Added 4 lines
      37      return this.http.delete<void>(`${this.apiUrl}/usuario/${id}
          `);
      38    }
      39
      40 +  updateUser(id: number, payload: Record<string, any>): Observa
         +ble<void> {
      41 +    return this.http.put<void>(`${this.apiUrl}/usuarios/${id}`,
         + payload);
      42 +  }
      43 +
      44    assignTeam(idUsuario: number, idEquipo: number): Observable<v
          oid> {
      45      return this.http.post<void>(`${this.apiUrl}/asignar-equipo`
          , { idUsuario, idEquipo });
      46    }

● Listo. updateUser() hace un PUT /api/admin/usuarios/{id} con el payload que le
   pasemos

   Update(frontend\src\app\modules\admin\pages\admin-dashboard\admin-dashboard.pa
        ge.ts)
  ⎿  Added 11 lines
      55    isUserModalOpen = false;
      56    isTeamModalOpen = false;
      57    isMatchModalOpen = false;
      58 +  isEditModalOpen = false;
      59
      60 +  // Modal de edición
      61 +  editingUser: AdminUserDto | null = null;
      62 +  editForm = {
      63 +    nombre: '', apellidos: '', email: '', telefono: '',
      64 +    dorsal: null as number | null, posicion: '', estado: '', eq
         +uipoId: null as number | null
      65 +  };
      66 +
      67 +  posiciones = ['Portero', 'Defensa Central', 'Lateral Derecho'
         +, 'Lateral Izquierdo', 'Pivote', 'Centrocampista', 'Mediapunta'
         +, 'Extremo Derecho', 'Extremo Izquierdo', 'Delantero Centro'];
      68 +  estadosFisicos = ['Activo', 'Lesionado', 'Sancionado', 'Baja
         +Temporal'];
      69 +
      70    // Control del tipo de evento (Partido vs Entrenamiento)
      71    eventType: 'MATCH' | 'TRAINING' = 'MATCH';
      72

● Ahora los métodos. Busco openEditModal que ya existe como placeholder:

● Update(frontend\src\app\modules\admin\pages\admin-dashboard\admin-dashboard.pa
        ge.ts)
  ⎿  Added 40 lines
      249    }
      250
      251    openEditModal(user: AdminUserDto) {
      252 +    this.editingUser = user;
      253 +    this.editForm = {
      254 +      nombre:   user.nombre   ?? '',
      255 +      apellidos: user.apellidos ?? '',
      256 +      email:    user.email    ?? '',
      257 +      telefono: user.telefono ?? '',
      258 +      dorsal:   user.dorsal   ?? null,
      259 +      posicion: user.posicion ?? '',
      260 +      estado:   user.estado   ?? '',
      261 +      equipoId: user.equipoId ?? null
      262 +    };
      263 +    this.isEditModalOpen = true;
      264 +  }
      265 +
      266 +  saveEditUser() {
      267 +    if (!this.editingUser) return;
      268 +
      269 +    const payload: Record<string, any> = {
      270 +      nombre:    this.editForm.nombre,
      271 +      apellidos: this.editForm.apellidos,
      272 +      email:     this.editForm.email,
      273 +      telefono:  this.editForm.telefono,
      274 +      dorsal:    this.editForm.dorsal,
      275 +      posicion:  this.editForm.posicion,
      276 +      estado:    this.editForm.estado,
      277 +      equipoId:  this.editForm.equipoId
      278 +    };
      279 +
      280 +    this.adminService.updateUser(this.editingUser.id, payload)
          +.subscribe({
      281 +      next: () => {
      282 +        this.isEditModalOpen = false;
      283 +        this.notificationService.showSuccess('Perfil actualiza
          +do correctamente');
      284 +        this.loadData();
      285 +      },
      286 +      error: () => this.notificationService.showError('Error a
          +l actualizar el perfil')
      287 +    });
      288 +  }
      289 +
      290 +  // placeholder anterior — reemplazado arriba
      291 +  private _openEditModalOld(user: AdminUserDto) {
      292      // Implementado en Punto 4
      293    }
      294

● Espera, necesito verificar el estado exacto del método porque el placeholder
  tenía código dentro. Déjame ver:

  Searched for 1 pattern, read 1 file (ctrl+o to expand)

● Bien, el método basura _openEditModalOld quedó. Lo elimino:

● Update(frontend\src\app\modules\admin\pages\admin-dashboard\admin-dashboard.pa
        ge.ts)
  ⎿  Removed 5 lines
      287      });
      288    }
      289
      290 -  // placeholder anterior — reemplazado arriba
      291 -  private _openEditModalOld(user: AdminUserDto) {
      292 -    // Implementado en Punto 4
      293 -  }
      294 -
      290    async deleteUser(user: AdminUserDto) {
      291        const alert = await this.alertCtrl.create({
      292            header: '⚠️ Confirmar Eliminación',

● Verifico que quedó limpio:

  Searched for 1 pattern (ctrl+o to expand)

● Bien, el .ts está limpio. Ahora necesito verificar cómo se llama el
  notification service en este componente, para asegurarme de que no haya typo:

  Searched for 1 pattern (ctrl+o to expand)

● El notificationService no está inyectado — el componente usa ToastController
  directamente. Dejame ver cómo hace los toasts el resto del componente:

  Searched for 1 pattern (ctrl+o to expand)

● Usa presentToast(). Corrijo:

● Update(frontend\src\app\modules\admin\pages\admin-dashboard\admin-dashboard.pa
        ge.ts)
  ⎿  Added 2 lines, removed 2 lines
      280      this.adminService.updateUser(this.editingUser.id, payload)
           .subscribe({
      281        next: () => {
      282          this.isEditModalOpen = false;
      283 -        this.notificationService.showSuccess('Perfil actualiza
          -do correctamente');
      283 +        this.presentToast('Perfil actualizado correctamente',
          +'success');
      284          this.loadData();
      285        },
      286 -      error: () => this.notificationService.showError('Error a
          -l actualizar el perfil')
      286 +      error: () => this.presentToast('Error al actualizar el p
          +erfil', 'danger')
      287      });
      288    }
      289

● El .ts está listo. Ahora el modal en el HTML. Va justo antes del cierre de
  </ion-content>, junto a los otros modales:

● Update(frontend\src\app\modules\admin\pages\admin-dashboard\admin-dashboard.pa
        ge.html)
  ⎿  Error editing file

  Searched for 1 pattern, read 1 file (ctrl+o to expand)

● Update(frontend\src\app\modules\admin\pages\admin-dashboard\admin-dashboard.pa
        ge.html)
  ⎿  Added 64 lines
      334      </ng-template>
      335    </ion-modal>
      336
      337 +  <!-- Modal de Edición de Usuario -->
      338 +  <ion-modal [isOpen]="isEditModalOpen" (didDismiss)="isEditMo
          +dalOpen = false" [initialBreakpoint]="0.90" [breakpoints]="[0,
          + 0.90, 1]" cssClass="night-modal">
      339 +    <ng-template>
      340 +      <ion-content class="ion-padding" style="--background: tr
          +ansparent;">
      341 +        <div class="modal-content-dark" style="min-height: 100
          +%;">
      342 +
      343 +          <h3>Editar Perfil</h3>
      344 +          <p class="modal-subtitle" *ngIf="editingUser">{{ edi
          +tingUser.nombre }} {{ editingUser.apellidos }}</p>
      345 +
      346 +          <ion-list class="dark-list">
      347 +            <ion-item>
      348 +              <ion-label position="stacked">Nombre *</ion-labe
          +l>
      349 +              <ion-input [(ngModel)]="editForm.nombre"></ion-i
          +nput>
      350 +            </ion-item>
      351 +            <ion-item>
      352 +              <ion-label position="stacked">Apellidos *</ion-l
          +abel>
      353 +              <ion-input [(ngModel)]="editForm.apellidos"></io
          +n-input>
      354 +            </ion-item>
      355 +            <ion-item>
      356 +              <ion-label position="stacked">Email *</ion-label
          +>
      357 +              <ion-input type="email" [(ngModel)]="editForm.em
          +ail"></ion-input>
      358 +            </ion-item>
      359 +            <ion-item>
      360 +              <ion-label position="stacked">Teléfono</ion-labe
          +l>
      361 +              <ion-input type="tel" [(ngModel)]="editForm.tele
          +fono" placeholder="+34 600 000 000"></ion-input>
      362 +            </ion-item>
      363 +
      364 +            <ng-container *ngIf="editingUser?.jugadorId">
      365 +              <ion-item>
      366 +                <ion-label position="stacked">Dorsal</ion-labe
          +l>
      367 +                <ion-input type="number" [(ngModel)]="editForm
          +.dorsal" placeholder="Ej: 10"></ion-input>
      368 +              </ion-item>
      369 +              <ion-item>
      370 +                <ion-label position="stacked">Posición</ion-la
          +bel>
      371 +                <ion-select [(ngModel)]="editForm.posicion" in
          +terface="popover" placeholder="Seleccionar...">
      372 +                  <ion-select-option *ngFor="let p of posicion
          +es" [value]="p">{{ p }}</ion-select-option>
      373 +                </ion-select>
      374 +              </ion-item>
      375 +              <ion-item>
      376 +                <ion-label position="stacked">Estado Físico</i
          +on-label>
      377 +                <ion-select [(ngModel)]="editForm.estado" inte
          +rface="popover" placeholder="Seleccionar...">
      378 +                  <ion-select-option *ngFor="let e of estadosF
          +isicos" [value]="e">{{ e }}</ion-select-option>
      379 +                </ion-select>
      380 +              </ion-item>
      381 +              <ion-item>
      382 +                <ion-label position="stacked">Equipo</ion-labe
          +l>
      383 +                <ion-select [(ngModel)]="editForm.equipoId" in
          +terface="popover" placeholder="Sin equipo">
      384 +                  <ion-select-option [value]="null">Sin Equipo
          +</ion-select-option>
      385 +                  <ion-select-option *ngFor="let t of teams" [
          +value]="t.idEquipo ?? t.id">{{ t.nombre }}</ion-select-option>
      386 +                </ion-select>
      387 +              </ion-item>
      388 +            </ng-container>
      389 +          </ion-list>
      390 +
      391 +          <ion-button expand="block" color="primary" class="mt
          +-4" (click)="saveEditUser()">
      392 +            <ion-icon name="save-outline" slot="start"></ion-i
          +con>
      393 +            Guardar Cambios
      394 +          </ion-button>
      395 +
      396 +        </div>
      397 +      </ion-content>
      398 +    </ng-template>
      399 +  </ion-modal>
      400 +
      401  </ion-content>
      402   No newline at end of file

● Listo. Esto es lo que implementé:

  AdminService
  - updateUser(id, payload) → PUT /api/admin/usuarios/{id}

  .ts
  - isEditModalOpen, editingUser, editForm — estado del modal
  - posiciones y estadosFisicos — arrays para los selects
  - openEditModal(user) — carga los datos del usuario en el form y abre el modal
  - saveEditUser() — llama al endpoint, cierra el modal, recarga la lista,
  muestra toast

  .html
  - Modal sheet con initialBreakpoint="0.90" — sube desde abajo como el resto de
   la app
  - Campos comunes para todos: nombre, apellidos, email, teléfono
  - Bloque extra con *ngIf="editingUser?.jugadorId" — solo aparece para
  jugadores: dorsal, posición, estado físico, equipo

  Probalo — abrí un jugador, editá algo, guardá. Si todo funciona bien me decís
  y documentamos.