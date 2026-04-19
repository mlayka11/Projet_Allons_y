// src/app/shared/components/navbar/navbar.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AuthResponse } from '../../../core/models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="navbar-brand" routerLink="/dashboard">
        <img src="assets/logo.png" alt="Allons-Y" class="logo" onerror="this.style.display='none'"/>
        <span class="brand-name">ALLONS-Y!</span>
      </div>

      <div class="navbar-links" *ngIf="user">
        <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">
          🏠 Dashboard
        </a>
        <a routerLink="/deliveries" routerLinkActive="active">
          📦 Missions
        </a>
        <a routerLink="/deliveries/create" routerLinkActive="active">
          ➕ Créer
        </a>
        <a routerLink="/profile" routerLinkActive="active">
          👤 Profil
        </a>
      </div>

      <div class="navbar-user" *ngIf="user">
        <span class="role-badge" [class.deliverer]="user.role === 'DELIVERER'">
          {{ user.role === 'SENDER' ? '📤 Expéditeur' : '🛵 Livreur' }}
        </span>
        <span class="points">⭐ {{ user.points }} pts</span>
        <button class="btn-logout" (click)="logout()">Déconnexion</button>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      height: 64px;
      background: #1e2140;
      color: white;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      text-decoration: none;
    }
    .logo { height: 36px; }
    .brand-name {
      font-size: 1.4rem;
      font-weight: 800;
      color: #ff2d78;
      letter-spacing: 1px;
    }
    .navbar-links {
      display: flex;
      gap: 8px;
    }
    .navbar-links a {
      color: rgba(255,255,255,0.8);
      text-decoration: none;
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 0.9rem;
      transition: all 0.2s;
    }
    .navbar-links a:hover, .navbar-links a.active {
      background: rgba(255,45,120,0.2);
      color: #ff2d78;
    }
    .navbar-user {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .role-badge {
      background: #ff2d78;
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
    }
    .role-badge.deliverer {
      background: #f5c400;
      color: #1e2140;
    }
    .points {
      font-size: 0.85rem;
      color: #f5c400;
      font-weight: 600;
    }
    .btn-logout {
      background: transparent;
      border: 1px solid rgba(255,255,255,0.3);
      color: white;
      padding: 6px 14px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.85rem;
      transition: all 0.2s;
    }
    .btn-logout:hover {
      background: rgba(255,45,120,0.2);
      border-color: #ff2d78;
    }
  `]
})
export class NavbarComponent implements OnInit {
  user: AuthResponse | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(u => this.user = u);
  }

  logout(): void {
    this.authService.logout();
  }
}
