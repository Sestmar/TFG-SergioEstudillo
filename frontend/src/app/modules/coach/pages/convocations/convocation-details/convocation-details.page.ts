import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { ConvocationService } from 'src/app/core/services/convocation/convocation.service';
import { Convocation } from 'src/app/shared/models/models';

@Component({
  selector: 'app-convocation-details',
  templateUrl: './convocation-details.page.html',
  styleUrls: ['./convocation-details.page.scss'],
})
export class ConvocationDetailsPage implements OnInit {
  convocation: Convocation | null = null;
  loading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private convocationService: ConvocationService,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    // Capturamos el ID de la URL (ej: /convocations/5)
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadConvocation(+id);
    }
  }

  loadConvocation(id: number) {
    this.loading = true;
    this.convocationService.getConvocationById(id).subscribe({
      next: (data) => {
        this.convocation = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando detalle:', err);
        this.loading = false;
      }
    });
  }

  // Abrir Google Maps con la ubicación
  openMaps() {
    if (!this.convocation?.lugar) return;
    const query = encodeURIComponent(this.convocation.lugar);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_system');
  }

  goBack() {
    this.navCtrl.back();
  }
}