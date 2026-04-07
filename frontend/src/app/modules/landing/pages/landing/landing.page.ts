import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
})
export class LandingPage implements OnInit {

  @ViewChild(IonContent) content!: IonContent;

  constructor() { }

  ngOnInit() { }

  async scrollTo(sectionId: string) {
    const el = document.getElementById(sectionId);
    if (el) {
      const offset = el.offsetTop;
      await this.content.scrollToPoint(0, offset, 600);
    }
  }

}