import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { ConvocationService } from 'src/app/core/services/convocation/convocation.service';
import { PdfService } from 'src/app/core/services/pdf/pdf.service';
import { Convocation } from 'src/app/shared/models/models';

@Component({
  selector: 'app-convocation-details',
  templateUrl: './convocation-details.page.html',
  styleUrls: ['./convocation-details.page.scss'],
})
export class ConvocationDetailsPage implements OnInit {
  
  private destroyRef = inject(DestroyRef);
  convocation: Convocation | null = null;
  loading: boolean = true;

  generandoPdf: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private convocationService: ConvocationService,
    private pdfService: PdfService,
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
    this.convocationService.getConvocationById(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        this.convocation = data;
        this.loading = false;
      },
      error: () => {
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

  async descargarPDF() {
    if (!this.convocation) return;
    this.generandoPdf = true;
    await this.pdfService.generarConvocatoriaPDF(this.convocation);
    this.generandoPdf = false;
  }

  goBack() {
    this.navCtrl.back();
  }
}