import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, Category, ProductFilter, PaginatedResult, ApiResponse } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;
  constructor(private http: HttpClient) {}

  getProducts(filter?: ProductFilter): Observable<PaginatedResult<Product>> {
    let params = new HttpParams();
    if (filter?.search) params = params.set('search', filter.search);
    if (filter?.categoryId) params = params.set('categoryId', filter.categoryId.toString());
    if (filter?.sortBy) params = params.set('sortBy', filter.sortBy);
    if (filter?.page) params = params.set('page', filter.page.toString());
    if (filter?.pageSize) params = params.set('pageSize', filter.pageSize.toString());
    return this.http.get<PaginatedResult<Product>>(this.apiUrl, { params });
  }

  getProduct(id: number): Observable<Product> { return this.http.get<Product>(`${this.apiUrl}/${id}`); }
  getCategories(): Observable<Category[]> { return this.http.get<Category[]>(`${environment.apiUrl}/categories`); }
  createProduct(p: Partial<Product>): Observable<Product> { return this.http.post<Product>(this.apiUrl, p); }
  updateProduct(id: number, p: Partial<Product>): Observable<Product> { return this.http.put<Product>(`${this.apiUrl}/${id}`, p); }
  deleteProduct(id: number): Observable<ApiResponse<void>> { return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`); }
}
