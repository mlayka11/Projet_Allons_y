// src/app/core/services/delivery.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Delivery, DeliveryRequest, RatingRequest } from '../models/delivery.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DeliveryService {
  private apiUrl = `${environment.apiUrl}/deliveries`;

  constructor(private http: HttpClient) {}

  createDelivery(req: DeliveryRequest): Observable<Delivery> {
    return this.http.post<Delivery>(this.apiUrl, req);
  }

  getAvailable(): Observable<Delivery[]> {
    return this.http.get<Delivery[]>(`${this.apiUrl}/available`);
  }

  getMySent(): Observable<Delivery[]> {
    return this.http.get<Delivery[]>(`${this.apiUrl}/my/sent`);
  }

  getMyAccepted(): Observable<Delivery[]> {
    return this.http.get<Delivery[]>(`${this.apiUrl}/my/accepted`);
  }

  getById(id: number): Observable<Delivery> {
    return this.http.get<Delivery>(`${this.apiUrl}/${id}`);
  }

  acceptDelivery(id: number): Observable<Delivery> {
    return this.http.post<Delivery>(`${this.apiUrl}/${id}/accept`, {});
  }

  markDelivered(id: number): Observable<Delivery> {
    return this.http.post<Delivery>(`${this.apiUrl}/${id}/deliver`, {});
  }

  confirmReceipt(id: number, code: string): Observable<Delivery> {
    const params = new HttpParams().set('code', code);
    return this.http.post<Delivery>(`${this.apiUrl}/${id}/confirm`, {}, { params });
  }

  rateDelivery(id: number, req: RatingRequest): Observable<Delivery> {
    return this.http.post<Delivery>(`${this.apiUrl}/${id}/rate`, req);
  }
}
