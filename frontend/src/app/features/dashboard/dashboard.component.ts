import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { DeliveryService } from '../../core/services/delivery.service';
import { AuthResponse } from '../../core/models/user.model';
import { User } from '../../core/models/user.model';
import { Delivery } from '../../core/models/delivery.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">
      <div class="hero">
        <div class="hero-content">
          <h1>Bonjour, {{ user?.firstName }} 👋</h1>
          <p class="subtitle" *ngIf="user?.role === 'SENDER'">Besoin d'envoyer quelque chose ? Postez une mission !</p>
          <p class="subtitle" *ngIf="user?.role === 'DELIVERER'">Prêt à livrer ? Acceptez une mission disponible !</p>
          <div class="hero-actions">
            <a routerLink="/deliveries/create" class="btn-primary" *ngIf="user?.role === 'SENDER'">📦 Créer une livraison</a>
            <a routerLink="/deliveries" class="btn-primary" *ngIf="user?.role === 'DELIVERER'">🛵 Voir les missions</a>
            <a routerLink="/deliveries" class="btn-secondary">Mes missions</a>
          </div>
        </div>
        <div class="hero-art">🚀</div>
      </div>

      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-icon">⭐</div>
          <div class="stat-value">{{ profile?.points ?? 0 }}</div>
          <div class="stat-label">Points</div>
        </div>
        <div class="stat-card" *ngIf="user?.role === 'DELIVERER'">
          <div class="stat-icon">💶</div>
          <div class="stat-value">{{ profile?.balance ?? 0 | number:'1.2-2' }} €</div>
          <div class="stat-label">Solde</div>
        </div>
        <div class="stat-card" *ngIf="user?.role === 'DELIVERER'">
          <div class="stat-icon">⭐</div>
          <div class="stat-value">{{ profile?.rating ?? 0 | number:'1.1-1' }}</div>
          <div class="stat-label">Note</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📦</div>
          <div class="stat-value">{{ totalDeliveries }}</div>
          <div class="stat-label">Missions</div>
        </div>
      </div>

      <div class="section">
        <h2>Comment ça marche ?</h2>
        <div class="steps">
          <div class="step">
            <div class="step-num">1</div>
            <div class="step-icon">📝</div>
            <div class="step-text"><strong>Postez votre besoin</strong><small>Adresse départ, destination, objet</small></div>
          </div>
          <div class="step-arrow">→</div>
          <div class="step">
            <div class="step-num">2</div>
            <div class="step-icon">🔍</div>
            <div class="step-text"><strong>Un livreur accepte</strong><small>Matching automatique</small></div>
          </div>
          <div class="step-arrow">→</div>
          <div class="step">
            <div class="step-num">3</div>
            <div class="step-icon">🛵</div>
            <div class="step-text"><strong>Livraison en 2h</strong><small>Rapide et local</small></div>
          </div>
          <div class="step-arrow">→</div>
          <div class="step">
            <div class="step-num">4</div>
            <div class="step-icon">✅</div>
            <div class="step-text"><strong>Confirmez avec le code</strong><small>Paiement libéré</small></div>
          </div>
        </div>
      </div>

      <div class="section" *ngIf="recentDeliveries.length > 0">
        <div class="section-header">
          <h2>Dernières missions</h2>
          <a routerLink="/deliveries" class="see-all">Tout voir →</a>
        </div>
        <div class="delivery-list">
          <div class="delivery-card" *ngFor="let d of recentDeliveries">
            <div class="delivery-top">
              <span class="category">{{ getCategoryLabel(d.itemCategory) }}</span>
              <span class="status-badge" [class]="'status-' + d.status.toLowerCase()">{{ getStatusLabel(d.status) }}</span>
            </div>
            <div class="delivery-route">
              <span>📍 {{ d.pickupAddress }}</span>
              <span class="arrow">→</span>
              <span>🎯 {{ d.deliveryAddress }}</span>
            </div>
            <div class="delivery-bottom">
              <span class="price">{{ d.estimatedPrice | number:'1.2-2' }} €</span>
              <a [routerLink]="['/deliveries', d.id]" class="btn-sm">Détails</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { max-width: 1100px; margin: 0 auto; padding: 32px 24px; }
    .hero { background: linear-gradient(135deg, #1e2140 0%, #2d3166 100%); border-radius: 20px; padding: 40px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; color: white; }
    .hero h1 { font-size: 2rem; margin: 0 0 8px; }
    .subtitle { color: rgba(255,255,255,0.75); margin: 0 0 24px; font-size: 1.05rem; }
    .hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }
    .btn-primary { background: #ff2d78; color: white; padding: 12px 24px; border-radius: 10px; font-weight: 700; text-decoration: none; font-size: 0.95rem; display: inline-block; }
    .btn-secondary { background: rgba(255,255,255,0.1); color: white; padding: 12px 24px; border-radius: 10px; font-weight: 600; text-decoration: none; font-size: 0.95rem; border: 1px solid rgba(255,255,255,0.3); }
    .hero-art { font-size: 5rem; }
    .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 28px; }
    .stat-card { background: white; border-radius: 14px; padding: 20px; text-align: center; box-shadow: 0 2px 12px rgba(0,0,0,0.07); }
    .stat-icon { font-size: 1.8rem; margin-bottom: 8px; }
    .stat-value { font-size: 1.6rem; font-weight: 800; color: #1e2140; }
    .stat-label { font-size: 0.8rem; color: #888; margin-top: 4px; }
    .section { background: white; border-radius: 16px; padding: 28px; margin-bottom: 24px; box-shadow: 0 2px 12px rgba(0,0,0,0.07); }
    .section h2 { font-size: 1.2rem; color: #1e2140; margin: 0 0 20px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .section-header h2 { margin: 0; }
    .see-all { color: #ff2d78; text-decoration: none; font-weight: 600; font-size: 0.9rem; }
    .steps { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .step { display: flex; align-items: center; gap: 12px; background: #f8f9ff; border-radius: 12px; padding: 16px 20px; flex: 1; min-width: 160px; }
    .step-num { background: #ff2d78; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700; flex-shrink: 0; }
    .step-icon { font-size: 1.4rem; }
    .step-text { display: flex; flex-direction: column; gap: 2px; }
    .step-text strong { font-size: 0.88rem; color: #1e2140; }
    .step-text small { font-size: 0.75rem; color: #888; }
    .step-arrow { color: #ccc; font-size: 1.2rem; flex-shrink: 0; }
    .delivery-list { display: flex; flex-direction: column; gap: 12px; }
    .delivery-card { border: 1px solid #eee; border-radius: 12px; padding: 16px; }
    .delivery-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .category { font-size: 0.8rem; background: #f0f0f0; color: #555; padding: 3px 10px; border-radius: 20px; }
    .status-badge { font-size: 0.78rem; padding: 3px 10px; border-radius: 20px; font-weight: 600; }
    .status-pending { background: #fff8e1; color: #f57c00; }
    .status-accepted { background: #e3f2fd; color: #1565c0; }
    .status-completed { background: #e8f5e9; color: #2e7d32; }
    .delivery-route { display: flex; gap: 8px; align-items: center; font-size: 0.88rem; color: #555; margin-bottom: 10px; flex-wrap: wrap; }
    .arrow { color: #ccc; }
    .delivery-bottom { display: flex; justify-content: space-between; align-items: center; }
    .price { font-weight: 700; color: #ff2d78; }
    .btn-sm { background: #ff2d78; color: white; padding: 6px 14px; border-radius: 8px; font-size: 0.82rem; text-decoration: none; font-weight: 600; }
  `]
})
export class DashboardComponent implements OnInit {
  user: AuthResponse | null = null;
  profile: User | null = null;
  recentDeliveries: Delivery[] = [];
  totalDeliveries = 0;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private deliveryService: DeliveryService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.user = this.authService.currentUser;
    this.loadProfile();
    this.loadDeliveries();
  }

  loadProfile(): void {
    this.userService.getProfile().subscribe({
      next: (u: User) => {
        this.profile = u;
        this.authService.updateCurrentUser({
          points: u.points,
          balance: u.balance,
          rating: u.rating,
          role: u.role
        });
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  loadDeliveries(): void {
    const obs$ = this.user?.role === 'SENDER'
      ? this.deliveryService.getMySent()
      : this.deliveryService.getMyAccepted();

    obs$.subscribe({
      next: deliveries => {
        this.recentDeliveries = deliveries.slice(0, 3);
        this.totalDeliveries = deliveries.length;
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  getCategoryLabel(cat: string): string {
    const map: Record<string, string> = {
      FLOWER: '🌸 Fleur', DOCUMENT: '📄 Document', PARCEL: '📦 Colis', CAKE: '🎂 Gâteau',
      GROCERY: '🛒 Courses', GIFT: '🎁 Cadeau', KEY: '🔑 Clé', PHARMACY: '💊 Pharmacie',
      RESTAURANT: '🍽️ Restaurant', OTHER: '📋 Autre'
    };
    return map[cat] ?? cat;
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'En attente', ACCEPTED: 'Acceptée', IN_PROGRESS: 'En cours',
      DELIVERED: 'Livré', CONFIRMED: 'Confirmé', COMPLETED: 'Terminé', CANCELLED: 'Annulé'
    };
    return map[status] ?? status;
  }
}
