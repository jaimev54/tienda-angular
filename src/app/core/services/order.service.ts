import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, DashboardStats, PaginatedResult } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;
  constructor(private http: HttpClient) {}
  getMyOrders(): Observable<Order[]> { return this.http.get<Order[]>(`${this.apiUrl}/my`); }
  getOrder(id: number): Observable<Order> { return this.http.get<Order>(`${this.apiUrl}/${id}`); }
  getAllOrders(page = 1, pageSize = 10): Observable<PaginatedResult<Order>> {
    return this.http.get<PaginatedResult<Order>>(this.apiUrl, { params: { page, pageSize } });
  }
  updateOrderStatus(id: number, status: Order['status']): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${id}/status`, { status });
  }
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${environment.apiUrl}/admin/stats`);
  }
}
