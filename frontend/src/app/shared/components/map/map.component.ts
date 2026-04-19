import { Component, Output, EventEmitter, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import * as polyline from '@mapbox/polyline';

const ORS_API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjdmZTFlNzlhMmQ1NDQxNGY5ZWFmZjdiNWYzYzMzZTgxIiwiaCI6Im11cm11cjY0In0=';

export interface RouteResult {
  walkingDistance: number;
  walkingDuration: number;
  drivingDistance: number;
  drivingDuration: number;
  estimatedPrice: number;
  pickupAddress: string;
  deliveryAddress: string;
}

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="map-container">
      <div class="map-instructions">
        <div class="instruction" [class.done]="pickupCoords">
          <span class="inst-num" [class.done]="pickupCoords">{{ pickupCoords ? '✓' : '1' }}</span>
          <span>{{ pickupCoords ? 'Départ : ' + pickupAddress : 'Cliquez sur la carte pour placer le départ' }}</span>
        </div>
        <div class="instruction" [class.done]="deliveryCoords">
          <span class="inst-num" [class.done]="deliveryCoords">{{ deliveryCoords ? '✓' : '2' }}</span>
          <span>{{ deliveryCoords ? 'Arrivée : ' + deliveryAddress : 'Cliquez pour placer la destination' }}</span>
        </div>
      </div>

      <div id="map" style="height: 400px; border-radius: 12px; z-index: 1;"></div>

      <div class="loading-route" *ngIf="loadingRoute">
        <div class="spinner"></div>
        <span>Calcul de l'itinéraire...</span>
      </div>

      <div class="route-results" *ngIf="routeResult && !loadingRoute">
        <h3>Résultats de l'itinéraire</h3>
        <div class="route-cards">
          <div class="route-card walk">
            <div class="route-icon">🚶</div>
            <div class="route-label">À pied</div>
            <div class="route-distance">{{ routeResult.walkingDistance | number:'1.1-1' }} km</div>
            <div class="route-duration">{{ formatDuration(routeResult.walkingDuration) }}</div>
          </div>
          <div class="route-card drive">
            <div class="route-icon">🚗</div>
            <div class="route-label">En voiture</div>
            <div class="route-distance">{{ routeResult.drivingDistance | number:'1.1-1' }} km</div>
            <div class="route-duration">{{ formatDuration(routeResult.drivingDuration) }}</div>
          </div>
          <div class="route-card price">
            <div class="route-icon">💶</div>
            <div class="route-label">Prix estimé</div>
            <div class="route-distance">{{ routeResult.estimatedPrice | number:'1.2-2' }} €</div>
            <div class="route-duration">livraison incluse</div>
          </div>
        </div>
        <div class="route-actions">
          <button class="btn-use" (click)="useResult()">✅ Utiliser ces adresses</button>
          <button class="btn-reset" (click)="reset()">🔄 Recommencer</button>
        </div>
      </div>

      <div class="error-msg" *ngIf="errorMsg">{{ errorMsg }}</div>
    </div>
  `,
  styles: [`
    .map-container { display: flex; flex-direction: column; gap: 16px; }
    .map-instructions { display: flex; flex-direction: column; gap: 8px; }
    .instruction { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: #f8f9ff; border-radius: 10px; font-size: 0.88rem; color: #555; }
    .instruction.done { background: #e8f5e9; color: #2e7d32; }
    .inst-num { width: 24px; height: 24px; border-radius: 50%; background: #ff2d78; color: white; display: flex; align-items: center; justify-content: center; font-size: 0.78rem; font-weight: 700; flex-shrink: 0; }
    .inst-num.done { background: #4caf50; }
    .loading-route { display: flex; align-items: center; gap: 12px; padding: 16px; background: #f8f9ff; border-radius: 10px; }
    .spinner { width: 24px; height: 24px; border: 3px solid #eee; border-top-color: #ff2d78; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .route-results { background: white; border-radius: 14px; padding: 20px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
    .route-results h3 { margin: 0 0 16px; color: #1e2140; font-size: 1rem; }
    .route-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
    .route-card { border-radius: 12px; padding: 16px; text-align: center; display: flex; flex-direction: column; gap: 4px; }
    .route-card.walk { background: #e3f2fd; }
    .route-card.drive { background: #fff8e1; }
    .route-card.price { background: #fce4ec; }
    .route-icon { font-size: 1.8rem; }
    .route-label { font-size: 0.78rem; color: #666; }
    .route-distance { font-size: 1.2rem; font-weight: 800; color: #1e2140; }
    .route-duration { font-size: 0.78rem; color: #888; }
    .route-actions { display: flex; gap: 8px; }
    .btn-use { background: #ff2d78; color: white; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; }
    .btn-reset { background: #f0f0f0; color: #555; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 600; cursor: pointer; }
    .error-msg { background: #fff0f5; color: #ff2d78; padding: 10px; border-radius: 8px; font-size: 0.88rem; }
  `]
})
export class MapComponent implements AfterViewInit {
  @Output() routeSelected = new EventEmitter<RouteResult>();

  private map!: L.Map;
  private pickupMarker?: L.Marker;
  private deliveryMarker?: L.Marker;
  private routeLayer?: L.LayerGroup;

  pickupCoords?: [number, number];
  deliveryCoords?: [number, number];
  pickupAddress = '';
  deliveryAddress = '';
  routeResult?: RouteResult;
  loadingRoute = false;
  errorMsg = '';

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    setTimeout(() => this.initMap(), 100);
  }

  private initMap(): void {
    this.map = L.map('map').setView([45.75, 4.85], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.routeLayer = L.layerGroup().addTo(this.map);

    const greenIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41], iconAnchor: [12, 41]
    });

    const redIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41], iconAnchor: [12, 41]
    });

    this.map.on('click', async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      if (!this.pickupCoords) {
        this.pickupCoords = [lat, lng];
        this.pickupMarker = L.marker([lat, lng], { icon: greenIcon })
          .addTo(this.map).bindPopup('📍 Départ').openPopup();
        this.pickupAddress = await this.reverseGeocode(lat, lng);
        this.cdr.detectChanges();

      } else if (!this.deliveryCoords) {
        this.deliveryCoords = [lat, lng];
        this.deliveryMarker = L.marker([lat, lng], { icon: redIcon })
          .addTo(this.map).bindPopup('🎯 Arrivée').openPopup();
        this.deliveryAddress = await this.reverseGeocode(lat, lng);
        this.cdr.detectChanges();
        await this.calculateRoute();
      }
    });
  }

  private async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
      const data = await res.json();
      return data.display_name?.split(',').slice(0, 3).join(', ') ?? `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  }

  private async calculateRoute(): Promise<void> {
    if (!this.pickupCoords || !this.deliveryCoords) return;
    this.loadingRoute = true;
    this.errorMsg = '';
    this.cdr.detectChanges();

    try {
      const [walkData, driveData] = await Promise.all([
        this.fetchRoute('foot-walking'),
        this.fetchRoute('driving-car')
      ]);

      const walkDist = walkData.routes[0].summary.distance / 1000;
      const walkDur = walkData.routes[0].summary.duration;
      const driveDist = driveData.routes[0].summary.distance / 1000;
      const driveDur = driveData.routes[0].summary.duration;

      this.routeResult = {
        walkingDistance: walkDist,
        walkingDuration: walkDur,
        drivingDistance: driveDist,
        drivingDuration: driveDur,
        estimatedPrice: this.calculatePrice(driveDist),
        pickupAddress: this.pickupAddress,
        deliveryAddress: this.deliveryAddress
      };

      // Decode polyline geometry
      const coords = polyline.decode(driveData.routes[0].geometry) as [number, number][];
      this.routeLayer?.clearLayers();
      L.polyline(coords, { color: '#ff2d78', weight: 4, opacity: 0.8 }).addTo(this.routeLayer!);

    } catch (e) {
      console.error(e);
      this.errorMsg = "Erreur lors du calcul de l'itinéraire.";
    } finally {
      this.loadingRoute = false;
      this.cdr.detectChanges();
    }
  }

  private async fetchRoute(profile: string): Promise<any> {
    const [startLat, startLng] = this.pickupCoords!;
    const [endLat, endLng] = this.deliveryCoords!;

    const res = await fetch(`https://api.openrouteservice.org/v2/directions/${profile}`, {
      method: 'POST',
      headers: {
        'Authorization': ORS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        coordinates: [[startLng, startLat], [endLng, endLat]]
      })
    });

    if (!res.ok) throw new Error('ORS API error ' + res.status);
    return res.json();
  }

  private calculatePrice(distanceKm: number): number {
    return Math.round((3.0 + distanceKm * 0.8) * 100) / 100;
  }

  formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    if (m < 60) return `${m} min`;
    const h = Math.floor(m / 60);
    const rem = m % 60;
    return `${h}h${rem > 0 ? rem + 'min' : ''}`;
  }

  useResult(): void {
    if (this.routeResult) this.routeSelected.emit(this.routeResult);
  }

  reset(): void {
    this.pickupCoords = undefined;
    this.deliveryCoords = undefined;
    this.pickupAddress = '';
    this.deliveryAddress = '';
    this.routeResult = undefined;
    this.errorMsg = '';
    if (this.pickupMarker) this.map.removeLayer(this.pickupMarker);
    if (this.deliveryMarker) this.map.removeLayer(this.deliveryMarker);
    this.routeLayer?.clearLayers();
    this.cdr.detectChanges();
  }
}
