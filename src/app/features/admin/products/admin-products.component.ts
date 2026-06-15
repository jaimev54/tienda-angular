import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { CurrencyPipe } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { Category, Product } from '../../../core/models';
@Component({
  selector: 'app-admin-products', standalone: true,
  imports: [ReactiveFormsModule, MatTableModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatSnackBarModule, MatProgressSpinnerModule, MatCardModule, CurrencyPipe],
  template: `
    <div class="admin-container">
      <div class="admin-header"><h1>Gestion de Productos</h1><button mat-raised-button color="accent" (click)="openForm()"><mat-icon>add</mat-icon> Nuevo producto</button></div>
      @if(showForm()){
        <mat-card class="form-card">
          <mat-card-header><mat-card-title>{{editingProduct()?'Editar':'Nuevo'}} Producto</mat-card-title></mat-card-header>
          <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="saveProduct()" class="product-form">
              <div class="form-row">
                <mat-form-field appearance="outline"><mat-label>Nombre</mat-label><input matInput formControlName="name"/></mat-form-field>
                <mat-form-field appearance="outline"><mat-label>Categoria</mat-label><mat-select formControlName="categoryId">@for(c of categories();track c.id){<mat-option [value]="c.id">{{c.name}}</mat-option>}</mat-select></mat-form-field>
              </div>
              <mat-form-field appearance="outline" class="full-width"><mat-label>Descripcion</mat-label><textarea matInput formControlName="description" rows="3"></textarea></mat-form-field>
              <div class="form-row">
                <mat-form-field appearance="outline"><mat-label>Precio (MXN)</mat-label><input matInput formControlName="price" type="number"/></mat-form-field>
                <mat-form-field appearance="outline"><mat-label>Stock</mat-label><input matInput formControlName="stock" type="number"/></mat-form-field>
              </div>
              <mat-form-field appearance="outline" class="full-width"><mat-label>URL de imagen</mat-label><input matInput formControlName="imageUrl"/></mat-form-field>
              <div class="form-actions">
                <button mat-stroked-button type="button" (click)="cancelForm()">Cancelar</button>
                <button mat-raised-button color="accent" type="submit" [disabled]="form.invalid||isSaving()">
                  @if(isSaving()){<mat-spinner diameter="20"/>}@else{{{editingProduct()?'Actualizar':'Crear'}} producto}
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      }
      @if(isLoading()){<div class="loading"><mat-spinner/></div>}
      @else{
        <mat-card>
          <table mat-table [dataSource]="products()" class="products-table">
            <ng-container matColumnDef="image"><th mat-header-cell *matHeaderCellDef>Imagen</th><td mat-cell *matCellDef="let p"><img [src]="p.imageUrl||'https://placehold.co/50x50/1e1e1e/bb86fc?text=P'" class="table-img" (error)="onErr($event)"/></td></ng-container>
            <ng-container matColumnDef="name"><th mat-header-cell *matHeaderCellDef>Nombre</th><td mat-cell *matCellDef="let p">{{p.name}}</td></ng-container>
            <ng-container matColumnDef="category"><th mat-header-cell *matHeaderCellDef>Categoria</th><td mat-cell *matCellDef="let p">{{p.category?.name}}</td></ng-container>
            <ng-container matColumnDef="price"><th mat-header-cell *matHeaderCellDef>Precio</th><td mat-cell *matCellDef="let p" class="price-cell">{{p.price|currency:'MXN':'symbol':'1.2-2'}}</td></ng-container>
            <ng-container matColumnDef="stock"><th mat-header-cell *matHeaderCellDef>Stock</th><td mat-cell *matCellDef="let p" [class.low-stock]="p.stock<5">{{p.stock}}</td></ng-container>
            <ng-container matColumnDef="actions"><th mat-header-cell *matHeaderCellDef>Acciones</th><td mat-cell *matCellDef="let p">
              <button mat-icon-button (click)="editProduct(p)"><mat-icon>edit</mat-icon></button>
              <button mat-icon-button color="warn" (click)="deleteProduct(p)"><mat-icon>delete</mat-icon></button>
            </td></ng-container>
            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let row;columns:cols;"></tr>
          </table>
        </mat-card>
      }
    </div>`,
  styles: [`
    .admin-container{max-width:1200px;margin:0 auto;padding:32px 24px}
    .admin-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px}
    .admin-header h1{font-size:1.8rem;font-weight:700;margin:0}
    .form-card{margin-bottom:24px}
    .product-form{display:flex;flex-direction:column;gap:8px;padding-top:16px}
    .form-row{display:grid;grid-template-columns:1fr 1fr;gap:16px}.full-width{width:100%}
    .form-actions{display:flex;gap:12px;justify-content:flex-end}
    .loading{display:flex;justify-content:center;padding:80px}
    .products-table{width:100%}.table-img{width:50px;height:50px;object-fit:cover;border-radius:6px}
    .price-cell{color:#bb86fc;font-weight:600}.low-stock{color:#cf6679;font-weight:600}
  `]
})
export class AdminProductsComponent implements OnInit {
  products = signal<Product[]>([]); categories = signal<Category[]>([]);
  isLoading = signal(true); isSaving = signal(false);
  showForm = signal(false); editingProduct = signal<Product|null>(null);
  cols = ['image','name','category','price','stock','actions'];
  form: FormGroup;
  constructor(fb: FormBuilder, private productService: ProductService, private snackBar: MatSnackBar) {
    this.form = fb.group({ name: ['', Validators.required], description: ['', Validators.required], price: [0, [Validators.required, Validators.min(0)]], stock: [0, [Validators.required, Validators.min(0)]], imageUrl: [''], categoryId: [null, Validators.required] });
  }
  ngOnInit() { this.loadProducts(); this.productService.getCategories().subscribe(c => this.categories.set(c)); }
  loadProducts() { this.isLoading.set(true); this.productService.getProducts({ pageSize: 100 }).subscribe({ next: r => { this.products.set(r.data); this.isLoading.set(false); }, error: () => this.isLoading.set(false) }); }
  openForm() { this.editingProduct.set(null); this.form.reset({ price: 0, stock: 0 }); this.showForm.set(true); }
  editProduct(p: Product) { this.editingProduct.set(p); this.form.patchValue(p); this.showForm.set(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  cancelForm() { this.showForm.set(false); this.editingProduct.set(null); }
  saveProduct() {
    if(this.form.invalid) return; this.isSaving.set(true);
    const editing = this.editingProduct();
    const obs = editing ? this.productService.updateProduct(editing.id, this.form.value) : this.productService.createProduct(this.form.value);
    obs.subscribe({ next: () => { this.isSaving.set(false); this.cancelForm(); this.loadProducts(); this.snackBar.open(editing?'Producto actualizado':'Producto creado','',{duration:2500,panelClass:'snack-success'}); }, error: () => { this.isSaving.set(false); this.snackBar.open('Error al guardar','',{duration:2500}); } });
  }
  deleteProduct(p: Product) { if(!confirm(`Eliminar "${p.name}"?`)) return; this.productService.deleteProduct(p.id).subscribe({ next: () => { this.loadProducts(); this.snackBar.open('Producto eliminado','',{duration:2000}); } }); }
  onErr(e: Event) { (e.target as HTMLImageElement).src = 'https://placehold.co/50x50/1e1e1e/bb86fc?text=P'; }
}
