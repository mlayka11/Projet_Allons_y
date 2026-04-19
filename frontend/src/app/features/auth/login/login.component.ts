// src/app/features/auth/login/login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <h1 class="brand">ALLONS-Y!</h1>
          <p>Bienvenue ! Connectez-vous pour continuer.</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="field">
            <label>Email</label>
            <input type="email" formControlName="email" placeholder="votre@email.com"/>
            <span class="error" *ngIf="form.get('email')?.invalid && form.get('email')?.touched">
              Email invalide
            </span>
          </div>

          <div class="field">
            <label>Mot de passe</label>
            <input type="password" formControlName="password" placeholder="••••••"/>
            <span class="error" *ngIf="form.get('password')?.invalid && form.get('password')?.touched">
              Minimum 6 caractères
            </span>
          </div>

          <div class="error-msg" *ngIf="errorMsg">{{ errorMsg }}</div>

          <button type="submit" class="btn-primary" [disabled]="loading">
            {{ loading ? 'Connexion...' : 'Se connecter' }}
          </button>
        </form>

        <p class="redirect">
          Pas encore de compte ? <a routerLink="/auth/register">S'inscrire</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1e2140 0%, #2d3166 100%);
    }
    .auth-card {
      background: white;
      border-radius: 20px;
      padding: 40px;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .auth-header { text-align: center; margin-bottom: 32px; }
    .brand { font-size: 2rem; font-weight: 900; color: #ff2d78; letter-spacing: 2px; margin: 0; }
    .auth-header p { color: #666; margin-top: 8px; }
    .field { margin-bottom: 20px; }
    label { display: block; font-weight: 600; color: #1e2140; margin-bottom: 6px; font-size: 0.9rem; }
    input {
      width: 100%; padding: 12px 16px; border: 2px solid #e0e0e0;
      border-radius: 10px; font-size: 1rem; outline: none;
      transition: border-color 0.2s; box-sizing: border-box;
    }
    input:focus { border-color: #ff2d78; }
    .error { color: #ff2d78; font-size: 0.8rem; margin-top: 4px; display: block; }
    .error-msg { background: #fff0f5; color: #ff2d78; padding: 10px; border-radius: 8px; margin-bottom: 16px; font-size: 0.9rem; }
    .btn-primary {
      width: 100%; padding: 14px; background: #ff2d78; color: white;
      border: none; border-radius: 10px; font-size: 1rem; font-weight: 700;
      cursor: pointer; transition: background 0.2s;
    }
    .btn-primary:hover:not(:disabled) { background: #e0256a; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .redirect { text-align: center; margin-top: 20px; color: #666; font-size: 0.9rem; }
    .redirect a { color: #ff2d78; font-weight: 600; text-decoration: none; }
  `]
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  errorMsg = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.errorMsg = '';
    this.authService.login(this.form.value).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.errorMsg = err.error?.message || 'Identifiants incorrects';
        this.loading = false;
      }
    });
  }
}
