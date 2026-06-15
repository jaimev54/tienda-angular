import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { OrderService } from '../../../core/services/order.service';
import { DashboardStats } from '../../../core/models';
@Component({
  selector: 'app-dashboard', standalone: true,
  imports: [RouterLink, MatCardModule, MatIconModule, MatButtonModule, MatTableModule, MatProgressSpinnerModule, CurrencyPipe, DatePipe],
  template: `
    <div class="dashboard-container">
      <h1 class="dash-title">Panel de Administracion</h1>
      @if(isLoading()){<div class="loading"><mat-spinner/></div>}
      @else if(stats()){
        <div class="stats-grid">
          <mat-card class="stat-card"><mat-card-content><mat-icon class="revenue-icon">payments</mat-icon><div class="stat-info"><span class="stat-label">Ingresos Totales</span><span class="stat-value">{{stats()!.totalRevenue|currency:'MXN':'symbol':'1.0-0'}}</span></div></mat-card-content></mat-card>
          <mat-card class="stat-card"><mat-card-content><mat-icon class="orders-icon">receipt_long</mat-icon><div class="stat-info"><span class="stat-label">Pedidos</span><span class="stat-value">{{stats()!.totalOrders}}</span></div></mat-card-content></mat-card>
          <mat-card class="stat-card"><mat-card-content><mat-icon class="products-icon">inventory_2</mat-icon><div class="stat-info"><span class="stat-label">Productos</span><span class="stat-value">{{stats()!.totalProducts}}</span></div></mat-card-content></mat-card>
          <mat-card class="stat-card"><mat-card-content><mat-icon class="users-icon">people</mat-icon><div class="stat-info"><span class="stat-label">Usuarios</span><span class="stat-value">{{stats()!.totalUsers}}</span></div></mat-card-content></mat-card>
        </div>
        <div class="quick-actions">
          <a mat-raised-button color="accent" routerLink="/admin/products"><mat-icon>inventory_2</mat-icon> Gestionar productos</a>
          <a mat-stroked-button routerLink="/admin/orders"><mat-icon>receipt_long</mat-icon> Ver pedidos</a>
        </div>
        <mat-card class="table-card">
          <mat-card-header><mat-card-title>Pedidos Recientes</mat-card-title></mat-card-header>
          <mat-card-content>
            <table mat-table [dataSource]="stats()!.recentOrders" class="orders-table">
              <ng-container matColumnDef="id"><th mat-header-cell *matHeaderCellDef>#</th><td mat-cell *matCellDef="let o">{{o.id}}</td></ng-container>
              <ng-container matColumnDef="user"><th mat-header-cell *matHeaderCellDef>Cliente</th><td mat-cell *matCellDef="let o">{{o.user?.name}}</td></ng-container>
              <ng-container matColumnDef="total"><th mat-header-cell *matHeaderCellDef>Total</th><td mat-cell *matCellDef="let o">{{o.total|currency:'MXN':'symbol':'1.2-2'}}</td></ng-container>
              <ng-container matColumnDef="status"><th mat-header-cell *matHeaderCellDef>Estado</th><td mat-cell *matCellDef="let o"><span class="status-badge status-{{o.status}}">{{o.status}}</span></td></ng-container>
              <ng-container matColumnDef="date"><th mat-header-cell *matHeaderCellDef>Fecha</th><td mat-cell *matCellDef="let o">{{o.createdAt|date:'dd/MM/yyyy'}}</td></ng-container>
              <tr mat-header-row *matHeaderRowDef="cols"></tr>
              <tr mat-row *matRowDef="let row;columns:cols;"></tr>
            </table>
          </mat-card-content>
        </mat-card>
      }
    </div>`,
  styles: [`
    .dashboard-container{max-width:1200px;margin:0 auto;padding:32px 24px}
    .dash-title{font-size:2rem;font-weight:800;margin-bottom:32px;background:linear-gradient(135deg,#bb86fc,#03dac6);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
    .loading{display:flex;justify-content:center;padding:80px}
    .stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;margin-bottom:24px}
    .stat-card mat-card-content{display:flex;align-items:center;gap:16px;padding:20px!important}
    .stat-card mat-icon{font-size:40px;height:40px;width:40px}
    .revenue-icon{color:#bb86fc}.orders-icon{color:#03dac6}.products-icon{color:#ffb74d}.users-icon{color:#4fc3f7}
    .stat-info{display:flex;flex-direction:column;gap:4px}
    .stat-label{font-size:.8rem;opacity:.6;text-transform:uppercase;letter-spacing:.05em}
    .stat-value{font-size:1.6rem;font-weight:700}
    .quick-actions{display:flex;gap:12px;margin-bottom:24px;flex-wrap:wrap}
    .orders-table{width:100%}
    .status-badge{padding:4px 10px;border-radius:4px;font-size:.75rem;font-weight:600}
    .status-pending{background:rgba(255,183,77,.2);color:#ffb74d}.status-processing{background:rgba(3,218,198,.2);color:#03dac6}
    .status-shipped{background:rgba(79,195,247,.2);color:#4fc3f7}.status-delivered{background:rgba(129,199,132,.2);color:#81c784}
    .status-cancelled{background:rgba(207,102,121,.2);color:#cf6679}
  `]
})
export class DashboardComponent implements OnInit {
  stats = signal<DashboardStats|null>(null); isLoading = signal(true);
  cols = ['id','user','total','status','date'];
  constructor(private orderService: OrderService) {}
  ngOnInit() { this.orderService.getDashboardStats().subscribe({ next: s => { this.stats.set(s); this.isLoading.set(false); }, error: () => this.isLoading.set(false) }); }
}
