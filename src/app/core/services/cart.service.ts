import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Cart, CartItem, Product } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CartService {
  private _cart = signal<CartItem[]>([]);
  items = this._cart.asReadonly();
  itemCount = computed(() => this._cart().reduce((a, i) => a + i.quantity, 0));
  total = computed(() => this._cart().reduce((a, i) => a + i.product.price * i.quantity, 0));

  constructor(private http: HttpClient) {}

  loadCart(): Observable<Cart> {
    return this.http.get<Cart>(`${environment.apiUrl}/cart`).pipe(tap(c => this._cart.set(c.items)));
  }

  addToCart(product: Product, quantity = 1): Observable<Cart> {
    return this.http.post<Cart>(`${environment.apiUrl}/cart/items`, { productId: product.id, quantity })
      .pipe(tap(c => this._cart.set(c.items)));
  }

  updateQuantity(itemId: number, quantity: number): Observable<Cart> {
    return this.http.put<Cart>(`${environment.apiUrl}/cart/items/${itemId}`, { quantity })
      .pipe(tap(c => this._cart.set(c.items)));
  }

  removeItem(itemId: number): Observable<Cart> {
    return this.http.delete<Cart>(`${environment.apiUrl}/cart/items/${itemId}`)
      .pipe(tap(c => this._cart.set(c.items)));
  }

  clearCart(): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/cart`).pipe(tap(() => this._cart.set([])));
  }

  addLocalItem(product: Product, quantity = 1): void {
    const current = this._cart();
    const existing = current.find(i => i.productId === product.id);
    if (existing) {
      this._cart.set(current.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + quantity } : i));
    } else {
      this._cart.set([...current, { id: Date.now(), productId: product.id, product, quantity }]);
    }
  }

  checkout(shippingAddress: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/orders`, { shippingAddress })
      .pipe(tap(() => this._cart.set([])));
  }
}
