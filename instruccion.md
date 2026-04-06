El problema era una desincronización entre backend y frontend:

  - Backend devuelve { rol: "ADMIN" } (campo singular)
  - RoleGuard busca user.roles?.some(...) (array)
  - roles era siempre undefined → guard rechazaba → rebote a landing

  El fix: en getCurrentUser(), cuando llega el usuario del backend, si
   tiene rol pero no roles, se crea roles = [rol]. Así el RoleGuard,
  el login.page.ts, y cualquier otro componente que busque roles como
  array funcionan correctamente.

  Un cambio de 3 líneas. Es así de simple. ¿Se entiende?