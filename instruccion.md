Resumen del fix:

  ┌─────────────────────┬────────┬────────┬─────────────────────┐
  │       Paquete       │ Antes  │ Ahora  │       Por qué       │
  ├─────────────────────┼────────┼────────┼─────────────────────┤
  │                     │        │        │ Requería            │
  │ @angular-eslint/*   │ ^17.0. │ ^18.0. │ @angular/cli < 18,  │
  │ (5 paquetes)        │ 0      │ 0      │ conflicto con       │
  │                     │        │        │ Angular 18          │
  ├─────────────────────┼────────┼────────┼─────────────────────┤
  │ @typescript-eslint/ │ ^6.0.0 │ ^7.0.0 │ Compatibilidad con  │
  │ * (2 paquetes)      │        │        │ TypeScript 5.5      │
  ├─────────────────────┼────────┼────────┼─────────────────────┤
  │                     │        │        │ ^1.10.0 resolvía a  │
  │ ng-apexcharts       │ ^1.10. │ ~1.12. │ 1.17.1 que requiere │
  │                     │ 0      │ 0      │  Angular 20. 1.12.0 │
  │                     │        │        │  soporta Angular 18 │
  ├─────────────────────┼────────┼────────┼─────────────────────┤
  │                     │        │        │ ng-apexcharts@1.12. │
  │ apexcharts          │ ^3.46. │ ^3.53. │ 0 requiere          │
  │                     │ 0      │ 0      │ apexcharts >=       │
  │                     │        │        │ 3.53.0              │
  └─────────────────────┴────────┴────────┴─────────────────────┘

  El deploy en Render debería funcionar ahora. npm install pasa limpio
   sin --legacy-peer-deps.