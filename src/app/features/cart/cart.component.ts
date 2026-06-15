import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CurrencyPipe } from '@angular/common';
import { CartService } from '../../core/services/cart.service';
import { CartItem } from '../../core/models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-cart', standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, MatDividerModule, MatSnackBarModule, MatProgressSpinnerModule, CurrencyPipe],
  template: `
    <div class="cart-container">
      <h1 class="cart-title"><mat-icon>shopping_cart</mat-icon> Mi Carrito</h1>
      @if(items().length===0){
        <div class="empty-cart"><mat-icon>shopping_cart_checkout</mat-icon><h3>Tu carrito esta vacio</h3><a mat-raised-button color="accent" routerLink="/catalog">Ver catalogo</a></div>
      } @else {
        <div class="cart-layout">
          <div class="cart-items">
            @for(item of items();track item.id){
              <div class="cart-item">
                <img [src]="item.product.imageUrl||'https://placehold.co/80x80/1e1e1e/bb86fc?text=P'" [alt]="item.product.name" class="item-img" (error)="onErr($event)"/>
                <div class="item-info"><h4>{{item.product.name}}</h4><span class="item-price">{{item.product.price|currency:'MXN':'symbol':'1.2-2'}}</span></div>
                <div class="item-qty">
                  <button mat-icon-button (click)="decrease(item)"><mat-icon>remove</mat-icon></button>
                  <span>{{item.quantity}}</span>
                  <button mat-icon-button (click)="increase(item)"><mat-icon>add</mat-icon></button>
                </div>
                <div class="item-subtotal">{{item.product.price*item.quantity|currency:'MXN':'symbol':'1.2-2'}}</div>
                <button mat-icon-button class="remove-btn" (click)="remove(item)"><mat-icon>delete</mat-icon></button>
              </div>
              <mat-divider/>
            }
          </div>
          <div class="cart-summary">
            <h3>Resumen del pedido</h3>
            <div class="summary-row"><span>Subtotal ({{itemCount()}} articulos)</span><span>{{total()|currency:'MXN':'symbol':'1.2-2'}}</span></div>
            <div class="summary-row"><span>Envio</span><span class="free">Gratis</span></div>
            <mat-divider/>
            <div class="summary-row total-row"><span>Total</span><strong>{{total()|currency:'MXN':'symbol':'1.2-2'}}</strong></div>
            <button mat-raised-button color="accent" class="checkout-btn" [disabled]="isProcessing()" (click)="checkout()">
              @if(isProcessing()){<mat-spinner diameter="20"/>}
              @else {<mat-icon>payment</mat-icon> Pagar con tarjeta}
            </button>
            <a mat-stroked-button routerLink="/catalog" class="continue-btn">Seguir comprando</a>
          </div>
        </div>
      }
    </div>`,
  styles: [`
    .cart-container{max-width:1100px;margin:0 auto;padding:32px 24px}
    .cart-title{display:flex;align-items:center;gap:12px;font-size:2rem;font-weight:800;margin-bottom:32px}
    .cart-title mat-icon{color:#bb86fc;font-size:2rem;height:2rem;width:2rem}
    .empty-cart{display:flex;flex-direction:column;align-items:center;padding:80px 0;gap:16px;opacity:.7}
    .empty-cart mat-icon{font-size:72px;height:72px;width:72px}
    .cart-layout{display:grid;grid-template-columns:1fr 340px;gap:32px;align-items:start}
    @media(max-width:768px){.cart-layout{grid-template-columns:1fr}}
    .cart-item{display:flex;align-items:center;gap:16px;padding:16px 0}
    .item-img{width:80px;height:80px;object-fit:cover;border-radius:8px}
    .item-info{flex:1}.item-info h4{margin:0 0 4px;font-weight:600}.item-price{color:#bb86fc;font-size:.9rem}
    .item-qty{display:flex;align-items:center;gap:4px;background:rgba(255,255,255,.05);border-radius:8px;padding:2px 4px}
    .item-subtotal{font-weight:700;min-width:100px;text-align:right}
    .remove-btn{color:rgba(207,102,121,.7)}.remove-btn:hover{color:#cf6679}
    .cart-summary{background:#1e1e1e;border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:24px;position:sticky;top:88px}
    .cart-summary h3{margin:0 0 20px;font-size:1.1rem}
    .summary-row{display:flex;justify-content:space-between;margin:12px 0;font-size:.95rem;opacity:.8}
    .free{color:#03dac6}.total-row{opacity:1;font-size:1.1rem;margin-top:16px}
    .checkout-btn,.continue-btn{width:100%;margin-top:16px;padding:12px}.continue-btn{margin-top:8px}
    .checkout-btn mat-spinner{margin:0 auto}
  `]
})
export class CartComponent implements OnInit {
  items = this.cartService.items;
  total = this.cartService.total;
  itemCount = this.cartService.itemCount;
  isProcessing = signal(false);
  constructor(private cartService: CartService, private snackBar: MatSnackBar, private http: HttpClient) {}
  ngOnInit() { this.cartService.loadCart().subscribe(); }
  decrease(item: CartItem) { if(item.quantity<=1) this.remove(item); else this.cartService.updateQuantity(item.id, item.quantity-1).subscribe(); }
  increase(item: CartItem) { this.cartService.updateQuantity(item.id, item.quantity+1).subscribe(); }
  remove(item: CartItem) { this.cartService.removeItem(item.id).subscribe(()=>this.snackBar.open('Producto eliminado','x',{duration:2000})); }
  checkout() {
    this.isProcessing.set(true);
    this.http.post<{url:string,sessionId:string}>(`${environment.apiUrl}/payments/create-checkout-session`, {}).subscribe({
      next: (res) => { window.location.href = res.url; },
      error: (err) => { this.isProcessing.set(false); this.snackBar.open(err.error?.message||'Error al iniciar el pago','x',{duration:3000}); }
    });
  }
  onErr(e: Event) { (e.target as HTMLImageElement).src = 'https://placehold.co/80x80/1e1e1e/bb86fc?text=P'; }
}
