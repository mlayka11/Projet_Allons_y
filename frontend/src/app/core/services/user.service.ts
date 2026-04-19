// src/app/core/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User, UserRole } from '../models/user.model';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }

  switchRole(role: UserRole): Observable<User> {
    const params = new HttpParams().set('role', role);
    return this.http.patch<User>(`${this.apiUrl}/me/role`, {}, { params }).pipe(
      tap(user => this.authService.updateCurrentUser({ role: user.role }))
    );
  }
}
