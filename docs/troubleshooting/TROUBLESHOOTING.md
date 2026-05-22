# 🔧 TROUBLESHOOTING.md — Guía de Resolución de Problemas y Lecciones Aprendidas

<div align="center">

**DAM United FC · Casos Reales Resueltos Durante el Desarrollo**

</div>

---

> Esta sección documenta **6 bugs críticos** encontrados y resueltos durante el desarrollo de la plataforma. Cada caso incluye el **contexto del error**, el **análisis de causa raíz** y la **solución aplicada** en el código.

---

## 📋 Índice

1. [Sistemas de Archivos Efímeros en PaaS (Render)](#1-sistemas-de-archivos-efímeros-en-paas-render)
2. [Error 415 Unsupported Media Type en Formularios Flexibles](#2-error-415-unsupported-media-type-en-formularios-flexibles)
3. [Bucles Infinitos de Serialización JSON (Error 500)](#3-bucles-infinitos-de-serialización-json-error-500)
4. [Corrupción de Firma JWT en LocalStorage](#4-corrupción-de-firma-jwt-en-localstorage)
5. [La Slash Rule (Errores 404 silenciosos)](#5-la-slash-rule-errores-404-silenciosos)
6. [Bloqueo SMTP en Render Free — forgot-password devuelve 500](#6-bloqueo-de-puertos-smtp-en-render-free-recuperación-de-contraseña)

---

## 1. Sistemas de Archivos Efímeros en PaaS (Render)

### El Problema

Al desplegar el backend en **Render (tier gratuito)**, todas las imágenes subidas al servidor (escudos de equipo, fotos de perfil) **desaparecían** con cada redeploy o reinicio del container.

**Síntomas:**

- Las imágenes se subían correctamente y se mostraban en la app.
- Tras un redeploy (automático o manual), todas las imágenes devolvían **404 Not Found**.
- El directorio `uploads/` se recreaba vacío en cada nuevo container.

### Causa Raíz

Los hosting PaaS con tier gratuito (Render, Railway, Fly.io) utilizan **sistemas de archivos efímeros**. Cada despliegue crea un nuevo container desde la imagen Docker, descartando cualquier archivo escrito en disco durante la ejecución anterior.

```
Deploy #1 -> Container A -> uploads/foto1.jpg (OK)
Deploy #2 -> Container B -> uploads/ (vacio) -> foto1.jpg PERDIDO
```

### Solución: Sistema Híbrido de Imágenes

Se implementó un **sistema dual** que evita la dependencia del disco local:

**1. Equipos rivales — URLs externas:**

Se modificó el modelo `Partido` y el `AdminController` para aceptar una URL externa del escudo rival en lugar de un archivo:

```java
// Partido.java
@Column(name = "escudo_rival_url")
private String escudoRivalUrl;

// AdminController.java -> crearPartido()
@RequestParam(value = "escudoRivalUrl", required = false) String escudoRivalUrl
```

El frontend envía una URL de imagen pública (ej: de la web de la liga) en lugar de subir un archivo.

**2. Usuarios — Fallback reactivo con avatares dinámicos:**

En Angular, se implementó un manejador del evento `(error)` en la etiqueta `<img>` que genera un avatar con las iniciales del usuario usando la API ui-avatars.com:

```html
<!-- Template Angular -->
<img [src]="usuario.fotoUrl"
     (error)="onImageError($event, usuario)"
     [alt]="usuario.nombre" />
```

```typescript
// Component
onImageError(event: Event, usuario: any): void {
  const initials = (usuario.nombre?.charAt(0) || '') +
                   (usuario.apellidos?.charAt(0) || '');
  (event.target as HTMLImageElement).src =
    `https://ui-avatars.com/api/?name=${initials}&background=random&color=fff&size=128`;
}
```

```
+----------------+     +-------------+     +-----------------------+
| <img> carga    |---->| Existe?     |--NO>| (error) -> Avatar API |
| fotoUrl        |     | Foto URL    |     | ui-avatars.com/api/   |
|                |     |             |--SI>| Mostrar foto real     |
+----------------+     +-------------+     +-----------------------+
```

### Lección Aprendida

> **Nunca almacenar archivos en disco en PaaS efímeros.** Usar servicios de almacenamiento externo (S3, Cloudinary) o, como alternativa liviana, URLs externas + fallbacks creativos del lado del cliente.

---

## 2. Error 415 Unsupported Media Type en Formularios Flexibles

### El Problema

Al cambiar la lógica de subida de imágenes locales (archivos) a URLs externas de internet, el endpoint de crear partidos dejó de funcionar. El frontend enviaba un JSON puro, pero el backend seguía esperando un `multipart/form-data`.

**Síntomas:**

- Error **415 Unsupported Media Type** en la consola del navegador.
- El backend rechazaba la petición antes de entrar al controlador.
- El mismo endpoint funcionaba antes con `FormData`.

### Causa Raíz

El `AdminController` estaba anotado con `@PostMapping(consumes = "multipart/form-data")` de forma estricta. Al enviar un JSON desde Angular (body normal en lugar de `FormData`), Spring Boot rechazaba el `Content-Type: application/json` porque no coincidía con el `consumes` declarado.

```java
// ANTES (rigido): Solo acepta multipart
@PostMapping(value = "/partidos", consumes = "multipart/form-data")
public ResponseEntity<?> crearPartido(@RequestParam("file") MultipartFile file, ...) { }
```

### Solución: `@RequestParam(required = false)` Flexible

Se refactorizó el controlador para aceptar **ambos formatos** — tanto un `MultipartFile` (archivo) como un `String` (URL):

```java
// DESPUES (flexible): Acepta multipart Y JSON
@PostMapping("/partidos")
public ResponseEntity<?> crearPartido(
    @RequestParam("idEquipo") Integer idEquipo,
    @RequestParam("rival") String rival,
    @RequestParam("lugar") String lugar,
    @RequestParam("fechaHora") String fechaHoraStr,
    @RequestParam("tipo") String tipo,
    @RequestParam(value = "escudoRivalUrl", required = false) String escudoRivalUrl,
    @RequestParam(value = "file", required = false) MultipartFile file
) {
    Partido p = new Partido();
    // ...

    // Prioridad: Si viene URL, usarla. Si no, intentar guardar archivo.
    if (escudoRivalUrl != null && !escudoRivalUrl.isEmpty()) {
        p.setEscudoRivalUrl(escudoRivalUrl);
    } else if (file != null && !file.isEmpty()) {
        // Guardar archivo (si se ejecuta localmente)
        String filePath = saveFile(file);
        p.setEscudoRivalUrl(filePath);
    }
    // ...
}
```

En Angular, el servicio envía un `FormData` con campos mixtos:

```typescript
crearPartido(data: any): Observable<any> {
  const formData = new FormData();
  formData.append('idEquipo', data.idEquipo);
  formData.append('rival', data.rival);
  formData.append('lugar', data.lugar);
  formData.append('fechaHora', data.fechaHora);
  formData.append('tipo', data.tipo);

  if (data.escudoRivalUrl) {
    formData.append('escudoRivalUrl', data.escudoRivalUrl);
  }
  if (data.file) {
    formData.append('file', data.file);
  }

  return this.http.post(`${this.apiUrl}/admin/partidos`, formData);
}
```

### Lección Aprendida

> **Diseñar endpoints con `required = false` para máxima flexibilidad.** Cuando la lógica de negocio evoluciona (ejemplo: de archivos locales a URLs), el endpoint debe poder aceptar ambos formatos sin romper el contrato API.

---

## 3. Bucles Infinitos de Serialización JSON (Error 500)

### El Problema

Al devolver un objeto `Usuario` desde un endpoint REST, Spring Boot lanzaba un **Error 500** con un `StackOverflowError` en los logs. La respuesta nunca llegaba al frontend.

**Síntomas:**

- Error 500 en cualquier endpoint que devolviese un `Usuario`.
- Stack trace con `com.fasterxml.jackson.databind.ser.BeanSerializer.serialize()` repitiéndose cientos de veces.
- El error no ocurría con DTOs, solo con la entidad directa.

### Causa Raíz

La entidad `Usuario` implementa `UserDetails` de Spring Security, lo que expone métodos como `getAuthorities()`, `getPassword()`, `isEnabled()`, etc. Jackson intentaba serializar **todos** estos métodos como propiedades JSON, incluyendo `getAuthorities()` que retorna una colección de `SimpleGrantedAuthority`. Esto creaba un ciclo de serialización que agotaba la pila de llamadas.

Además, el campo `passwordHash` se serializaba exponiendo información sensible.

```
Jackson intenta serializar Usuario:
 -> nombre (OK)
 -> email (OK)
 -> passwordHash (PELIGRO: expone contrasena hasheada)
 -> authorities -> [SimpleGrantedAuthority] -> ... (CICLO/DESBORDAMIENTO)
```

### Solución: `@JsonIgnore` Estratégico

Se anotaron con `@JsonIgnore` **todos los campos y métodos** que no deben serializarse:

```java
@Entity
@Data
public class Usuario implements UserDetails {

    // --- Campos seguros (se serializan normalmente) ---
    private Integer idUsuario;
    private String nombre;
    private String apellidos;
    private String email;
    private String rol;

    // --- BLOQUEADOS: Nunca salen hacia el frontend ---

    @JsonIgnore
    private String passwordHash;

    @Override
    @JsonIgnore
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + this.rol));
    }

    @Override
    @JsonIgnore
    public String getPassword() { return this.passwordHash; }

    @Override
    @JsonIgnore
    public String getUsername() { return this.email; }

    @Override @JsonIgnore public boolean isAccountNonExpired() { return true; }
    @Override @JsonIgnore public boolean isAccountNonLocked() { return true; }
    @Override @JsonIgnore public boolean isCredentialsNonExpired() { return true; }
    @Override @JsonIgnore public boolean isEnabled() { return true; }
}
```

### Lección Aprendida

> **Cuando una entidad JPA implementa una interfaz de framework (como `UserDetails`), SIEMPRE revisar qué métodos adicionales expone Jackson.** Los métodos `get*()` de `UserDetails` se convierten en propiedades JSON automáticamente. Usar `@JsonIgnore` en todos los métodos sensibles o, mejor aún, **nunca devolver la entidad directa** — usar siempre un DTO.

---

## 4. Corrupción de Firma JWT en LocalStorage

### El Problema

El login funcionaba correctamente (el backend devolvía un token JWT), pero **todas las peticiones posteriores** fallaban con un **403 Forbidden** y un `SignatureException` en los logs del backend.

**Síntomas:**

- Login: 200 OK con token.
- Cualquier endpoint protegido: 403 Forbidden.
- Log backend: `io.jsonwebtoken.security.SignatureException: JWT signature does not match`.
- El token en el header `Authorization` parecía correcto visualmente... pero tenía comillas extras.

### Causa Raíz

En Angular, el token se guardaba usando `JSON.stringify()`:

```typescript
// INCORRECTO: stringify anade comillas al string
localStorage.setItem('auth_token', JSON.stringify(token));

// Lo que se guardaba en localStorage:
// "eyJhbGciOiJIUzI1NiJ9.eyJzdWI..."   <-- Con comillas literales
//
// Lo que se enviaba al backend:
// Authorization: Bearer "eyJhbGciOiJIUzI1NiJ9..."
//                        ^                    ^
//                        Estas comillas NO son parte del token
```

`JSON.stringify('abc')` produce `"\"abc\""` — un string con comillas literales embebidas. Al decodificar el JWT en el backend, la firma no coincidía porque las comillas alteraban el payload Base64.

### Solución: Almacenar como String Puro

```typescript
// CORRECTO: Guardar el string directamente
localStorage.setItem('auth_token', token);

// Lo que se guarda:
// eyJhbGciOiJIUzI1NiJ9.eyJzdWI...   <-- Sin comillas extras
//
// Lo que se envia:
// Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...   <-- Firma valida
```

**Regla completa del flujo:**

```typescript
// GUARDAR (tras login exitoso)
saveToken(token: string): void {
  localStorage.setItem('auth_token', token);       // String puro
}

// LEER (en AuthInterceptor)
getToken(): string | null {
  return localStorage.getItem('auth_token');       // String puro
}

// ELIMINAR (logout)
clearToken(): void {
  localStorage.removeItem('auth_token');
}
```

### Lección Aprendida

> **`JSON.stringify()` es para objetos, NO para strings simples.** Un JWT es un string plano que nunca debe ser envuelto con `stringify`. Al leerlo con `JSON.parse()`, se deshacen las comillas, pero si se lee directamente con `getItem()` sin `parse()`, las comillas persisten y corrompen la firma.

---

## 5. La Slash Rule (Errores 404 silenciosos)

### El Problema

Algunos servicios del frontend devolvían **404 Not Found** de forma aparentemente aleatoria. El mismo endpoint funcionaba en Postman pero fallaba desde Angular.

**Síntomas:**

- Petición desde Angular: `GET https://backend-tfg-sergio.onrender.com/apijugadores` → **404**
- Petición desde Postman: `GET https://backend-tfg-sergio.onrender.com/api/jugadores` → **200** (OK)
- No había error de compilación ni warning en consola.

### Causa Raíz

El `environment.ts` se configuró de dos formas inconsistentes a lo largo del desarrollo:

```typescript
// A veces asi:
apiUrl: 'https://backend-tfg-sergio.onrender.com/api'   // Sin barra final

// A veces asi:
apiUrl: 'https://backend-tfg-sergio.onrender.com/api/'   // Con barra final
```

Y en los servicios, las URLs se construían de forma igualmente inconsistente:

```typescript
// Con barra de prefijo:
this.http.get(`${this.apiUrl}/jugadores`);
// Correcto si apiUrl NO tiene barra final
// -> .../api/jugadores (OK)

// Sin barra de prefijo:
this.http.get(`${this.apiUrl}jugadores`);
// Correcto si apiUrl TIENE barra final
// -> .../api/jugadores (OK)
// PERO si apiUrl NO tiene barra final:
// -> .../apijugadores (ERROR 404!)
```

La concatenación `'api' + 'jugadores'` = `'apijugadores'` era invisible en el código pero catastrófica en runtime.

### Solución: Convención Estricta

Se definió una **regla de oro** documentada y aplicada en todo el proyecto:

```typescript
// environment.ts — REGLA: NUNCA terminar con "/"
export const environment = {
  apiUrl: 'https://backend-tfg-sergio.onrender.com/api'  // Sin "/"
};

// Servicios — REGLA: SIEMPRE empezar con "/"
this.http.get(`${this.apiUrl}/jugadores`);        // OK: .../api/jugadores
this.http.get(`${this.apiUrl}/admin/equipos`);    // OK: .../api/admin/equipos
this.http.post(`${this.apiUrl}/auth/login`, body); // OK: .../api/auth/login
```

```
 Convention: apiUrl (sin /) + / + path (sin / inicial es ERROR)
 -----------------------------------------------------------
 OK:  environment.apiUrl = '.../api'
 OK:  service call        = `${apiUrl}/jugadores`
 MAL: service call        = `${apiUrl}jugadores`   <-- PROHIBIDO!
```

### Lección Aprendida

> **Definir convenciones de concatenación de URLs y documentarlas como estándar del proyecto.** Las "slash errors" son silenciosas (no dan error de compilación) y pueden pasar desapercibidas en desarrollo local si las URLs son ligeramente diferentes. Usar un linter o una función helper centralizada para construir URLs.

---

## Resumen de Buenas Prácticas

| # | Problema | Solución | Tipo |
|---|---------|---------|------|
| 1 | Archivos efímeros en PaaS | URLs externas + fallback avatar | Arquitectura |
| 2 | 415 Unsupported Media Type | `@RequestParam(required = false)` | Backend |
| 3 | Serialización infinita JSON | `@JsonIgnore` en `UserDetails` | Backend |
| 4 | Firma JWT corrompida | `localStorage.setItem(key, token)` sin stringify | Frontend |
| 5 | 404 por concatenación errónea | Slash Rule: apiUrl sin `/`, servicios con `/` | Frontend |
| 6 | Bloqueo SMTP en Render Free — `forgot-password` devuelve 500 | Migración de JavaMailSender a Brevo HTTP API | Backend |

---

## 6. Bloqueo de Puertos SMTP en Render Free (Recuperación de Contraseña)

### El Problema

El endpoint `POST /api/auth/forgot-password` devolvía un **error 500** en producción al intentar enviar el correo de recuperación. En local funcionaba correctamente. El log de Render mostraba:

```
Caused by: org.eclipse.angus.mail.util.MailConnectException:
  Couldn't connect to host, port: smtp.gmail.com, 465; timeout 10000
Caused by: java.net.SocketTimeoutException: Connect timed out
```

### Causa Raíz

**Render Free bloquea todas las conexiones salientes en puertos SMTP** (25, 465 y 587) para prevenir el abuso del tier gratuito como plataforma de spam. La implementación original usaba `JavaMailSender` de Spring Boot con Gmail SMTP en el puerto 465 — una conexión TCP directa que Render intercepta y rechaza.

Este bloqueo solo se manifiesta en producción, por eso pasaba desapercibido durante el desarrollo local.

### Solución Aplicada

Se reemplazó la integración SMTP por la **API HTTP de Brevo** (servicio transaccional de email). Las llamadas HTTP salientes en el puerto 443 no están bloqueadas en ningún tier de Render.

**Cambios realizados:**

1. **`EmailService.java`** — eliminado `JavaMailSender`, sustituido por `RestTemplate` que llama a `https://api.brevo.com/v3/smtp/email` con la API key como cabecera.

2. **`pom.xml`** — eliminada la dependencia `spring-boot-starter-mail`.

3. **`application.properties`** — eliminada la configuración `spring.mail.*`.

4. **Render Environment** — eliminadas `MAIL_USERNAME` y `MAIL_PASSWORD`, añadida `BREVO_API_KEY`.

```java
// Antes (SMTP — bloqueado por Render Free)
mailSender.send(message); // Timeout en puerto 465

// Después (HTTP API — funciona en cualquier entorno)
restTemplate.postForEntity("https://api.brevo.com/v3/smtp/email", request, String.class);
```

### Lección Aprendida

Los PaaS en tier gratuito aplican restricciones de red no documentadas que no afectan al desarrollo local. Ante cualquier integración con servicios externos, priorizar **APIs HTTP** sobre protocolos de transporte directo (SMTP, FTP, etc.) para garantizar la compatibilidad con entornos de despliegue restringidos.

---

<div align="center">

[← Frontend](./FRONTEND.md) · [README](./README.md) · [Backend →](./BACKEND.md)

</div>
