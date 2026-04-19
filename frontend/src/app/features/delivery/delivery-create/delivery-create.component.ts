import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DeliveryService } from '../../../core/services/delivery.service';
import { MapComponent, RouteResult } from '../../../shared/components/map/map.component';

@Component({
  selector: 'app-delivery-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MapComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <button class="btn-back" (click)="goBack()">← Retour</button>
        <h1>Créer une livraison</h1>
      </div>

      <div class="form-card">
        <div class="section-title">📍 Étape 1 — Choisissez vos adresses sur la carte</div>
        <p class="section-hint">Cliquez d'abord sur le point de départ, puis sur la destination</p>
        <app-map (routeSelected)="onRouteSelected($event)"></app-map>

        <div class="section-title" style="margin-top: 28px;">📦 Étape 2 — Détails de la livraison</div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="field">
            <label>Adresse de départ</label>
            <input type="text" formControlName="pickupAddress" placeholder="Cliquez sur la carte ou saisissez manuellement"/>
            <span class="error" *ngIf="form.get('pickupAddress')?.invalid && submitted">Obligatoire</span>
          </div>

          <div class="field">
            <label>Adresse de destination</label>
            <input type="text" formControlName="deliveryAddress" placeholder="Cliquez sur la carte ou saisissez manuellement"/>
            <span class="error" *ngIf="form.get('deliveryAddress')?.invalid && submitted">Obligatoire</span>
          </div>

          <div class="section-title" style="margin-top: 8px;">Catégorie</div>
          <div class="category-grid">
            <div class="cat-option" *ngFor="let cat of categories"
                 [class.selected]="form.get('itemCategory')?.value === cat.value"
                 (click)="form.get('itemCategory')?.setValue(cat.value)">
              <span class="cat-icon">{{ cat.icon }}</span>
              <span class="cat-label">{{ cat.label }}</span>
            </div>
          </div>

          <div class="field" style="margin-top: 16px;">
            <label>Description de l'article</label>
            <textarea formControlName="itemDescription" rows="3"
                      placeholder="Ex: Bouquet de roses fragile..."></textarea>
            <span class="error" *ngIf="form.get('itemDescription')?.invalid && submitted">Obligatoire</span>
          </div>

          <div class="price-preview">
            <div class="price-row">
              <span>💶 Prix estimé</span>
              <strong>{{ estimatedPrice | number:'1.2-2' }} €</strong>
            </div>
            <div class="price-row" *ngIf="walkingDistance > 0">
              <span>🚶 Distance à pied</span>
              <strong>{{ walkingDistance | number:'1.1-1' }} km — {{ walkingDuration }}</strong>
            </div>
            <div class="price-row" *ngIf="drivingDistance > 0">
              <span>🚗 Distance voiture</span>
              <strong>{{ drivingDistance | number:'1.1-1' }} km — {{ drivingDuration }}</strong>
            </div>
            <div class="price-row">
              <span>⭐ Points offerts</span>
              <strong>+10 pts</strong>
            </div>
          </div>

          <div class="error-msg" *ngIf="errorMsg">{{ errorMsg }}</div>

          <button type="submit" class="btn-submit" [disabled]="loading">
            {{ loading ? 'Publication...' : '🚀 Publier la livraison' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 780px; margin: 0 auto; padding: 32px 24px; }
    .page-header { display: flex; align-items: center; gap: 16px; margin-bottom: 28px; }
    .page-header h1 { font-size: 1.5rem; color: #1e2140; margin: 0; }
    .btn-back { background: none; border: none; color: #ff2d78; font-size: 1rem; cursor: pointer; font-weight: 600; }
    .form-card { background: white; border-radius: 20px; padding: 32px; box-shadow: 0 2px 20px rgba(0,0,0,0.08); }
    .section-title { font-weight: 700; color: #1e2140; font-size: 1rem; margin-bottom: 8px; }
    .section-hint { font-size: 0.85rem; color: #888; margin-bottom: 16px; }
    .category-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 10px; margin-bottom: 8px; }
    .cat-option { border: 2px solid #eee; border-radius: 12px; padding: 10px 6px; cursor: pointer; text-align: center; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; gap: 4px; }
    .cat-option:hover { border-color: #ff2d78; }
    .cat-option.selected { border-color: #ff2d78; background: #fff0f5; }
    .cat-icon { font-size: 1.4rem; }
    .cat-label { font-size: 0.7rem; color: #555; }
    .field { margin-bottom: 16px; }
    label { display: block; font-weight: 600; color: #1e2140; margin-bottom: 6px; font-size: 0.88rem; }
    input, textarea { width: 100%; padding: 12px 14px; border: 2px solid #e0e0e0; border-radius: 10px; font-size: 0.95rem; outline: none; transition: border-color 0.2s; box-sizing: border-box; font-family: inherit; resize: vertical; }
    input:focus, textarea:focus { border-color: #ff2d78; }
    .error { color: #ff2d78; font-size: 0.8rem; margin-top: 4px; display: block; }
    .price-preview { background: #f8f9ff; border-radius: 12px; padding: 16px 20px; margin: 20px 0; border: 1px solid #e8eaff; }
    .price-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 0.9rem; color: #555; }
    .price-row strong { color: #1e2140; }
    .error-msg { background: #fff0f5; color: #ff2d78; padding: 10px; border-radius: 8px; margin-bottom: 16px; font-size: 0.88rem; }
    .btn-submit { width: 100%; padding: 14px; background: #ff2d78; color: white; border: none; border-radius: 12px; font-size: 1rem; font-weight: 700; cursor: pointer; }
    .btn-submit:hover:not(:disabled) { background: #e0256a; }
    .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
  `]
})
export class DeliveryCreateComponent {
  form: FormGroup;
  loading = false;
  submitted = false;
  errorMsg = '';
  estimatedPrice = 3.0;
  walkingDistance = 0;
  walkingDuration = '';
  drivingDistance = 0;
  drivingDuration = '';

  categories = [
    { value: 'FLOWER', icon: '🌸', label: 'Fleur' },
    { value: 'DOCUMENT', icon: '📄', label: 'Document' },
    { value: 'PARCEL', icon: '📦', label: 'Colis' },
    { value: 'CAKE', icon: '🎂', label: 'Gâteau' },
    { value: 'GROCERY', icon: '🛒', label: 'Courses' },
    { value: 'GIFT', icon: '🎁', label: 'Cadeau' },
    { value: 'KEY', icon: '🔑', label: 'Clé' },
    { value: 'PHARMACY', icon: '💊', label: 'Pharmacie' },
    { value: 'RESTAURANT', icon: '🍽️', label: 'Restaurant' },
    { value: 'BAKERY', icon: '🥖', label: 'Boulangerie' },
    { value: 'SUPERMARKET', icon: '🏪', label: 'Supermarché' },
    { value: 'OTHER', icon: '📋', label: 'Autre' }
  ];

  constructor(
    private fb: FormBuilder,
    private deliveryService: DeliveryService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      pickupAddress: ['', Validators.required],
      deliveryAddress: ['', Validators.required],
      itemDescription: ['', Validators.required],
      itemCategory: ['', Validators.required]
    });
  }

  onRouteSelected(result: RouteResult): void {
    this.form.patchValue({
      pickupAddress: result.pickupAddress,
      deliveryAddress: result.deliveryAddress
    });
    this.estimatedPrice = result.estimatedPrice;
    this.walkingDistance = result.walkingDistance;
    this.walkingDuration = this.formatDuration(result.walkingDuration);
    this.drivingDistance = result.drivingDistance;
    this.drivingDuration = this.formatDuration(result.drivingDuration);
    this.cdr.detectChanges();
  }

  formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    if (m < 60) return `${m} min`;
    const h = Math.floor(m / 60);
    const rem = m % 60;
    return `${h}h${rem > 0 ? rem + 'min' : ''}`;
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMsg = '';
    this.deliveryService.createDelivery(this.form.value).subscribe({
      next: (d) => this.router.navigate(['/deliveries', d.id]),
      error: (err) => {
        this.errorMsg = err.error?.message || 'Erreur lors de la création';
        this.loading = false;
      }
    });
  }

  goBack(): void { this.router.navigate(['/deliveries']); }
}