# 🚀 Hoja de Ruta: Futuras Mejoras - DAM United FC

Este documento identifica las líneas de evolución estratégica para elevar la plataforma a estándares de producto comercial y excelencia técnica.

---

## ✅ 1. Fortalecimiento de la Calidad: Testing Integral (Estado: COMPLETADO)

Se ha implementado una infraestructura de calidad integral siguiendo el modelo de la Pirámide de Testing, garantizando la estabilidad y robustez de la plataforma.   

- **Backend (JUnit 5 + Mockito)**:
    - Suite de **29 tests unitarios** que cubren `AdminService`, `AlineacionService` y `PublicService`.       
    - Ejecución automatizada en **GitHub Actions** con aislamiento total de la base de datos para máxima velocidad.
- **Frontend (Jasmine + Karma)**:
    - Suite de **44 tests unitarios** para la capa de servicios de Angular 18.
    - CI/CD configurado para ejecución *headless* en cada commit.
- **E2E (Cypress 15)**:
    - Flujo crítico de **20 tests interactivos** que cubren el ciclo completo: Login -> Dashboard -> Acta -> Táctica Pro.
    - Uso de selectores robustos `data-test` y comandos personalizados para demostración ante el tribunal.    
- **Resultado**: Cobertura superior al 70% en la lógica de negocio y un ecosistema documental en `docs/TESTING.md` para la defensa técnica.

## 📄 2. Ecosistema Documental: Exportación de Estrategia Pro (Priority: MEDIUM)

Sinergia entre el nuevo motor PDF y el Laboratorio Táctico para facilitar la comunicación entre el entrenador y los jugadores.

- **Funcionalidad**: Botón "Exportar Pizarra" dentro de `TacticsProPage`.
- **Implementación**: Captura de la vista actual del campo (incluyendo Shadow Players y anotaciones manuales) mediante `html2canvas` e inserción en un documento PDF corporativo.
- **Valor**: Permite al míster compartir el plan de partido por WhatsApp o imprimirlo para la charla técnica en el vestuario.

## 🔔 3. Notificaciones Nativas: Mobile Push con Firebase (Priority: MEDIUM)

Evolucionar más allá del sistema actual de WhatsApp para ofrecer una experiencia móvil 100% nativa y reactiva.

- **Tecnología**: Integración de **Firebase Cloud Messaging (FCM)** mediante el plugin oficial de Capacitor.  
- **Casos de Uso**:
    - Alertas instantáneas al ser incluido en una convocatoria.
    - Notificaciones de cambio de horario en entrenamientos.
    - Avisos de nuevos mensajes en el chat de equipo.  
- **Ventaja**: Mejora drásticamente el *engagement* de los jugadores y centraliza la comunicación sin depender de servicios externos de mensajería.

## ✅ 4. Pulido de UX: Skeleton Screens (Estado: COMPLETADO)

Se ha mejorado la percepción de velocidad y la calidad visual mediante la implementación de pantallas de carga inteligentes.

- **Skeleton Screens ✅**: Los spinners de carga genéricos han sido reemplazados por esqueletos nativos de Ionic 7 (`ion-skeleton-text animated="true"`) en las tres vistas de mayor tráfico del entrenador:
    - `coach-dashboard`: Skeleton completo del layout (sidebar, header, club card, status grid, y botones de acción).
    - `my-team`: Skeleton de las secciones de posición con sus correspondientes tarjetas de jugador (avatar, dorsal, nombre y posición).
    - `match-detail`: Skeleton del marcador (logos, marcador central y meta-info) y la lista de participantes.
- **Resultado**: Eliminación total del *Cumulative Layout Shift* (CLS) durante las peticiones de datos, ofreciendo una transición fluida y profesional entre el estado de carga y el contenido real.

---
*Documento actualizado: 11 de Abril 2026*
