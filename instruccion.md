Revisa instruccion.md con la tarea.
  ⎿  Async hook Stop completed

● Searched for 1 pattern, read 1 file (ctrl+o to expand)

● 1. Find the Tactical Board (Pizarra Táctica) component files
  2. Find the coach profile files
  3. Look at the current implementation of the lists (jugadores convocados
  y lista de formaciones)
  4. Refactor them to use the Night Alert architecture (glassmorphism,
  .night-alert class, NotificationService)

  Let me search for the tactical board component files first.


  Perfecto, la tarea está clara. Hay que localizar la pizarra táctica y ver
   cómo están implementadas esas listas antes de tocar nada.

● Explore(Explorar pizarra táctica y NotificationService)
  ⎿  Done (13 tool uses · 67.6k tokens · 1m 6s)
  (ctrl+o to expand)

● Problems identified:

  1. openConvocation() — Uses ModalController with cssClass:
  'my-custom-modal-css' — this is a custom modal for player convocation
  list. I need to check the ConvocationModalComponent to see what it looks
  like.
  2. Formation selector — Uses ion-select (I need to see the HTML to
  confirm). The onFormationChange() and formations list might use a native
  select or ActionSheetController.
  3. saveTactics() — Uses raw toastCtrl instead of notificationSvc. This
  should be migrated to NotificationService.success(),
  NotificationService.warning(), NotificationService.error().
  4. openPlayerOptions() — Uses ActionSheetController with cssClass:
  'tactics-action-sheet'. This is a different type of UI element (action
  sheet, not alert), but I should check if it needs Night Stadium
  treatment.

  Wait, let me re-read the instruction more carefully:

  "La lista de jugadores convocados y la lista de formaciones todavía usa
  los estilos por defecto"

  1. Asegurarte de que esas listas se disparen a través del
  NotificationService
  2. Que apliquen la clase CSS .night-alert
  3. Que la experiencia visual sea 100% coherente

  The "lista de jugadores convocados" = openConvocation() which opens
  ConvocationModalComponent with cssClass: 'my-custom-modal-css'. I need to
   check that component.

  The "lista de formaciones" = the formation selector. If it's an
  ion-select, the dropdown is native. But wait, it might use an
  ActionSheetController instead. Looking at openPlayerOptions() it uses
  ActionSheetController.

  Actually I need to see the HTML template for tactics.page.html to
  understand the formation list — is it an ion-select with dropdown? Let me
   check the agent's findings more carefully.

  The agent mentioned the HTML has 184 lines but didn't return the content.
   Let me think about what I need to do:

  1. I need to read:
    - tactics.page.html (full content)
    - convocation-modal.component.* files
  2. Based on what I see:
    - The toast calls in saveTactics() need to use NotificationService
  instead of toastCtrl
    - The ConvocationModalComponent needs glassmorphism styling
    - The formation selector (if it's ActionSheetController) needs
  night-alert class or similar

  Let me read those files now.

  Actually, let me think again. The instruction says:
  - "lista de jugadores convocados" → this is the ConvocationModalComponent
   opened by openConvocation()
  - "lista de formaciones" → this is probably the formation selector
  (ion-select or action sheet)

  For these:
  1. If ConvocationModalComponent is a ModalController component, I need to
   apply glassmorphism to its CSS. The modal itself wouldn't use
  night-alert (that's for AlertController), but I should apply the
  night-modal class or similar to make it look consistent.

  Wait, the instruction says:
  "Si son componentes personalizados (ModalController), aplicame el mismo
  concepto de Glassmorphism que usamos en la clase .night-alert
  directamente en el SCSS del componente o envolvelos en un contenedor con
  esa clase"

  So for ModalController components, apply the glassmorphism directly in
  the SCSS.

  2. For the formation selector — if it's an ion-select, it opens a popover
   or action sheet. I should look at the HTML.

  Let me read the HTML and the ConvocationModalComponent.


  Bien, tengo el panorama general. Antes de escribir una línea, necesito
  ver el HTML de tactics y el ConvocationModalComponent.

● Searched for 1 pattern, read 1 file (ctrl+o to expand)
  ⎿  Async hook SubagentStop completed

●

● Read 3 files (ctrl+o to expand)

● Analysis

  1. Lista de jugadores convocados (ConvocationModalComponent)

  The ConvocationModalComponent already has dark styling in its SCSS! But:
  - The ion-header ion-toolbar uses #0f1420 background — that's dark, but
  not the Night Alert glassmorphism
  - The modal is opened with cssClass: 'my-custom-modal-css' — this class
  doesn't exist in global.scss
  - The modal itself already has dark styling, but it's NOT using the
  glassmorphism .night-alert design tokens

  What to fix:
  1. In tactics.page.ts → openConvocation(): change cssClass:
  'my-custom-modal-css' to cssClass: 'night-modal' (or we need to check if
  night-modal exists in global.scss)
  2. Alternatively, add glassmorphism directly to
  convocation-modal.component.scss

  Wait, let me check if there's a night-modal class in global.scss. The
  agent mentioned global.scss has 542 lines and the .night-alert class is
  at lines 476-524. I need to check if there's already a night-modal class
  there.

  Actually, looking at the instruction again: "Si son componentes
  personalizados (ModalController), aplicame el mismo concepto de
  Glassmorphism que usamos en la clase .night-alert directamente en el SCSS
   del componente o envolvelos en un contenedor con esa clase"

  So for the ConvocationModal (ModalController), I should apply the
  glassmorphism directly in the SCSS component. The current SCSS is close
  but missing the glassmorphism elements:
  - backdrop-filter: blur(12px) — missing
  - border: 1px solid rgba(108, 99, 255, 0.4) — missing
  - box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 20px rgba(108, 99, 255,
  0.15) — missing
  - The border-radius on the wrapper — missing

  The way to apply it to a ModalController is through the :host or by
  targeting the wrapper. For Ionic modals, we can use ::part(content)
  shadow parts.

  Actually, looking at this more carefully, Ionic modal's backdrop is set
  via CSS. For a custom modal component, the way to style the wrapper from
  within the component SCSS is via :host and potentially the cssClass
  applied to the modal.

  The better approach: I should update openConvocation() to add a
  night-modal CSS class and add that class to global.scss. OR I can apply
  the glassmorphism directly in the convocation-modal.component.scss using
  :host and ::part().

  Actually, in Ionic modals, you can't easily style the wrapper from within
   the component SCSS because the modal wrapper is outside the component.
  The cssClass approach on the ModalController.create() call is the correct
   way.

  Let me check what night-modal needs to look like for a ModalController.
  In Ionic, the cssClass on a modal is applied to the modal's host element.
   So in global.scss we can add:

  .night-modal {
    --background: rgba(10, 14, 26, 0.97);
    --backdrop-opacity: 0.7;

    &::part(content) {
      background: rgba(10, 14, 26, 0.97);
      border: 1px solid rgba(108, 99, 255, 0.4);
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 20px rgba(108, 99,
  255, 0.15);
      backdrop-filter: blur(12px);
    }
  }

  But wait, the ConvocationModalComponent already has its own SCSS with
  dark backgrounds. The issue is:
  1. The modal WRAPPER doesn't have glassmorphism
  2. The header uses #0f1420 — this is flat dark, not glassmorphism

  So the combined approach is:
  - Add night-modal class to global.scss for the modal wrapper
  glassmorphism
  - Update openConvocation() in tactics.page.ts to use cssClass:
  'night-modal' instead of my-custom-modal-css
  - Update convocation-modal.component.scss to align the header/footer with
   glassmorphism

  Actually wait, the instruction says: "La lista de jugadores convocados y
  la lista de formaciones todavía usa los estilos por defecto" — so these
  "look default". The component already has dark styles, so maybe the issue
   is specifically the WRAPPER (the modal container) looking default
  because my-custom-modal-css doesn't exist.

  2. Lista de formaciones (formation-popover)

  The formation selector uses interface="popover" with
  cssClass="formation-popover". The formation-popover class needs to be
  defined in global.scss with Night Stadium styling.

  Looking at the HTML:
  <ion-select [value]="selectedFormation"
  (ionChange)="onFormationChange($event)" interface="popover"
  class="formation-select" cssClass="formation-popover">

  The cssClass="formation-popover" is applied to the Ionic select's popover
   — but if it doesn't exist in global.scss, the popover shows the DEFAULT
  native white/light styling. That's exactly the problem.

  3. Toast notifications in saveTactics()

  The saveTactics() method uses this.toastCtrl.create() directly — these
  are NOT using NotificationService. The instruction says to use
  NotificationService.

  But wait — the instruction says: "Asegurarte de que esas listas se
  disparen a través del NotificationService". Reading it again, "esas
  listas" = "lista de jugadores convocados" and "lista de formaciones". So
  the notification piece is specifically about those two UI patterns.

  However, the saveTactics() toasts are also raw ToastController calls that
   should be migrated too (for consistency with the Night Stadium UX).
  Actually, looking at the instruction more carefully: point 1 says "esas
  listas se disparen a través del NotificationService (usando showAlert o
  showPrompt según corresponda)". That's specifically about the list UIs.

  But showAlert and showPrompt are for alerts, not for the
  modal/select/toast patterns. Hmm. I think the instruction is slightly
  loose here, and what it really means is:
  - All UI interactions (including toast notifications after saving) should
   use NotificationService
  - The modal for convocation should get Night Stadium glassmorphism
  - The formation popover should get Night Stadium styling

  Also: ActionSheet for player options

  The openPlayerOptions() uses ActionSheetController with cssClass:
  'tactics-action-sheet'. This is not in the instruction scope, but it's
  another UI element that may also look default. I'll leave this for now
  and focus on what's in the instruction.

  Plan

  Changes needed:

  1. tactics.page.ts:
  - Add NotificationService to constructor (remove ToastController)
  - In saveTactics(): replace toastCtrl.create(...) with
  notificationSvc.success(), notificationSvc.warning(),
  notificationSvc.error()
  - In openConvocation(): change cssClass: 'my-custom-modal-css' to
  cssClass: 'night-modal'

  2. global.scss:
  - Add .night-modal class for ModalController glassmorphism
  - Add .formation-popover class for ion-select popover Night Stadium
  styling

  3. convocation-modal.component.scss:
  - Update header/toolbar to glassmorphism (transparent with border instead
   of flat dark)
  - Update footer to glassmorphism

  Wait, but actually the modal WRAPPER glassmorphism from night-modal would
   give it the glass backdrop and border. The internal component SCSS
  handles the content (list items, header, footer). Let me think about
  whether both are needed.

  The .night-modal::part(content) will style the modal's outer container.
  Inside the component, the ion-header ion-toolbar is separately styled.
  The two work together:
  - night-modal → modal wrapper border, backdrop blur, shadow
  - Component SCSS → internal content (header, list, footer)

  The component SCSS already styles things reasonably dark. The main visual
   gap is the modal wrapper. Adding night-modal in global.scss and updating
   the cssClass in openConvocation() should be the key fix.

  Let me also check if there's already a night-modal class or similar in
  global.scss. The agent only mentioned the .night-alert section. I'll add
  .night-modal to global.scss.

  For the .formation-popover class in global.scss, I need to style the
  ion-select-popover with Night Stadium colors. Let me write appropriate
  CSS.

  For Ionic ion-select with interface="popover", the cssClass is applied to
   the popover wrapper. The styling would be:

  .formation-popover {
    --background: rgba(10, 14, 26, 0.97);

    .popover-content {
      background: rgba(10, 14, 26, 0.97);
      border: 1px solid rgba(108, 99, 255, 0.4);
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 20px rgba(108, 99,
  255, 0.15);
      backdrop-filter: blur(12px);
    }

    ion-list {
      background: transparent;

      ion-item {
        --background: transparent;
        --color: #e2e8f0;
        --border-color: rgba(108, 99, 255, 0.15);

        &.item-radio-checked {
          --color: #6c63ff;
        }
      }

      ion-radio {
        --color: #6c63ff;
        --color-checked: #6c63ff;
      }
    }
  }

  Wait, in Ionic 7, the popover's content selector may be different. Let me
   use ::part(content) instead:

  .formation-popover::part(content) {
    background: rgba(10, 14, 26, 0.97);
    border: 1px solid rgba(108, 99, 255, 0.4);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 20px rgba(108, 99, 255,
  0.15);
    backdrop-filter: blur(12px);
  }

  And for the internal items:
  .formation-popover {
    .select-interface-option {
      --background: transparent;
      --color: #e2e8f0;

      &.item-radio-checked, &.select-interface-option-checked {
        --color: #6c63ff;
        --background: rgba(108, 99, 255, 0.1);
      }
    }
  }

  Actually, in Ionic 7, for ion-select-popover (the inner component of the
  popover), the items use .select-interface-option. Let me write the CSS
  carefully.

  Also, let me note: the tactics-action-sheet class in openPlayerOptions()
  also likely looks like the default. The instruction doesn't mention it,
  but fixing the three things mentioned is enough.

  Let me also check if there's a need to read the tactics.page.scss to
  understand the existing .formation-select styles.

  Actually, I have enough information to proceed. Let me now also check the
   global.scss to see if .formation-popover or .night-modal already exists
  there, and where to append new CSS.

  The agent mentioned global.scss has 542 lines and .night-alert is at
  lines 476-524. So I need to append after line 524.

  Let me read the end of global.scss to see what's there after
  .night-alert.

● Read 1 file (ctrl+o to expand)

● Changes to make:

  1. global.scss — Add two new classes at the end

  .night-modal — for ModalController glassmorphism:
  // Night Modal — ModalController Night Stadium
  .night-modal {
    --backdrop-opacity: 0.7;

    &::part(content) {
      background: rgba(10, 14, 26, 0.97);
      border: 1px solid rgba(108, 99, 255, 0.4);
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 20px rgba(108, 99,
  255, 0.15);
      backdrop-filter: blur(12px);
    }
  }

  .formation-popover — for ion-select popover Night Stadium:
  // Formation Popover — ion-select Night Stadium
  .formation-popover {
    --backdrop-opacity: 0.5;

    &::part(content) {
      background: rgba(10, 14, 26, 0.97);
      border: 1px solid rgba(108, 99, 255, 0.4);
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 20px rgba(108, 99,
  255, 0.15);
      backdrop-filter: blur(12px);
      min-width: 120px;
    }

    ion-list {
      background: transparent !important;
    }

    ion-item {
      --background: transparent;
      --color: #e2e8f0;
      --border-color: rgba(108, 99, 255, 0.1);
      font-size: 14px;
      font-weight: 600;
    }

    ion-radio {
      --color: rgba(108, 99, 255, 0.5);
      --color-checked: #6c63ff;
    }

    .item-radio-checked {
      --background: rgba(108, 99, 255, 0.1);
      --color: #6c63ff;
    }
  }

  2. tactics.page.ts — Three changes:

  1. Import NotificationService
  2. Replace ToastController in constructor with NotificationService
  3. Update saveTactics() to use NotificationService
  4. Update openConvocation() to use cssClass: 'night-modal'

  3. convocation-modal.component.scss — Update header/footer for better
  glassmorphism alignment

  The component SCSS already has a mostly-dark theme, but let me update:
  - ion-header ion-toolbar → use glassmorphism border instead of flat
  - ion-footer ion-toolbar → same

  Actually, looking at the ConvocationModal SCSS again, it already has
  decent dark styling:
  ion-header ion-toolbar {
      --background: #0f1420;
      --color: #ffffff;
      --border-color: rgba(255,255,255,0.08);
  }

  ion-content {
      --background: #0a0e1a;
  }

  ion-footer ion-toolbar {
      --background: #0f1420;
      --border-color: rgba(255,255,255,0.08);
  }

  The glassmorphism for the outer wrapper will come from the night-modal
  class. The inner content uses flat dark #0f1420 which is consistent with
  the Night Stadium theme. I'll update the border colors to use the violet
  neon (rgba(108, 99, 255, 0.2)) for the header border to match the
  .night-alert style.

  Actually, I think the inner SCSS is fine as is for the most part. The
  main issue was:
  1. The modal wrapper having cssClass: 'my-custom-modal-css' (non-existent
   class) → no glassmorphism wrapper
  2. The formation popover having no custom styling → default white/light
  style

  Let me make the changes now. For the tactics.page.ts, I need to be
  careful about the imports.

  Looking at the current tactics.page.ts imports:
  import { ToastController, ActionSheetController, ModalController } from
  '@ionic/angular';

  I need to:
  1. Add NotificationService import
  2. Remove ToastController from the Ionic imports
  3. Update constructor
  4. Update saveTactics() method

  Let me write the actual changes now.

  For saveTactics(), the current code:
  const t = await this.toastCtrl.create({ message: `Alineación incompleta:
  ${playersOnPitch.length}/11`, duration: 2000, color: 'warning' });
  t.present();
  return;

  Becomes:
  await this.notificationSvc.warning(`Alineación incompleta:
  ${playersOnPitch.length}/11`);
  return;

  And:
  const t = await this.toastCtrl.create({ message: `¡Falta el portero!`,
  duration: 2000, color: 'warning' });
  t.present();
  return;

  Becomes:
  await this.notificationSvc.warning('¡Falta el portero!');
  return;

  And in the subscribe:
  next: async () => {
      this.saving = false;
      const msg = isConvocation ? 'Squad List Updated ✅' : 'Tácticas
  guardadas. 💾';
      const t = await this.toastCtrl.create({ message: msg, duration: 2000,
   color: 'success' });
      t.present();
  },
  error: async () => {
      this.saving = false;
      const t = await this.toastCtrl.create({ message: 'Error al guardar
  tácticas', duration: 2000, color: 'danger' });
      t.present();
  }

  Becomes:
  next: async () => {
      this.saving = false;
      const msg = isConvocation ? 'Squad List Updated ✅' : 'Tácticas
  guardadas. 💾';
      await this.notificationSvc.success(msg);
  },
  error: async () => {
      this.saving = false;
      await this.notificationSvc.error('Error al guardar tácticas');
  }

  Also in openConvocation():
  cssClass: 'my-custom-modal-css'
  →
  cssClass: 'night-modal'

  Now let me execute these changes.


  Tengo todo lo que necesito. El diagnóstico es claro:

  - Lista convocados: cssClass: 'my-custom-modal-css' → clase inexistente →
   wrapper blanco default
  - Lista formaciones: cssClass="formation-popover" → clase inexistente en
  global.scss → popover blanco default
  - saveTactics(): usa ToastController crudo → bypass del
  NotificationService

  Tres cambios en tres archivos. Arranco.

● Update(frontend\src\global.scss)
  ⎿  Added 49 lines
      539    &.toast-error::part(container)   { border-left-color:
           #ef4444; }
      540    &.toast-warning::part(container) { border-left-color:
           #f59e0b; }
      541    &.toast-info::part(container)    { border-left-color:
           #6c63ff; }
      542 +}
      543 +
      544 +// Night Modal — ModalController Night Stadium
      545 +.night-modal {
      546 +  --backdrop-opacity: 0.7;
      547 +
      548 +  &::part(content) {
      549 +    background: rgba(10, 14, 26, 0.97);
      550 +    border: 1px solid rgba(108, 99, 255, 0.4);
      551 +    border-radius: 16px;
      552 +    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 20px
          +rgba(108, 99, 255, 0.15);
      553 +    backdrop-filter: blur(12px);
      554 +  }
      555 +}
      556 +
      557 +// Formation Popover — ion-select Night Stadium
      558 +.formation-popover {
      559 +  --backdrop-opacity: 0.4;
      560 +
      561 +  &::part(content) {
      562 +    background: rgba(10, 14, 26, 0.97);
      563 +    border: 1px solid rgba(108, 99, 255, 0.4);
      564 +    border-radius: 12px;
      565 +    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 20px
          +rgba(108, 99, 255, 0.15);
      566 +    backdrop-filter: blur(12px);
      567 +    min-width: 120px;
      568 +  }
      569 +
      570 +  ion-list {
      571 +    background: transparent !important;
      572 +  }
      573 +
      574 +  ion-item {
      575 +    --background: transparent;
      576 +    --color: #e2e8f0;
      577 +    --border-color: rgba(108, 99, 255, 0.1);
      578 +    font-size: 14px;
      579 +    font-weight: 600;
      580 +
      581 +    &.item-radio-checked {
      582 +      --background: rgba(108, 99, 255, 0.1);
      583 +      --color: #6c63ff;
      584 +    }
      585 +  }
      586 +
      587 +  ion-radio {
      588 +    --color: rgba(108, 99, 255, 0.5);
      589 +    --color-checked: #6c63ff;
      590 +  }
      591  }
      592   No newline at end of file

● Ahora el .ts — inyecto NotificationService, saco ToastController, y migro
   los tres llamados:

● Update(frontend\src\app\modules\coach\pages\tactics\tactics.page.ts)
  ⎿  File must be read first

● Read 1 file (ctrl+o to expand)

● Update(frontend\src\app\modules\coach\pages\tactics\tactics.page.ts)
  ⎿  Added 2 lines, removed 1 line
       7  import { PlayerService } from
          'src/app/core/services/player/player.service';
       8  import { AuthService } from
          'src/app/core/services/auth/auth.service';
       9  import { MatchService } from
          'src/app/core/services/match/match.service';
      10 -import { ToastController,
         -ActionSheetController, ModalController } from
         -'@ionic/angular';
      10 +import { ActionSheetController, ModalController } from
         +'@ionic/angular';
      11 +import { NotificationService } from 'src/app/core/service
         +s/notification/notification.service';
      12  import { Jugador, Partido, LineupSlotDto, EquipoResumen }
           from 'src/app/shared/models/models';
      13  import { ConvocationModalComponent } from 'src/app/shared
          /models/convocation-modal/convocation-modal.component';
      14

● Update(frontend\src\app\modules\coach\pages\tactics\tactics.page.ts)
  ⎿  Added 1 line, removed 1 line
      56      private playerSvc: PlayerService,
      57      private matchSvc: MatchService,
      58      private authSvc: AuthService,
      59 -    private toastCtrl: ToastController,
      59 +    private notificationSvc: NotificationService,
      60      private actionSheetCtrl: ActionSheetController,
      61      private modalCtrl: ModalController
      62    ) {}

● Ahora el openConvocation() — cambio el cssClass:

● Update(frontend\src\app\modules\coach\pages\tactics\tactics.page.ts)
  ⎿  Added 1 line, removed 1 line
      184          allPlayers: this.allTeamPlayers,
      185          currentSquad: currentSquad
      186        },
      187 -      cssClass: 'my-custom-modal-css'
      187 +      cssClass: 'night-modal'
      188      });
      189
      190      await modal.present();

● Ahora migro saveTactics() completo — saco los toastCtrl.create() y uso el
   NotificationService:

● Update(frontend\src\app\modules\coach\pages\tactics\tactics.page.ts)
  ⎿  Added 2 lines, removed 4 lines
      333
      334      if (!isConvocation) {
      335        if (playersOnPitch.length !== 11) {
      336 -        const t = await this.toastCtrl.create({ message:
          -`Alineación incompleta: ${playersOnPitch.length}/11`
          -, duration: 2000, color: 'warning' });
      337 -        t.present();
      336 +        await this.notificationSvc.warning(
          +`Alineación incompleta: ${playersOnPitch.length}/11`);
      337          return;
      338        }
      339
      340        if (!this.goalkeeper[0]?.player) {
      341 -        const t = await this.toastCtrl.create({ message:
          - `¡Falta el portero!`, duration: 2000, color: 'warning'
          -});
      342 -        t.present();
      341 +        await this.notificationSvc.warning('¡Falta el
          +portero!');
      342          return;
      343        }
      344      }

● Update(frontend\src\app\modules\coach\pages\tactics\tactics.page.ts)
  ⎿  Added 2 lines, removed 4 lines
      371        next: async () => {
      372          this.saving = false;
      373          const msg = isConvocation ? 'Squad List Updated
           ✅' : 'Tácticas guardadas. 💾';
      374 -        const t = await this.toastCtrl.create({ message:
          - msg, duration: 2000, color: 'success' });
      375 -        t.present();
      374 +        await this.notificationSvc.success(msg);
      375        },
      376        error: async () => {
      377          this.saving = false;
      378 -        const t = await this.toastCtrl.create({ message:
          - 'Error al guardar tácticas', duration: 2000, color:
          -'danger' });
      379 -        t.present();
      378 +        await this.notificationSvc.error('Error al
          +guardar tácticas');
      379        }
      380      });
      381    }

● Listo. Acá está el resumen de todo lo que se cambió:

  ---
  Cambios aplicados

  global.scss — 2 nuevas clases al final

  ┌────────────────────┬────────────────────────────────────────────────┐
  │       Clase        │                    Para qué                    │
  ├────────────────────┼────────────────────────────────────────────────┤
  │ .night-modal       │ ModalController — wrapper con glassmorphism,   │
  │                    │ borde violeta, backdrop-filter: blur(12px)     │
  ├────────────────────┼────────────────────────────────────────────────┤
  │                    │ ion-select interface="popover" — popover       │
  │ .formation-popover │ oscuro con ítems Night Stadium, ion-item y     │
  │                    │ ion-radio con colores violeta                  │
  └────────────────────┴────────────────────────────────────────────────┘

  tactics.page.ts — 4 cambios

  1. Import: ToastController removido, NotificationService agregado
  2. Constructor: toastCtrl → notificationSvc
  3. openConvocation(): cssClass: 'my-custom-modal-css' → cssClass:
  'night-modal'
  4. saveTactics(): los 4 toastCtrl.create() reemplazados por
  notificationSvc.warning() / notificationSvc.success() /
  notificationSvc.error()

  ---
  Resultado visual esperado:
  - Lista de convocados → modal con borde violeta neón, fondo
  rgba(10,14,26,0.97), blur backdrop
  - Selector de formación → popover oscuro glassmorphism, opciones en
  blanco/violeta
  - Notificaciones de guardado → Night Toast (top, con borde lateral de
  color) en vez del toast Ionic default