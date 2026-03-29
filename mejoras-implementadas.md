# Mejoras Implementadas - DAM United FC

Registro de funcionalidades corregidas o añadidas tras el refactor base.

---

## 1. Fix: Registro de Tarjetas en Actas Oficiales 🟨🟥

**Fecha:** 2026-03-29
**Estado:** ✅ Verificado en producción

### Descripción del problema

Al cerrar un acta de partido desde el panel de Administrador, el resto de datos (goles, asistencias, minutos, sustituciones) se guardaban correctamente, pero las tarjetas amarillas y rojas **no persistían** — se ignoraban silenciosamente.

### Causa raíz

El frontend envía el payload al endpoint `/api/admin/cerrar-acta`, que es procesado por `AdminService.cerrarActaAdmin()`. Este método extraía correctamente todos los campos del stat de cada jugador **excepto** `amarilla` y `roja`, que llegaban al backend pero nunca se mapeaban a la entidad `Alineacion`.

Existía otro endpoint (`/api/partidos/cerrar-acta` → `PartidoService.cerrarActa()`) que sí procesaba las tarjetas correctamente, pero el frontend no lo usaba para el flujo de admin.

### Fix aplicado

**Archivo:** `src/backend-tfg/backend-tfg/src/main/java/com/DAMUnitedFC/backend_tfg/service/AdminService.java`

Se añadieron 4 líneas en el método `cerrarActaAdmin()`, justo antes del `alineacionRepo.save()`, en el bloque de procesamiento de stats por jugador:

```java
// Líneas 300-303 — extracción y persistencia de tarjetas
Boolean amarilla = (Boolean) stat.get("amarilla");
Boolean roja     = (Boolean) stat.get("roja");
alineacion.setTarjetaAmarilla(amarilla != null && amarilla);
alineacion.setTarjetaRoja(roja != null && roja);
alineacionRepo.save(alineacion);
```

La expresión `amarilla != null && amarilla` garantiza que si el campo no viene en el payload o viene `null`, el valor persiste como `false` sin lanzar excepción.

### Contexto adicional

- La entidad `Alineacion` está en `model/` (no en `entity/`) y usa `@Data` de Lombok — los setters `setTarjetaAmarilla` y `setTarjetaRoja` son generados automáticamente.
- El frontend ya enviaba los valores correctamente como boolean (`!!p.tarjetaAmarilla` → `amarilla`, `!!p.tarjetaRoja` → `roja`).
- No se modificó ningún otro archivo — fix de mínimo impacto.

---
