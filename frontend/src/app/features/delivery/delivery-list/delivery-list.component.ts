import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DeliveryService } from '../../../core/services/delivery.service';
import { AuthService } from '../../../core/services/auth.service';
import { Delivery } from '../../../core/models/delivery.model';

@Component({
  selector: 'app-delivery-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>{{ user?.role === 'SENDER' ? 'Mes livraisons' : 'Missions disponibles' }}</h1>
        <a routerLink="/deliveries/create" class="btn-primary" *ngIf="user?.role === 'SENDER'">
          ➕ Nouvelle livraison
        </a>
      </div>

      <div class="tabs" *ngIf="user?.role === 'DELIVERER'">
        <button [class.active]="activeTab === 'available'" (click)="setTab('available')">
          🔍 Disponibles ({{ availableDeliveries.length }})
        </button>
        <button [class.active]="activeTab === 'accepted'" (click)="setTab('accepted')">
          📦 Mes missions ({{ acceptedDeliveries.length }})
        </button>
      </div>

      <div class="empty" *ngIf="!loading && displayedDeliveries.length === 0">
        <div class="empty-icon">📭</div>
        <h3>Aucune mission</h3>
        <p *ngIf="user?.role === 'SENDER'">Créez votre première livraison !</p>
        <p *ngIf="user?.role === 'DELIVERER'">Aucune mission disponible.</p>
      </div>

      <div class="delivery-grid" *ngIf="!loading && displayedDeliveries.length > 0">
        <div class="delivery-card" *ngFor="let d of displayedDeliveries">
          <div class="card-header">
            <span class="category">{{ getCategoryLabel(d.itemCategory) }}</span>
            <span class="status-badge" [class]="'status-' + d.status.toLowerCase()">
              {{ getStatusLabel(d.status) }}
            </span>
          </div>
          <div class="card-body">
            <div class="route">
              <div class="address"><span class="dot green"></span><span>{{ d.pickupAddress }}</span></div>
              <div class="route-line"></div>
              <div class="address"><span class="dot red"></span><span>{{ d.deliveryAddress }}</span></div>
            </div>
            <p class="item-desc">{{ d.itemDescription }}</p>
          </div>
          <div class="card-footer">
            <div class="price-info">
              <div class="price">{{ d.estimatedPrice | number:'1.2-2' }} €</div>
              <div class="earning" *ngIf="user?.role === 'DELIVERER'">Gain: {{ d.delivererEarning | number:'1.2-2' }} €</div>
              <div class="points-info">+{{ d.pointsAwarded }} pts</div>
            </div>
            <div class="card-actions">
              <button class="btn-accept"
                      *ngIf="user?.role === 'DELIVERER' && d.status === 'PENDING'"
                      (click)="acceptDelivery(d)" [disabled]="accepting === d.id">
                {{ accepting === d.id ? '...' : '✅ Accepter' }}
              </button>
              <a [routerLink]="['/deliveries', d.id]" class="btn-details">Détails →</a>
            </div>
          </div>
          <div class="card-meta">
            <span>Posté il y a {{ getTimeAgo(d.createdAt) }}</span>
            <span *ngIf="d.delivererName">🛵 {{ d.delivererName }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 1100px; margin: 0 auto; padding: 32px 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { font-size: 1.6rem; color: #1e2140; margin: 0; }
    .btn-primary { background: #ff2d78; color: white; padding: 10px 20px; border-radius: 10px; font-weight: 700; text-decoration: none; font-size: 0.9rem; }
    .tabs { display: flex; gap: 8px; margin-bottom: 24px; border-bottom: 2px solid #eee; }
    .tabs button { padding: 10px 20px; border: none; background: none; cursor: pointer; color: #888; font-size: 0.9rem; font-weight: 600; border-bottom: 3px solid transparent; margin-bottom: -2px; }
    .tabs button.active { color: #ff2d78; border-bottom-color: #ff2d78; }
    .empty { text-align: center; padding: 60px; color: #888; }
    .empty-icon { font-size: 4rem; margin-bottom: 16px; }
    .empty h3 { color: #1e2140; margin-bottom: 8px; }
    .delivery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
    .delivery-card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); transition: transform 0.2s; }
    .delivery-card:hover { transform: translateY(-2px); }
    .card-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 16px 0; }
    .category { font-size: 0.82rem; background: #f0f0f0; color: #555; padding: 4px 10px; border-radius: 20px; }
    .status-badge { font-size: 0.78rem; padding: 4px 10px; border-radius: 20px; font-weight: 600; }
    .status-pending { background: #fff8e1; color: #f57c00; }
    .status-accepted { background: #e3f2fd; color: #1565c0; }
    .status-completed { background: #e8f5e9; color: #2e7d32; }
    .status-cancelled { background: #fce4ec; color: #c62828; }
    .card-body { padding: 16px; }
    .route { margin-bottom: 12px; }
    .address { display: flex; gap: 8px; align-items: center; font-size: 0.88rem; color: #333; padding: 4px 0; }
    .dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .dot.green { background: #4caf50; }
    .dot.red { background: #f44336; }
    .route-line { width: 2px; height: 12px; background: #ddd; margin-left: 4px; }
    .item-desc { font-size: 0.85rem; color: #777; margin: 0; font-style: italic; }
    .card-footer { display: flex; justify-content: space-between; align-items: flex-end; padding: 0 16px 16px; }
    .price { font-size: 1.2rem; font-weight: 800; color: #ff2d78; }
    .earning { font-size: 0.82rem; color: #555; }
    .points-info { font-size: 0.78rem; color: #f5c400; font-weight: 600; }
    .card-actions { display: flex; gap: 8px; align-items: center; }
    .btn-accept { background: #ff2d78; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 0.85rem; font-weight: 600; }
    .btn-accept:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-details { color: #ff2d78; font-weight: 600; text-decoration: none; font-size: 0.88rem; }
    .card-meta { padding: 10px 16px; background: #fafafa; display: flex; justify-content: space-between; font-size: 0.78rem; color: #aaa; border-top: 1px solid #f0f0f0; }
  `]
})
export class DeliveryListComponent implements OnInit {
  user: any;
  availableDeliveries: Delivery[] = [];
  acceptedDeliveries: Delivery[] = [];
  sentDeliveries: Delivery[] = [];
  activeTab: 'available' | 'accepted' = 'available';
  loading = true;
  accepting: number | null = null;

  constructor(
    private deliveryService: DeliveryService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.user = this.authService.currentUser;
  }

  ngOnInit(): void {
    this.loadData();
  }

  get displayedDeliveries(): Delivery[] {
    if (this.user?.role === 'SENDER') return this.sentDeliveries;
    return this.activeTab === 'available' ? this.availableDeliveries : this.acceptedDeliveries;
  }

  setTab(tab: 'available' | 'accepted'): void {
    this.activeTab = tab;
  }

  loadData(): void {
    this.loading = true;
    if (this.user?.role === 'SENDER') {
      this.deliveryService.getMySent().subscribe({
        next: d => { this.sentDeliveries = d; this.loading = false; this.cdr.detectChanges(); },
        error: () => { this.loading = false; this.cdr.detectChanges(); }
      });
    } else {
      this.deliveryService.getAvailable().subscribe({
        next: d => { this.availableDeliveries = d; this.loading = false; this.cdr.detectChanges(); },
        error: () => { this.loading = false; this.cdr.detectChanges(); }
      });
      this.deliveryService.getMyAccepted().subscribe({
        next: d => { this.acceptedDeliveries = d; this.cdr.detectChanges(); },
        error: () => {}
      });
    }
  }

  acceptDelivery(delivery: Delivery): void {
    this.accepting = delivery.id;
    this.deliveryService.acceptDelivery(delivery.id).subscribe({
      next: () => { this.accepting = null; this.loadData(); },
      error: () => { this.accepting = null; }
    });
  }

  getCategoryLabel(cat: string): string {
    const map: Record<string, string> = {
      FLOWER: '🌸 Fleur', DOCUMENT: '📄 Document', PARCEL: '📦 Colis', CAKE: '🎂 Gâteau',
      GROCERY: '🛒 Courses', GIFT: '🎁 Cadeau', KEY: '🔑 Clé', PHARMACY: '💊 Pharmacie',
      RESTAURANT: '🍽️ Restaurant', BAKERY: '🥖 Boulangerie', SUPERMARKET: '🏪 Supermarché', OTHER: '📋 Autre'
    };
    return map[cat] ?? cat;
  }

  getStatusLabel(s: string): string {
    const map: Record<string, string> = {
      PENDING: 'En attente', ACCEPTED: 'Acceptée', IN_PROGRESS: 'En cours',
      DELIVERED: 'Livré', CONFIRMED: 'Confirmé', COMPLETED: 'Terminé', CANCELLED: 'Annulé'
    };
    return map[s] ?? s;
  }

  getTimeAgo(date: string): string {
    const diff = Date.now() - new Date(date).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return m + ' min';
    const h = Math.floor(m / 60);
    if (h < 24) return h + 'h';
    return Math.floor(h / 24) + 'j';
  }
}
