import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { User, UserRole } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <h1>Mon profil</h1>
      <div class="profile-hero">
        <div class="avatar">{{ initials }}</div>
        <div class="profile-info">
          <h2>{{ fullName }}</h2>
          <p class="email">{{ email }}</p>
          <span class="role-badge" [class.deliverer]="role === 'DELIVERER'">
            {{ role === 'SENDER' ? '📤 Expéditeur' : '🛵 Livreur' }}
          </span>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card accent-pink">
          <div class="stat-icon">⭐</div>
          <div class="stat-val">{{ points }}</div>
          <div class="stat-lbl">Points</div>
        </div>
        <div class="stat-card accent-gold">
          <div class="stat-icon">💶</div>
          <div class="stat-val">{{ balance | number:'1.2-2' }} €</div>
          <div class="stat-lbl">Solde</div>
        </div>
      </div>

      <div class="section-card">
        <h3>🔄 Changer de rôle</h3>
        <div class="role-switch">
          <div class="role-opt" [class.active]="role === 'SENDER'" (click)="switchRole('SENDER')">
            <span class="r-icon">📤</span>
            <strong>Expéditeur</strong>
          </div>
          <div class="switch-arrow">⇄</div>
          <div class="role-opt" [class.active]="role === 'DELIVERER'" (click)="switchRole('DELIVERER')">
            <span class="r-icon">🛵</span>
            <strong>Livreur</strong>
          </div>
        </div>
        <p class="switch-note" *ngIf="switchMsg">{{ switchMsg }}</p>
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 800px; margin: 0 auto; padding: 32px 24px; }
    h1 { font-size: 1.6rem; color: #1e2140; margin-bottom: 24px; }
    .profile-hero { background: linear-gradient(135deg, #1e2140, #2d3166); border-radius: 20px; padding: 32px; display: flex; gap: 24px; align-items: center; color: white; margin-bottom: 24px; }
    .avatar { width: 80px; height: 80px; border-radius: 50%; background: #ff2d78; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; font-weight: 800; color: white; flex-shrink: 0; }
    .profile-info h2 { margin: 0 0 6px; font-size: 1.4rem; }
    .email { color: rgba(255,255,255,0.7); margin: 0 0 12px; font-size: 0.9rem; }
    .role-badge { background: #ff2d78; color: white; padding: 4px 14px; border-radius: 20px; font-size: 0.82rem; font-weight: 700; }
    .role-badge.deliverer { background: #f5c400; color: #1e2140; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .stat-card { background: white; border-radius: 14px; padding: 20px; text-align: center; box-shadow: 0 2px 12px rgba(0,0,0,0.07); border-top: 4px solid #eee; }
    .stat-card.accent-pink { border-top-color: #ff2d78; }
    .stat-card.accent-gold { border-top-color: #f5c400; }
    .stat-icon { font-size: 1.6rem; margin-bottom: 8px; }
    .stat-val { font-size: 1.5rem; font-weight: 800; color: #1e2140; }
    .stat-lbl { font-size: 0.78rem; color: #888; margin-top: 4px; }
    .section-card { background: white; border-radius: 16px; padding: 24px; margin-bottom: 20px; box-shadow: 0 2px 12px rgba(0,0,0,0.07); }
    .section-card h3 { margin: 0 0 20px; color: #1e2140; }
    .role-switch { display: flex; align-items: center; gap: 16px; justify-content: center; }
    .role-opt { flex: 1; border: 2px solid #eee; border-radius: 14px; padding: 20px; cursor: pointer; text-align: center; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; gap: 6px; }
    .role-opt:hover { border-color: #ff2d78; }
    .role-opt.active { border-color: #ff2d78; background: #fff0f5; }
    .r-icon { font-size: 2rem; }
    .role-opt strong { font-size: 1rem; color: #1e2140; }
    .switch-arrow { font-size: 1.5rem; color: #ccc; flex-shrink: 0; }
    .switch-note { text-align: center; color: #4caf50; font-size: 0.88rem; margin-top: 12px; }
  `]
})
export class ProfileComponent implements OnInit {
  fullName = '';
  initials = '';
  email = '';
  role: UserRole = 'SENDER';
  points = 0;
  balance = 0;
  rating = 0;
  switchMsg = '';

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userService.getProfile().subscribe({
      next: (u: User) => {
        this.fullName = u.firstName + ' ' + u.lastName;
        this.initials = u.firstName[0] + u.lastName[0];
        this.email = u.email;
        this.role = u.role;
        this.points = u.points;
        this.balance = u.balance;
        this.rating = u.rating;
        this.cdr.detectChanges();
      },
      error: (e) => console.error('Erreur profil', e)
    });
  }

  switchRole(role: UserRole): void {
    if (this.role === role) return;
    this.userService.switchRole(role).subscribe({
      next: (u: User) => {
        this.role = u.role;
        this.switchMsg = `Rôle changé : ${role === 'SENDER' ? 'Expéditeur' : 'Livreur'} !`;
        this.cdr.detectChanges();
        setTimeout(() => { this.switchMsg = ''; this.cdr.detectChanges(); }, 3000);
      }
    });
  }
}
