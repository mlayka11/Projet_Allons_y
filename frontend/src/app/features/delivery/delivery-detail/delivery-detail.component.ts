import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DeliveryService } from '../../../core/services/delivery.service';
import { AuthService } from '../../../core/services/auth.service';
import { Delivery } from '../../../core/models/delivery.model';

@Component({
  selector: 'app-delivery-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page">
      <button class="btn-back" (click)="goBack()">← Retour</button>

      <div class="loading" *ngIf="loading"><div class="spinner"></div></div>

      <ng-container *ngIf="!loading && delivery">
        <div class="detail-header">
          <div class="header-left">
            <span class="category">{{ getCategoryLabel(delivery.itemCategory) }}</span>
            <h1>Livraison #{{ delivery.id }}</h1>
            <span class="status-badge" [class]="'status-' + delivery.status.toLowerCase()">
              {{ getStatusLabel(delivery.status) }}
            </span>
          </div>
          <div class="price-box">
            <div class="price-val">{{ delivery.estimatedPrice | number:'1.2-2' }} €</div>
            <div class="price-sub" *ngIf="isDeliverer">Gain: {{ delivery.delivererEarning | number:'1.2-2' }} €</div>
          </div>
        </div>

        <div class="stepper">
          <div class="step" [class.done]="isStepDone(0)" [class.active]="isStepActive(0)">
            <div class="step-circle">{{ isStepDone(0) ? '✓' : '1' }}</div>
            <span>Posté</span>
          </div>
          <div class="step-line" [class.done]="isStepDone(0)"></div>
          <div class="step" [class.done]="isStepDone(1)" [class.active]="isStepActive(1)">
            <div class="step-circle">{{ isStepDone(1) ? '✓' : '2' }}</div>
            <span>Accepté</span>
          </div>
          <div class="step-line" [class.done]="isStepDone(1)"></div>
          <div class="step" [class.done]="isStepDone(2)" [class.active]="isStepActive(2)">
            <div class="step-circle">{{ isStepDone(2) ? '✓' : '3' }}</div>
            <span>Livré</span>
          </div>
          <div class="step-line" [class.done]="isStepDone(2)"></div>
          <div class="step" [class.done]="isStepDone(3)" [class.active]="isStepActive(3)">
            <div class="step-circle">{{ isStepDone(3) ? '✓' : '4' }}</div>
            <span>Terminé</span>
          </div>
        </div>

        <div class="cards-row">
          <div class="detail-card">
            <h3>📍 Trajet</h3>
            <div class="addr"><span class="dot green"></span><div><small>Départ</small><strong>{{ delivery.pickupAddress }}</strong></div></div>
            <div class="route-line"></div>
            <div class="addr"><span class="dot red"></span><div><small>Destination</small><strong>{{ delivery.deliveryAddress }}</strong></div></div>
          </div>

          <div class="detail-card">
            <h3>📦 Article</h3>
            <p class="item-desc">{{ delivery.itemDescription }}</p>
            <div class="detail-row"><span>Points</span><strong>+{{ delivery.pointsAwarded }} ⭐</strong></div>
          </div>

          <div class="detail-card">
            <h3>👥 Personnes</h3>
            <div class="detail-row"><span>Expéditeur</span><strong>{{ delivery.senderName }}</strong></div>
            <div class="detail-row" *ngIf="delivery.delivererName"><span>Livreur</span><strong>{{ delivery.delivererName }}</strong></div>
            <div class="detail-row" *ngIf="isSender && delivery.status === 'PENDING' || isSender && delivery.status === 'ACCEPTED' || isSender && delivery.status === 'DELIVERED'">
              <span>Code réception</span>
              <strong class="code">{{ delivery.confirmationCode }}</strong>
            </div>
          </div>
        </div>

        <div class="actions-card" *ngIf="showActions">
          <h3>Actions disponibles</h3>
          <div class="error-msg" *ngIf="actionError">{{ actionError }}</div>

          <div *ngIf="isDeliverer && delivery.status === 'ACCEPTED'">
            <p>Vous avez récupéré l'article ? Marquez-le comme livré.</p>
            <button class="btn-action" (click)="markDelivered()" [disabled]="acting">
              {{ acting ? '...' : '🛵 Marquer comme livré' }}
            </button>
          </div>

          <div *ngIf="isSender && delivery.status === 'DELIVERED'" class="confirm-section">
            <p>Entrez le code de confirmation pour libérer le paiement.</p>
            <div class="code-display">Votre code : <span class="code">{{ delivery.confirmationCode }}</span></div>
            <form [formGroup]="confirmForm" (ngSubmit)="confirmReceipt()">
              <div class="code-input-row">
                <input type="text" formControlName="code" placeholder="Code à 6 caractères" maxlength="6"/>
                <button type="submit" class="btn-action" [disabled]="acting">
                  {{ acting ? '...' : '✅ Confirmer' }}
                </button>
              </div>
            </form>
          </div>

          <div *ngIf="isSender && delivery.status === 'COMPLETED' && !delivery.rating">
            <p>Mission terminée ! Notez votre livreur.</p>
            <form [formGroup]="ratingForm" (ngSubmit)="submitRating()">
              <div class="star-row">
                <button type="button" class="star" *ngFor="let s of [1,2,3,4,5]"
                        [class.filled]="ratingForm.get('rating')?.value >= s"
                        (click)="ratingForm.get('rating')?.setValue(s)">★</button>
              </div>
              <textarea formControlName="comment" rows="2" placeholder="Commentaire (optionnel)"></textarea>
              <button type="submit" class="btn-action" [disabled]="acting || !ratingForm.get('rating')?.value">
                {{ acting ? '...' : '⭐ Soumettre la note' }}
              </button>
            </form>
          </div>

          <div *ngIf="delivery.rating" class="rating-display">
            <p>Note donnée :</p>
            <div class="star-row">
              <span *ngFor="let s of [1,2,3,4,5]" class="star" [class.filled]="delivery.rating >= s">★</span>
            </div>
            <p *ngIf="delivery.ratingComment">"{{ delivery.ratingComment }}"</p>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .page { max-width: 900px; margin: 0 auto; padding: 32px 24px; }
    .btn-back { background: none; border: none; color: #ff2d78; font-size: 1rem; cursor: pointer; font-weight: 600; margin-bottom: 20px; display: block; }
    .loading { text-align: center; padding: 60px; }
    .spinner { width: 40px; height: 40px; border: 4px solid #eee; border-top-color: #ff2d78; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .detail-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
    .header-left h1 { font-size: 1.6rem; color: #1e2140; margin: 8px 0; }
    .category { font-size: 0.85rem; background: #f0f0f0; color: #555; padding: 4px 12px; border-radius: 20px; }
    .status-badge { font-size: 0.85rem; padding: 4px 12px; border-radius: 20px; font-weight: 600; display: inline-block; margin-top: 4px; }
    .status-pending { background: #fff8e1; color: #f57c00; }
    .status-accepted { background: #e3f2fd; color: #1565c0; }
    .status-delivered { background: #f3e5f5; color: #6a1b9a; }
    .status-completed { background: #e8f5e9; color: #2e7d32; }
    .status-cancelled { background: #fce4ec; color: #c62828; }
    .price-box { text-align: right; }
    .price-val { font-size: 2rem; font-weight: 900; color: #ff2d78; }
    .price-sub { font-size: 0.85rem; color: #888; }
    .stepper { display: flex; align-items: center; background: white; border-radius: 16px; padding: 20px 28px; margin-bottom: 24px; box-shadow: 0 2px 12px rgba(0,0,0,0.07); }
    .step { display: flex; flex-direction: column; align-items: center; gap: 6px; }
    .step-circle { width: 32px; height: 32px; border-radius: 50%; background: #eee; color: #aaa; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 700; }
    .step.done .step-circle { background: #ff2d78; color: white; }
    .step.active .step-circle { background: #fff; border: 2px solid #ff2d78; color: #ff2d78; }
    .step span { font-size: 0.75rem; color: #aaa; }
    .step.done span, .step.active span { color: #1e2140; font-weight: 600; }
    .step-line { flex: 1; height: 2px; background: #eee; margin: 0 8px 20px; }
    .step-line.done { background: #ff2d78; }
    .cards-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 20px; }
    .detail-card { background: white; border-radius: 16px; padding: 20px; box-shadow: 0 2px 12px rgba(0,0,0,0.07); }
    .detail-card h3 { margin: 0 0 16px; color: #1e2140; font-size: 1rem; }
    .addr { display: flex; gap: 12px; align-items: flex-start; padding: 8px 0; }
    .dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
    .dot.green { background: #4caf50; }
    .dot.red { background: #f44336; }
    .addr div { display: flex; flex-direction: column; }
    .addr small { font-size: 0.75rem; color: #aaa; }
    .addr strong { font-size: 0.9rem; color: #333; }
    .route-line { width: 2px; height: 16px; background: #eee; margin-left: 5px; }
    .item-desc { color: #666; font-style: italic; font-size: 0.9rem; margin-bottom: 12px; }
    .detail-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 0.88rem; color: #555; border-top: 1px solid #f5f5f5; }
    .code { background: #fff0f5; color: #ff2d78; padding: 3px 10px; border-radius: 6px; font-family: monospace; font-size: 1rem; font-weight: 700; letter-spacing: 2px; }
    .actions-card { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 2px 12px rgba(0,0,0,0.07); }
    .actions-card h3 { margin: 0 0 16px; color: #1e2140; }
    .actions-card p { color: #666; margin-bottom: 16px; }
    .btn-action { background: #ff2d78; color: white; border: none; padding: 12px 24px; border-radius: 10px; font-size: 0.95rem; font-weight: 700; cursor: pointer; }
    .btn-action:disabled { opacity: 0.6; cursor: not-allowed; }
    .error-msg { background: #fff0f5; color: #ff2d78; padding: 10px; border-radius: 8px; margin-bottom: 12px; }
    .code-display { background: #f8f9ff; padding: 12px 16px; border-radius: 10px; margin-bottom: 16px; }
    .code-input-row { display: flex; gap: 12px; align-items: center; }
    .code-input-row input { padding: 10px 14px; border: 2px solid #e0e0e0; border-radius: 10px; font-size: 1rem; outline: none; }
    .star-row { display: flex; gap: 6px; margin-bottom: 12px; }
    .star { font-size: 1.8rem; color: #ddd; background: none; border: none; cursor: pointer; padding: 0; }
    .star.filled { color: #f5c400; }
    textarea { width: 100%; padding: 10px 14px; border: 2px solid #e0e0e0; border-radius: 10px; font-size: 0.9rem; outline: none; font-family: inherit; resize: vertical; box-sizing: border-box; margin-bottom: 12px; }
    .rating-display { text-align: center; padding: 16px; }
  `]
})
export class DeliveryDetailComponent implements OnInit {
  delivery: Delivery | null = null;
  loading = true;
  acting = false;
  actionError = '';
  confirmForm: FormGroup;
  ratingForm: FormGroup;
  currentUserId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private deliveryService: DeliveryService,
    private authService: AuthService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.confirmForm = this.fb.group({ code: ['', Validators.required] });
    this.ratingForm = this.fb.group({
      rating: [null, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['']
    });
    this.currentUserId = this.authService.currentUser?.id ?? null;
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.deliveryService.getById(id).subscribe({
      next: d => {
        this.delivery = d;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
        this.router.navigate(['/deliveries']);
      }
    });
  }

  get isSender(): boolean { return this.delivery?.senderId === this.currentUserId; }
  get isDeliverer(): boolean { return this.delivery?.delivererId === this.currentUserId; }

  get showActions(): boolean {
    if (!this.delivery) return false;
    const s = this.delivery.status;
    if (this.isDeliverer && s === 'ACCEPTED') return true;
    if (this.isSender && (s === 'DELIVERED' || s === 'COMPLETED')) return true;
    return false;
  }

  markDelivered(): void {
    this.acting = true;
    this.deliveryService.markDelivered(this.delivery!.id).subscribe({
      next: d => { this.delivery = d; this.acting = false; this.cdr.detectChanges(); },
      error: err => { this.actionError = err.error?.message || 'Erreur'; this.acting = false; }
    });
  }

  confirmReceipt(): void {
    if (this.confirmForm.invalid) return;
    this.acting = true;
    this.actionError = '';
    this.deliveryService.confirmReceipt(this.delivery!.id, this.confirmForm.value.code).subscribe({
      next: d => { this.delivery = d; this.acting = false; this.cdr.detectChanges(); },
      error: err => { this.actionError = err.error?.message || 'Code incorrect'; this.acting = false; }
    });
  }

  submitRating(): void {
    if (this.ratingForm.invalid) return;
    this.acting = true;
    this.deliveryService.rateDelivery(this.delivery!.id, this.ratingForm.value).subscribe({
      next: d => { this.delivery = d; this.acting = false; this.cdr.detectChanges(); },
      error: err => { this.actionError = err.error?.message || 'Erreur'; this.acting = false; }
    });
  }

  isStepDone(step: number): boolean {
    const order = ['PENDING', 'ACCEPTED', 'DELIVERED', 'COMPLETED'];
    return order.indexOf(this.delivery?.status ?? 'PENDING') > step;
  }

  isStepActive(step: number): boolean {
    const order = ['PENDING', 'ACCEPTED', 'DELIVERED', 'COMPLETED'];
    return order.indexOf(this.delivery?.status ?? 'PENDING') === step;
  }

  getCategoryLabel(cat: string): string {
    const map: Record<string, string> = {
      FLOWER: '🌸 Fleur', DOCUMENT: '📄 Document', PARCEL: '📦 Colis', CAKE: '🎂 Gâteau',
      GROCERY: '🛒 Courses', GIFT: '🎁 Cadeau', KEY: '🔑 Clé', PHARMACY: '💊 Pharmacie',
      RESTAURANT: '🍽️ Restaurant', BAKERY: '🥖 Boulangerie', OTHER: '📋 Autre'
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

  goBack(): void { this.router.navigate(['/deliveries']); }
}
