import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { CurrencyPipe, NgIf } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { Product } from '../../../core/models';
@Component({
  selector: 'app-product-detail', standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule, MatDividerModule, CurrencyPipe, NgIf],
  template: `
    <div class="detail-container">
      <div *ngIf="isLoading()" class="loading"><mat-spinner></mat-spinner></div>
      <ng-container *ngIf="!isLoading()">
        <ng-container *ngIf="product() as product; else notFound">
          <a mat-button routerLink="/catalog" class="back-btn"><mat-icon>arrow_back</mat-icon> Volver al catálogo</a>
          <div class="product-layout">
            <div><img [src]="product.imageUrl || 'https://placehold.co/600x500/1e1e1e/bb86fc?text=Producto'" [alt]="product.name" class="main-image" (error)="onErr($event)"/></div>
            <div class="product-info">
              <div class="cat-badge">{{product.category?.name}}</div>
              <h1 class="prod-title">{{product.name}}</h1>
              <div class="price-display">{{product.price | currency:'MXN':'symbol':'1.2-2'}}</div>
              <p class="description">{{product.description}}</p>
              <mat-divider></mat-divider>
              <div class="stock-info">
                <mat-icon [class.available]="product.stock > 0" [class.unavailable]="product.stock === 0">{{product.stock > 0 ? 'check_circle' : 'cancel'}}</mat-icon>
                <span>{{product.stock > 0 ? product.stock + ' unidades disponibles' : 'Sin stock'}}</span>
              </div>
              <div *ngIf="product.stock > 0" class="qty-row">
                <label>Cantidad:</label>
                <div class="qty-controls">
                  <button mat-icon-button (click)="decrementQty()"><mat-icon>remove</mat-icon></button>
                  <span class="qty-val">{{qty}}</span>
                  <button mat-icon-button (click)="incrementQty(product.stock)"><mat-icon>add</mat-icon></button>
                </div>
              </div>
              <button mat-raised-button color="accent" class="add-btn" [disabled]="product.stock === 0" (click)="addToCart()">
                <mat-icon>add_shopping_cart</mat-icon> Agregar al carrito
              </button>
            </div>
          </div>
        </ng-container>
        <ng-template #notFound>
          <p>Producto no encontrado.</p>
        </ng-template>
      </ng-container>
    </div>`,
  styles: [`
    .detail-container{max-width:1100px;margin:0 auto;padding:32px 24px}
    .loading{display:flex;justify-content:center;padding:80px}
    .back-btn{margin-bottom:24px;opacity:.7}
    .product-layout{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:start}
    @media(max-width:768px){.product-layout{grid-template-columns:1fr}}
    .main-image{width:100%;border-radius:16px;object-fit:cover;max-height:500px;border:1px solid rgba(255,255,255,.08)}
    .cat-badge{font-size:.75rem;text-transform:uppercase;letter-spacing:.12em;color:#03dac6;margin-bottom:12px}
    .prod-title{font-size:2rem;font-weight:800;margin:0 0 16px}
    .price-display{font-size:2.2rem;font-weight:700;color:#bb86fc;margin-bottom:20px}
    .description{opacity:.7;line-height:1.7;margin-bottom:24px}
    .stock-info{display:flex;align-items:center;gap:8px;margin:16px 0;font-size:.9rem}
    .available{color:#03dac6}.unavailable{color:#cf6679}
    .qty-row{display:flex;align-items:center;gap:16px;margin:20px 0}
    .qty-controls{display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.05);border-radius:8px;padding:4px}
    .qty-val{font-size:1.1rem;font-weight:600;min-width:30px;text-align:center}
    .add-btn{width:100%;padding:12px;font-size:1rem;margin-top:8px}
  `]
})
export class ProductDetailComponent implements OnInit {
  product = signal<Product|null>(null);
  isLoading = signal(true);
  qty = 1;
  constructor(private route: ActivatedRoute, private productService: ProductService, private cartService: CartService, private authService: AuthService, private snackBar: MatSnackBar) {}
  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productService.getProduct(id).subscribe({ next: p => { this.product.set(p); this.isLoading.set(false); }, error: () => this.isLoading.set(false) });
  }
  addToCart() {
    const p = this.product(); if(!p) return;
    if(!this.authService.isLoggedIn()) this.cartService.addLocalItem(p, this.qty);
    else this.cartService.addToCart(p, this.qty).subscribe();
    this.snackBar.open(`${this.qty}  ${p.name} agregado`,'',{duration:2500,panelClass:'snack-success'});
  }

  decrementQty() {
    if (this.qty > 1) {
      this.qty--;
    }
  }

  incrementQty(stock: number) {
    if (this.qty < stock) {
      this.qty++;
    }
  }

  onErr(e: Event) { (e.target as HTMLImageElement).src = 'https://placehold.co/600x500/1e1e1e/bb86fc?text=Producto'; }
}
