import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  
  constructor(
    private platform: Platform
  ) {
    this.initializeApp();
  }

  ngOnInit(): void {
    console.log('Aplicación inicializada');
  }

  initializeApp() {
    this.platform.ready().then(() => {
      console.log('✅ Aplicación Ionic inicializada correctamente');
    });
  }
}