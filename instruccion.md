# Plan de Acción: Panel de Control Administrativo Profesional

El objetivo de esta tarea es transformar la sección de "Base de Datos" del Administrador en un panel de gestión profesional, organizado y funcional. Se requiere implementar la edición completa de perfiles y una visualización categorizada.

## 🛠️ Fase 1: Backend (Spring Boot) - Endpoints de Actualización

1.  **Endpoints de Edición:**
    *   Asegurar que `UsuarioController` y/o `JugadorController` tengan endpoints `PUT /api/admin/usuarios/{id}` y `PUT /api/admin/jugadores/{id}`.
    *   Los endpoints deben estar protegidos con `@PreAuthorize("hasRole('ADMIN')")`.
    *   Implementar la lógica en el `Service` correspondiente para actualizar tanto la entidad `Usuario` (nombre, apellidos, email, teléfono) como la entidad de rol `Jugador` (dorsal, posición, estado, equipo) de forma atómica.
2.  **DTOs de Edición:**
    *   Crear o reutilizar DTOs específicos para la actualización que validen los campos (ej. `@NotBlank`, `@Email`, `@Size`).
3.  **Filtrado en Servidor (Opcional pero recomendado):**
    *   Si la lista es muy grande, añadir soporte para filtros por equipo y rol en los endpoints de consulta.

## 🎨 Fase 2: Frontend (Angular/Ionic) - UI/UX Profesional

1.  **Categorización por Pestañas (Segments):**
    *   En `admin-dashboard.page.html`, reemplazar la lista única por un `ion-segment` con tres opciones: **Jugadores**, **Entrenadores**, **Administradores**.
    *   Mostrar la lista correspondiente según el segmento seleccionado.
2.  **Buscador y Filtros:**
    *   Añadir un `ion-searchbar` superior para filtrar por nombre/apellidos en tiempo real (usando operadores RxJS como `debounceTime`).
    *   Añadir un `ion-select` para filtrar por **Equipo** (especialmente útil para la pestaña de Jugadores).
3.  **Diseño de Lista "Night Stadium":**
    *   Mejorar las tarjetas de la lista. Deben mostrar: Foto, Nombre completo, Equipo, Dorsal (si es jugador) y Estado (Activo/Lesionado).
    *   Añadir botones de acción claros: un icono de lápiz (Editar) y un icono de papelera (Eliminar).

## 📝 Fase 3: Formulario de Edición (Modal)

1.  **Componente Modal de Edición:**
    *   Crear un componente modal dedicado para la edición de usuarios.
    *   Utilizar `ReactiveFormsModule` para el formulario.
    *   **Campos requeridos:**
        *   *Identidad:* Nombre, Apellidos, Email, Teléfono.
        *   *Perfil Deportivo (si es Jugador):* Dorsal, Posición (Portero, Defensa, etc.), Equipo Principal, Fecha de Alta, Edad, Estado Físico.
2.  **Lógica de Carga y Guardado:**
    *   Al abrir el modal, cargar los datos actuales del usuario/jugador.
    *   Implementar validaciones visuales (campos obligatorios, formato de email).
    *   Al guardar, usar el `NotificationService` para mostrar un toast de éxito ("¡Perfil actualizado correctamente!") con estética Night Stadium.

## ✅ Fase 4: Verificación y Refinado

1.  Probar que un Administrador puede editar a cualquier jugador y que los cambios se reflejan inmediatamente en la lista.
2.  Verificar que los filtros funcionan correctamente y no mezclan roles.
3.  Asegurar que el diseño sea responsive y mantenga la estética de cristal (Glassmorphism) del resto de la aplicación.
