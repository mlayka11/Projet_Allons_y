// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(this.loadUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  register(req: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, req).pipe(
      tap(res => this.saveUser(res))
    );
  }

  login(req: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, req).pipe(
      tap(res => this.saveUser(res))
    );
  }

  logout(): void {
    localStorage.removeItem('allonsy_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return this.currentUserSubject.value?.token ?? null;
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  get currentUser(): AuthResponse | null {
    return this.currentUserSubject.value;
  }

  updateCurrentUser(partial: Partial<AuthResponse>): void {
    const user = { ...this.currentUserSubject.value!, ...partial };
    this.saveUser(user);
  }

  private saveUser(user: AuthResponse): void {
    localStorage.setItem('allonsy_user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private loadUser(): AuthResponse | null {
    const raw = localStorage.getItem('allonsy_user');
    return raw ? JSON.parse(raw) : null;
  }
}
