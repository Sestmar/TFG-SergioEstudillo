Clara la tarea. Son 3 archivos: .ts, .html y .scss de la TacticsProPage.
   Arranco.

● Update(frontend\src\app\modules\coach\pages\tactics-pro\tactics-pro.page
        .ts)
  ⎿  Added 1 line, removed 1 line
      1 -import { Component, OnInit, DestroyRef, inject } from '@an
        -gular/core';
      1 +import { Component, OnInit, DestroyRef, inject, ViewChild,
        + ElementRef } from '@angular/core';
      2  import { takeUntilDestroyed } from '@angular/core/rxjs-int
         erop';
      3  import { ActivatedRoute } from '@angular/router';
      4  import { CdkDragDrop } from '@angular/cdk/drag-drop';

● Update(frontend\src\app\modules\coach\pages\tactics-pro\tactics-pro.page
        .ts)
  ⎿  Added 5 lines
      52
      53    currentPhase: Phase = 'attack';
      54    isTransitioning = false;
      55 +  isDrawingMode = false;
      56
      57 +  @ViewChild('tacticCanvas') canvasRef!: ElementRef<HTMLC
         +anvasElement>;
      58 +  private ctx: CanvasRenderingContext2D | null = null;
      59 +  private isDrawing = false;
      60 +
      61    private phaseCache: Record<Phase, PhaseSnapshot | null>
           = { attack: null, defense: null };
      62
      63    constructor(

● Update(frontend\src\app\modules\coach\pages\tactics-pro\tactics-pro.page
        .ts)
  ⎿  Added 1 line
      116          this.applyOfficialLineup(savedSlots);
      117          this.restorePhases();
      118          this.loading = false;
      119 +        setTimeout(() => this.initCanvas(), 50);
      120        },
      121        error: () => { this.loading = false; }
      122      });

● Update(frontend\src\app\modules\coach\pages\tactics-pro\tactics-pro.page
        .ts)
  ⎿  Added 56 lines
      227      return `tactics-pro-${this.matchId}`;
      228    }
      229
      230 +  // ─── CANVAS ────────────────────────────────────────
          +───────
      231 +
      232 +  private initCanvas() {
      233 +    if (!this.canvasRef?.nativeElement) return;
      234 +    const canvas = this.canvasRef.nativeElement;
      235 +    const parent = canvas.parentElement;
      236 +    if (parent) {
      237 +      canvas.width = parent.offsetWidth;
      238 +      canvas.height = parent.offsetHeight;
      239 +    }
      240 +    this.ctx = canvas.getContext('2d');
      241 +    if (this.ctx) {
      242 +      this.ctx.strokeStyle = '#7c3aed';
      243 +      this.ctx.lineWidth = 3;
      244 +      this.ctx.lineCap = 'round';
      245 +      this.ctx.lineJoin = 'round';
      246 +    }
      247 +  }
      248 +
      249 +  toggleDrawMode() {
      250 +    this.isDrawingMode = !this.isDrawingMode;
      251 +    this.isDrawing = false;
      252 +  }
      253 +
      254 +  clearCanvas() {
      255 +    if (!this.ctx || !this.canvasRef?.nativeElement) ret
          +urn;
      256 +    const canvas = this.canvasRef.nativeElement;
      257 +    this.ctx.clearRect(0, 0, canvas.width, canvas.height
          +);
      258 +  }
      259 +
      260 +  onPointerDown(event: PointerEvent) {
      261 +    if (!this.isDrawingMode || !this.ctx) return;
      262 +    this.isDrawing = true;
      263 +    const { x, y } = this.getCanvasPos(event);
      264 +    this.ctx.beginPath();
      265 +    this.ctx.moveTo(x, y);
      266 +    event.preventDefault();
      267 +  }
      268 +
      269 +  onPointerMove(event: PointerEvent) {
      270 +    if (!this.isDrawing || !this.ctx) return;
      271 +    const { x, y } = this.getCanvasPos(event);
      272 +    this.ctx.lineTo(x, y);
      273 +    this.ctx.stroke();
      274 +    event.preventDefault();
      275 +  }
      276 +
      277 +  onPointerUp() {
      278 +    this.isDrawing = false;
      279 +  }
      280 +
      281 +  private getCanvasPos(event: PointerEvent): { x: number
          +; y: number } {
      282 +    const rect = this.canvasRef.nativeElement.getBoundin
          +gClientRect();
      283 +    return { x: event.clientX - rect.left, y: event.clie
          +ntY - rect.top };
      284 +  }
      285 +
      286    // ─── FORMACIÓN ─────────────────────────────────────
           ───────
      287
      288    onFormationChange(event: IonSelectChangeEvent) {

● Ahora el HTML — canvas + botones + [cdkDragDisabled]:

● Update(frontend\src\app\modules\coach\pages\tactics-pro\tactics-pro.page
        .html)
  ⎿  Added 6 lines
      40          </button>
      41        </div>
      42
      43 +      <ion-button (click)="toggleDrawMode()" class="actio
         +n-btn" [class.active-draw]="isDrawingMode">
      44 +        <ion-icon name="pencil-outline" slot="icon-only">
         +</ion-icon>
      45 +      </ion-button>
      46 +      <ion-button (click)="clearCanvas()" class="action-b
         +tn">
      47 +        <ion-icon name="trash-outline" slot="icon-only"><
         +/ion-icon>
      48 +      </ion-button>
      49        <ion-button (click)="savePhases()" class="action-bt
          n green">
      50          <ion-icon name="save-outline" slot="start"></ion-
          icon>
      51          <span class="btn-text">GUARDAR</span>

● Update(frontend\src\app\modules\coach\pages\tactics-pro\tactics-pro.page
        .html)
  ⎿  Added 9 lines
      81          {{ currentPhase === 'attack' ? '⚔ FASE ATAQUE' :
          '🛡 FASE DEFENSA' }}
      82        </div>
      83
      84 +      <canvas #tacticCanvas
      85 +        class="tactic-canvas"
      86 +        [class.drawing-active]="isDrawingMode"
      87 +        (pointerdown)="onPointerDown($event)"
      88 +        (pointermove)="onPointerMove($event)"
      89 +        (pointerup)="onPointerUp()"
      90 +        (pointerleave)="onPointerUp()">
      91 +      </canvas>
      92 +
      93        <div class="tactical-layer" [class.transitioning]="
          isTransitioning">
      94
      95          <!-- DELANTEROS -->

● Ahora el [cdkDragDisabled] en todos los tokens del campo y el banquillo:

● Update(frontend\src\app\modules\coach\pages\tactics-pro\tactics-pro.page
        .html)
  ⎿  Added 4 lines, removed 4 lines
       97            <div class="slot-container" *ngFor="let slot o
           f forwards">
       98              <div cdkDropList [id]="slot.id" [cdkDropList
           Data]="slot.player ? [slot.player] : []"
       99                [cdkDropListConnectedTo]="allSlotIds" (cdk
           DropListDropped)="drop($event)" class="pos-anchor">
      100 -              <div class="player-token" *ngIf="slot.play
          -er" cdkDrag [cdkDragData]="slot.player">
      100 +              <div class="player-token" *ngIf="slot.play
          +er" cdkDrag [cdkDragData]="slot.player" [cdkDragDisabled
          +]="isDrawingMode">
      101                  <div class="player-circle" [style.--card
           -accent]="getBorderColor(slot.player.posicion)">
      102                    <img [src]="getProfileImage(slot.playe
           r)" alt="player">
      103                  </div>
     ...
      118            <div class="slot-container" *ngFor="let slot o
           f midfielders">
      119              <div cdkDropList [id]="slot.id" [cdkDropList
           Data]="slot.player ? [slot.player] : []"
      120                [cdkDropListConnectedTo]="allSlotIds" (cdk
           DropListDropped)="drop($event)" class="pos-anchor">
      121 -              <div class="player-token" *ngIf="slot.play
          -er" cdkDrag [cdkDragData]="slot.player">
      121 +              <div class="player-token" *ngIf="slot.play
          +er" cdkDrag [cdkDragData]="slot.player" [cdkDragDisabled
          +]="isDrawingMode">
      122                  <div class="player-circle" [style.--card
           -accent]="getBorderColor(slot.player.posicion)">
      123                    <img [src]="getProfileImage(slot.playe
           r)" alt="player">
      124                  </div>
     ...
      139            <div class="slot-container" *ngFor="let slot o
           f defenders">
      140              <div cdkDropList [id]="slot.id" [cdkDropList
           Data]="slot.player ? [slot.player] : []"
      141                [cdkDropListConnectedTo]="allSlotIds" (cdk
           DropListDropped)="drop($event)" class="pos-anchor">
      142 -              <div class="player-token" *ngIf="slot.play
          -er" cdkDrag [cdkDragData]="slot.player">
      142 +              <div class="player-token" *ngIf="slot.play
          +er" cdkDrag [cdkDragData]="slot.player" [cdkDragDisabled
          +]="isDrawingMode">
      143                  <div class="player-circle" [style.--card
           -accent]="getBorderColor(slot.player.posicion)">
      144                    <img [src]="getProfileImage(slot.playe
           r)" alt="player">
      145                  </div>
     ...
      160            <div class="slot-container" *ngFor="let slot o
           f goalkeeper">
      161              <div cdkDropList [id]="slot.id" [cdkDropList
           Data]="slot.player ? [slot.player] : []"
      162                [cdkDropListConnectedTo]="allSlotIds" (cdk
           DropListDropped)="drop($event)" class="pos-anchor">
      163 -              <div class="player-token" *ngIf="slot.play
          -er" cdkDrag [cdkDragData]="slot.player">
      163 +              <div class="player-token" *ngIf="slot.play
          +er" cdkDrag [cdkDragData]="slot.player" [cdkDragDisabled
          +]="isDrawingMode">
      164                  <div class="player-circle" [style.--card
           -accent]="getBorderColor(slot.player.posicion)">
      165                    <img [src]="getProfileImage(slot.playe
           r)" alt="player">
      166                  </div>

● Update(frontend\src\app\modules\coach\pages\tactics-pro\tactics-pro.page
        .html)
  ⎿  Added 1 line, removed 1 line
      190      <div cdkDropList id="benchList" [cdkDropListData]="b
           ench"
      191        [cdkDropListConnectedTo]="allSlotIds" (cdkDropList
           Dropped)="drop($event)" class="bench-strip">
      192        <div class="bench-slot" *ngFor="let p of bench">
      193 -        <div class="bench-token" cdkDrag [cdkDragData]="
          -p">
      193 +        <div class="bench-token" cdkDrag [cdkDragData]="
          +p" [cdkDragDisabled]="isDrawingMode">
      194            <div class="bench-circle" [style.--card-accent
           ]="getBorderColor(p.posicion)">
      195              <img [src]="getProfileImage(p)" alt="player"
           >
      196            </div>

● Ahora el SCSS — canvas + botón activo:

● Update(frontend\src\app\modules\coach\pages\tactics-pro\tactics-pro.page
        .scss)
  ⎿  Added 17 lines
      251  }
      252
      253  // =====================================================
           =======
      254 +// CANVAS DE DIBUJO
      255 +// =====================================================
          +=======
      256 +.tactic-canvas {
      257 +  position: absolute;
      258 +  inset: 0;
      259 +  pointer-events: none;
      260 +  z-index: 15;
      261 +  touch-action: none;
      262 +
      263 +  &.drawing-active {
      264 +    pointer-events: auto;
      265 +    z-index: 25;
      266 +    cursor: crosshair;
      267 +  }
      268 +}
      269 +
      270 +// =====================================================
          +=======
      271  // TACTICAL LAYER — con transición de fase
      272  // =====================================================
           =======
      273  .tactical-layer {

● Update(frontend\src\app\modules\coach\pages\tactics-pro\tactics-pro.page
        .scss)
  ⎿  Added 5 lines
       96
       97        &.green { --background: #{$accent-green}; }
       98
       99 +      &.active-draw {
      100 +        --background: #7c3aed;
      101 +        --box-shadow: 0 0 14px rgba(124, 58, 237, 0.6);
      102 +      }
      103 +
      104        .btn-text {
      105          display: none;
      106          @media (min-width: 500px) { display: inline-bloc
           k; margin-left: 6px; }

● Listo. Lo que cambió:

  .ts — 3 cosas añadidas:
  - @ViewChild('tacticCanvas') + contexto 2D + flag isDrawingMode
  - initCanvas() llamado con setTimeout tras cargar (porque el canvas está
   dentro del *ngIf="!loading")
  - Métodos: toggleDrawMode(), clearCanvas(), onPointerDown/Move/Up(),
  getCanvasPos()

  .html — 3 cosas:
  - <canvas #tacticCanvas> con los 4 eventos pointer, dentro del
  .pitch-board
  - Botones pencil-outline y trash-outline en el header
  - [cdkDragDisabled]="isDrawingMode" en todos los tokens del campo y
  banquillo

  .scss — 2 cosas:
  - .tactic-canvas con pointer-events: none por defecto → auto + cursor:
  crosshair cuando .drawing-active
  - .active-draw para el botón del lápiz cuando está activo (púrpura con
  glow)

  Probalo — al pulsar el lápiz debería poder dibujar sobre el campo con el
   dedo o el ratón, y los jugadores no se moverán mientras dibujas. Al
  pulsar la papelera se limpia todo.