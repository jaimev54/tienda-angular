import { Component, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { Category, Product, ProductFilter } from '../../../core/models';
@Component({
  selector: 'app-product-list', standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatPaginatorModule, MatSnackBarModule, MatChipsModule, ProductCardComponent],
  template: `
    <div class="catalog-container">
      <div class="catalog-header">
        <h1 class="catalog-title">Catalogo</h1>
        <p class="catalog-subtitle">{{totalProducts()}} productos disponibles</p>
      </div>
      <div class="filters-bar">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Buscar productos...</mat-label>
          <input matInput [formControl]="searchCtrl"/>
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
        <mat-form-field appearance="outline" class="category-field">
          <mat-label>Categoria</mat-label>
          <mat-select [formControl]="categoryCtrl">
            <mat-option [value]="null">Todas</mat-option>
            @for(cat of categories();track cat.id){<mat-option [value]="cat.id">{{cat.name}}</mat-option>}
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="sort-field">
          <mat-label>Ordenar por</mat-label>
          <mat-select [formControl]="sortCtrl">
            <mat-option value="newest">Mas recientes</mat-option>
            <mat-option value="price_asc">Precio: Menor a Mayor</mat-option>
            <mat-option value="price_desc">Precio: Mayor a Menor</mat-option>
            <mat-option value="name">Nombre A-Z</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
      @if(isLoading()){
        <div class="loading-container"><mat-spinner diameter="48"/><p>Cargando productos...</p></div>
      } @else if(products().length===0){
        <div class="empty-state"><mat-icon>search_off</mat-icon><h3>No se encontraron productos</h3></div>
      } @else {
        <div class="products-grid">
          @for(p of products();track p.id){<app-product-card [product]="p" (addToCart)="onAddToCart($event)"/>}
        </div>
      }
      @if(totalProducts()>0){
        <mat-paginator [length]="totalProducts()" [pageSize]="12" [pageSizeOptions]="[8,12,24]" (page)="onPageChange($event)" showFirstLastButtons/>
      }
    </div>`,
  styles: [`
    .catalog-container{max-width:1400px;margin:0 auto;padding:32px 24px}
    .catalog-header{margin-bottom:32px}
    .catalog-title{font-size:2.5rem;font-weight:800;margin:0;background:linear-gradient(135deg,#bb86fc,#03dac6);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
    .catalog-subtitle{opacity:.5;margin:4px 0 0}
    .filters-bar{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:16px}
    .search-field{flex:2;min-width:200px}.category-field,.sort-field{flex:1;min-width:160px}
    .products-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:24px;margin-bottom:32px}
    .loading-container,.empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 0;gap:16px;opacity:.6}
    .empty-state mat-icon{font-size:64px;height:64px;width:64px}
  `]
})
export class ProductListComponent implements OnInit {
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  totalProducts = signal(0);
  isLoading = signal(false);
  searchCtrl = new FormControl('');
  categoryCtrl = new FormControl<number|null>(null);
  sortCtrl = new FormControl<ProductFilter['sortBy']>('newest');
  private currentPage = 1;

  constructor(private productService: ProductService, private cartService: CartService, private authService: AuthService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.loadCategories(); this.loadProducts();
    this.searchCtrl.valueChanges.pipe(debounceTime(400),distinctUntilChanged()).subscribe(()=>this.loadProducts());
    this.categoryCtrl.valueChanges.subscribe(()=>this.loadProducts());
    this.sortCtrl.valueChanges.subscribe(()=>this.loadProducts());
  }

  loadProducts() {
    this.isLoading.set(true);
    this.productService.getProducts({ search: this.searchCtrl.value||undefined, categoryId: this.categoryCtrl.value||undefined, sortBy: this.sortCtrl.value||'newest', page: this.currentPage, pageSize: 12 }).subscribe({
      next: r => { this.products.set(r.data); this.totalProducts.set(r.total); this.isLoading.set(false); },
      error: () => this.isLoading.set(false)
    });
  }

  loadCategories() { this.productService.getCategories().subscribe(c => this.categories.set(c)); }

  onAddToCart(product: Product) {
    if (!this.authService.isLoggedIn()) { this.cartService.addLocalItem(product); }
    else { this.cartService.addToCart(product).subscribe(); }
    this.snackBar.open('Producto agregado al carrito','',{duration:2500,panelClass:'snack-success'});
  }

  onPageChange(e: PageEvent) { this.currentPage = e.pageIndex+1; this.loadProducts(); }
}
