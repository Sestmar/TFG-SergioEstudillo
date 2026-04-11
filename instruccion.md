# 🚀 Instrucción: Implementación Quirúrgica - Módulo de Season Analytics (Punto 5)

**Objetivo:** Implementar el "Centro de Inteligencia: Season Analytics & Goals" de forma incremental y controlada, asegurando la calidad técnica en cada paso.

---

## 🛠️ Protocolo de Actuación (Paso a Paso)

Claude, debes seguir este orden estrictamente. **NO pases al siguiente punto hasta que el usuario te dé el "OK" explícito.**

### FASE A: INFRAESTRUCTURA BACKEND
1.  **Paso 1: Modelo y DTOs**: Actualizar la entidad `Equipo` y el `EquipoDto` para incluir `puntosObjetivo`. Definir el nuevo `SeasonStatsDto`.
    - *Espera el OK del usuario.*
2.  **Paso 2: Lógica de Negocio (Service)**: Implementar el cálculo de estadísticas acumuladas (PJ, G, E, P, GF, GC, Puntos) y el algoritmo de racha (últimos 5 partidos).
    - *Espera el OK del usuario.*
3.  **Paso 3: Endpoint REST**: Crear el controlador y mapear el endpoint `GET /api/equipos/{id}/stats-temporada`. Probar que la respuesta es correcta.
    - *Espera el OK del usuario.*

### FASE B: INTERFAZ DE USUARIO
4.  **Paso 4: Componente Shared (Widget)**: Crear el componente `SeasonStatsWidget` con los 3 visuales (Tabla, Barra de Progreso y Racha de colores). Usar diseño Glassmorphism.
    - *Espera el OK del usuario.*
5.  **Paso 5: Integración Coach**: Insertar el widget en el Dashboard del Entrenador y añadir la lógica de edición del objetivo de puntos vía `ion-alert`.
    - *Espera el OK del usuario.*
6.  **Paso 6: Integración Jugador**: Insertar el widget en el módulo de Jugador (solo lectura) para cerrar el círculo de motivación.
    - *Espera el OK del usuario.*

---

## 🤖 Directiva para Claude
> "Claude, actúa como un Desarrollador Senior Fullstack. Tu misión es ejecutar el Punto 5 de `futuras-mejoras.md` siguiendo este protocolo paso a paso. Antes de empezar cada paso, explica brevemente qué vas a tocar. Al terminar cada paso, muestra el resultado (o el código clave) y **DETENTE** para esperar el 'OK' del usuario antes de continuar. Mantén la coherencia con el diseño 'Night Stadium' y los estándares de Clean Architecture."
