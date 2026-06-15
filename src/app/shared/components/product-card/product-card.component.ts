import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe } from '@angular/common';
import { Product } from '../../../core/models';
@Component({
  selector: 'app-product-card', standalone: true,
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule, CurrencyPipe],
  template: `
    <mat-card class="product-card" appearance="outlined">
      <div class="card-img-wrap">
        <img [src]="product.imageUrl||'https://placehold.co/400x200/1e1e1e/bb86fc?text=Producto'" [alt]="product.name" class="card-img" (error)="onErr($event)"/>
        @if(product.stock===0){<div class="no-stock">Sin stock</div>}
      </div>
      <mat-card-content class="card-content">
        <div class="cat-tag">{{product.category?.name}}</div>
        <h3 class="prod-name">{{product.name}}</h3>
        <p class="prod-desc">{{product.description}}</p>
        <div class="price-row">
          <span class="price">{{product.price|currency:'MXN':'symbol':'1.2-2'}}</span>
          <span class="stock" [class.low]="product.stock<5">{{product.stock}} disp.</span>
        </div>
      </mat-card-content>
      <mat-card-actions class="card-actions">
        <a mat-stroked-button [routerLink]="['/product',product.id]">Ver detalle</a>
        <button mat-raised-button color="accent" [disabled]="product.stock===0" (click)="addToCart.emit(product)">
          <mat-icon>add_shopping_cart</mat-icon> Agregar
        </button>
      </mat-card-actions>
    </mat-card>`,
  styles: [`
    .product-card{background:#1e1e1e;border-color:rgba(255,255,255,.08)!important;transition:transform .2s,box-shadow .2s;height:100%;display:flex;flex-direction:column}
    .product-card:hover{transform:translateY(-4px);box-shadow:0 12px 40px rgba(187,134,252,.15)!important}
    .card-img-wrap{position:relative;height:200px;overflow:hidden}
    .card-img{width:100%;height:100%;object-fit:cover;transition:transform .3s}
    .product-card:hover .card-img{transform:scale(1.05)}
    .no-stock{position:absolute;top:12px;right:12px;background:rgba(207,102,121,.9);color:#fff;padding:4px 10px;border-radius:4px;font-size:.75rem;font-weight:600}
    .card-content{padding:16px;flex:1}.cat-tag{font-size:.7rem;text-transform:uppercase;letter-spacing:.1em;color:#03dac6;margin-bottom:6px}
    .prod-name{font-size:1rem;font-weight:600;margin:0 0 8px;line-height:1.3}
    .prod-desc{font-size:.85rem;opacity:.6;margin:0 0 12px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
    .price-row{display:flex;align-items:baseline;justify-content:space-between}
    .price{font-size:1.2rem;font-weight:700;color:#bb86fc}.stock{font-size:.75rem;opacity:.5}.stock.low{color:#cf6679;opacity:1}
    .card-actions{padding:8px 16px 16px;display:flex;gap:8px}
  `]
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Output() addToCart = new EventEmitter<Product>();
  onErr(e: Event) { (e.target as HTMLImageElement).src = 'https://placehold.co/400x200/1e1e1e/bb86fc?text=Producto'; }
}
