import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
})
export class LandingPage implements OnInit {

  constructor() { }

  ngOnInit() {
    // Aquí puedes añadir lógica de inicialización si fuera necesaria
    console.log('Landing Page cargada 🚀');
  }

}