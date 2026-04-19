// src/app/features/auth/register/register.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <img src="/logos/Logo-full description.png" alt="Allons-Y" class="brand-logo"/>
          <p>Créez votre compte et rejoignez la communauté !</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="row">
            <div class="field">
              <label>Prénom</label>
              <input type="text" formControlName="firstName" placeholder="Marie"/>
            </div>
            <div class="field">
              <label>Nom</label>
              <input type="text" formControlName="lastName" placeholder="Dupont"/>
            </div>
          </div>

          <div class="field">
            <label>Email</label>
            <input type="email" formControlName="email" placeholder="marie@email.com"/>
            <span class="error" *ngIf="form.get('email')?.invalid && form.get('email')?.touched">Email invalide</span>
          </div>

          <div class="field">
            <label>Téléphone</label>
            <input type="tel" formControlName="phone" placeholder="+33 6 12 34 56 78"/>
          </div>

          <div class="field">
            <label>Mot de passe</label>
            <input type="password" formControlName="password" placeholder="••••••"/>
            <span class="error" *ngIf="form.get('password')?.invalid && form.get('password')?.touched">Minimum 6 caractères</span>
          </div>

          <div class="field">
            <label>Je veux d'abord...</label>
            <div class="role-selector">
              <div class="role-option" [class.selected]="form.get('role')?.value === 'SENDER'"
                   (click)="form.get('role')?.setValue('SENDER')">
                <span class="role-icon">📤</span>
                <strong>Envoyer</strong>
                <small>Je veux faire livrer des articles</small>
              </div>
              <div class="role-option" [class.selected]="form.get('role')?.value === 'DELIVERER'"
                   (click)="form.get('role')?.setValue('DELIVERER')">
                <span class="role-icon">🛵</span>
                <strong>Livrer</strong>
                <small>Je veux gagner de l'argent en livrant</small>
              </div>
            </div>
          </div>

          <div class="error-msg" *ngIf="errorMsg">{{ errorMsg }}</div>

          <div class="terms-check">
            <label class="terms-label">
              <input type="checkbox" formControlName="termsAccepted"/>
              <span>
                J'accepte
                <button type="button" class="terms-link" (click)="openRules($event)">le règlement et les conditions d'utilisation</button>
                .
              </span>
            </label>
            <span class="error" *ngIf="form.get('termsAccepted')?.invalid && form.get('termsAccepted')?.touched">
              Vous devez accepter le règlement pour créer un compte.
            </span>
          </div>

          <button type="submit" class="btn-primary" [disabled]="loading">
            {{ loading ? 'Création...' : 'Créer mon compte' }}
          </button>
        </form>

        <p class="redirect">
          Déjà un compte ? <a routerLink="/auth/login">Se connecter</a>
        </p>
      </div>

      <div class="rules-modal" *ngIf="showRules" (click)="closeRules()">
        <div class="rules-card" (click)="$event.stopPropagation()">
          <h2>Règlement et conditions d'utilisation</h2>
          <p>En créant un compte, vous confirmez :</p>
          <ul>
            <li>fournir des informations exactes et à jour ;</li>
            <li>respecter les autres utilisateurs et la loi en vigueur ;</li>
            <li>ne pas utiliser la plateforme pour des activités frauduleuses ;</li>
            <li>accepter que le non-respect des règles peut entraîner la suspension du compte.</li>
          </ul>
          <button type="button" class="btn-primary" (click)="closeRules()">Fermer</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #1e2140 0%, #2d3166 100%); padding: 24px;
    }
    .auth-card {
      background: white; border-radius: 20px; padding: 40px;
      width: 100%; max-width: 480px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .auth-header { text-align: center; margin-bottom: 28px; }
    .brand-logo { width: min(200px, 100%); height: auto; margin: 0 auto 8px; display: block; }
    .auth-header p { color: #666; margin-top: 8px; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .field { margin-bottom: 16px; }
    label { display: block; font-weight: 600; color: #1e2140; margin-bottom: 6px; font-size: 0.85rem; }
    input {
      width: 100%; padding: 11px 14px; border: 2px solid #e0e0e0;
      border-radius: 10px; font-size: 0.95rem; outline: none; transition: border-color 0.2s; box-sizing: border-box;
    }
    input:focus { border-color: #ff2d78; }
    .error { color: #ff2d78; font-size: 0.78rem; margin-top: 3px; display: block; }
    .error-msg { background: #fff0f5; color: #ff2d78; padding: 10px; border-radius: 8px; margin-bottom: 12px; font-size: 0.88rem; }
    .terms-check { margin-bottom: 10px; }
    .terms-label {
      display: flex; align-items: flex-start; gap: 10px;
      font-weight: 500; color: #444; font-size: 0.86rem; line-height: 1.35;
      cursor: pointer;
    }
    .terms-label input { width: auto; margin-top: 2px; accent-color: #ff2d78; }
    .terms-link {
      background: none; border: none; padding: 0;
      color: #ff2d78; text-decoration: underline; font-weight: 700;
      cursor: pointer; font: inherit;
    }
    .terms-link:hover { color: #e0256a; }
    .role-selector { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .role-option {
      border: 2px solid #e0e0e0; border-radius: 12px; padding: 16px 12px;
      cursor: pointer; text-align: center; transition: all 0.2s; display: flex; flex-direction: column; gap: 4px;
    }
    .role-option:hover { border-color: #ff2d78; }
    .role-option.selected { border-color: #ff2d78; background: #fff0f5; }
    .role-icon { font-size: 1.8rem; }
    .role-option strong { color: #1e2140; font-size: 0.95rem; }
    .role-option small { color: #888; font-size: 0.78rem; }
    .btn-primary {
      width: 100%; padding: 14px; background: #ff2d78; color: white;
      border: none; border-radius: 10px; font-size: 1rem; font-weight: 700;
      cursor: pointer; transition: background 0.2s; margin-top: 8px;
    }
    .btn-primary:hover:not(:disabled) { background: #e0256a; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .redirect { text-align: center; margin-top: 16px; color: #666; font-size: 0.88rem; }
    .redirect a { color: #ff2d78; font-weight: 600; text-decoration: none; }
    .rules-modal {
      position: fixed; inset: 0; background: rgba(0, 0, 0, 0.55);
      display: flex; align-items: center; justify-content: center; padding: 20px; z-index: 1000;
    }
    .rules-card {
      width: 100%; max-width: 560px; max-height: 80vh; overflow: auto;
      background: #fff; border-radius: 14px; padding: 24px;
      box-shadow: 0 24px 60px rgba(0,0,0,0.35);
    }
    .rules-card h2 { margin: 0 0 12px; color: #1e2140; }
    .rules-card p { margin: 0 0 8px; color: #444; }
    .rules-card ul { margin: 0 0 16px 18px; color: #444; display: grid; gap: 6px; }
  `]
})
export class RegisterComponent {
  form: FormGroup;
  loading = false;
  errorMsg = '';
  showRules = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['SENDER'],
      termsAccepted: [false, Validators.requiredTrue]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.errorMsg = '';
    const { termsAccepted, ...registerPayload } = this.form.value;
    this.authService.register(registerPayload).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.errorMsg = err.error?.message || 'Erreur lors de l\'inscription';
        this.loading = false;
      }
    });
  }

  openRules(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.showRules = true;
  }

  closeRules(): void {
    this.showRules = false;
  }
}
