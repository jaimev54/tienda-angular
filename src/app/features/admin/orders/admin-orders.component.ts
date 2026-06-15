import { Component, OnInit, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models';
@Component({
  selector: 'app-admin-orders', standalone: true,
  imports: [MatTableModule, MatButtonModule, MatSelectModule, MatFormFieldModule, MatProgressSpinnerModule, MatCardModule, MatSnackBarModule, MatIconModule, CurrencyPipe, DatePipe, FormsModule],
  template: `
    <div class="orders-container">
      <h1>Gestion de Pedidos</h1>
      @if(isLoading()){<div class="loading"><mat-spinner/></div>}
      @else{
        <mat-card>
          <table mat-table [dataSource]="orders()" class="orders-table">
            <ng-container matColumnDef="id"><th mat-header-cell *matHeaderCellDef>#</th><td mat-cell *matCellDef="let o">{{o.id}}</td></ng-container>
            <ng-container matColumnDef="user"><th mat-header-cell *matHeaderCellDef>Cliente</th><td mat-cell *matCellDef="let o">{{o.user?.name}}<br><small style="opacity:.5">{{o.user?.email}}</small></td></ng-container>
            <ng-container matColumnDef="total"><th mat-header-cell *matHeaderCellDef>Total</th><td mat-cell *matCellDef="let o" class="price-cell">{{o.total|currency:'MXN':'symbol':'1.2-2'}}</td></ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Estado</th>
              <td mat-cell *matCellDef="let o">
                <mat-select [(ngModel)]="o.status" (ngModelChange)="updateStatus(o)" class="status-select">
                  <mat-option value="pending">Pendiente</mat-option>
                  <mat-option value="processing">Procesando</mat-option>
                  <mat-option value="shipped">Enviado</mat-option>
                  <mat-option value="delivered">Entregado</mat-option>
                  <mat-option value="cancelled">Cancelado</mat-option>
                </mat-select>
              </td>
            </ng-container>
            <ng-container matColumnDef="date"><th mat-header-cell *matHeaderCellDef>Fecha</th><td mat-cell *matCellDef="let o">{{o.createdAt|date:'dd/MM/yyyy HH:mm'}}</td></ng-container>
            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let row;columns:cols;"></tr>
          </table>
        </mat-card>
      }
    </div>`,
  styles: [`
    .orders-container{max-width:1200px;margin:0 auto;padding:32px 24px}
    h1{font-size:1.8rem;font-weight:700;margin-bottom:24px}
    .loading{display:flex;justify-content:center;padding:80px}
    .orders-table{width:100%}.price-cell{color:#bb86fc;font-weight:600}.status-select{min-width:130px}
  `]
})
export class AdminOrdersComponent implements OnInit {
  orders = signal<Order[]>([]); isLoading = signal(true);
  cols = ['id','user','total','status','date'];
  constructor(private orderService: OrderService, private snackBar: MatSnackBar) {}
  ngOnInit() { this.orderService.getAllOrders().subscribe({ next: r => { this.orders.set(r.data); this.isLoading.set(false); }, error: () => this.isLoading.set(false) }); }
  updateStatus(o: Order) { this.orderService.updateOrderStatus(o.id, o.status).subscribe({ next: () => this.snackBar.open('Estado actualizado','',{duration:2000,panelClass:'snack-success'}), error: () => this.snackBar.open('Error al actualizar','',{duration:2000}) }); }
}
