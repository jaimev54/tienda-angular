import { Component, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-navbar', standalone: true,
  imports: [RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, MatIconModule, MatBadgeModule, MatMenuModule, MatDividerModule],
  template: `
    <mat-toolbar class="navbar">
      <a routerLink="/catalog" class="brand">
        <mat-icon class="brand-icon">storefront</mat-icon>
        <span class="brand-name">DarkStore</span>
      </a>
      <nav class="nav-links">
        <a mat-button routerLink="/catalog" routerLinkActive="active">Catalogo</a>
        @if (isAdmin()) { <a mat-button routerLink="/admin" routerLinkActive="active">Admin</a> }
      </nav>
      <span class="spacer"></span>
      <div class="nav-actions">
        @if (isLoggedIn()) {
          <a mat-icon-button routerLink="/cart">
            <mat-icon [matBadge]="cartCount()" matBadgeColor="accent" [matBadgeHidden]="cartCount()===0">shopping_cart</mat-icon>
          </a>
          <button mat-icon-button [matMenuTriggerFor]="userMenu"><mat-icon>account_circle</mat-icon></button>
          <mat-menu #userMenu="matMenu">
            <div class="user-info">
              <span class="user-name">{{userName()}}</span>
              <span class="user-role">{{userRole()}}</span>
            </div>
            <mat-divider />
            <button mat-menu-item routerLink="/profile">
              <mat-icon>person</mat-icon> Mi Perfil
            </button>
            <button mat-menu-item routerLink="/cart">
              <mat-icon>shopping_cart</mat-icon> Mi Carrito
            </button>
            <mat-divider />
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon> Cerrar sesion
            </button>
          </mat-menu>
        } @else {
          <a mat-button routerLink="/auth/login">Iniciar sesion</a>
          <a mat-raised-button color="accent" routerLink="/auth/register">Registrarse</a>
        }
      </div>
    </mat-toolbar>`,
  styles: [`
    .navbar{position:fixed;top:0;left:0;right:0;z-index:1000;background:rgba(18,18,18,.95);backdrop-filter:blur(10px);border-bottom:1px solid rgba(255,255,255,.08);padding:0 24px;gap:16px}
    .brand{display:flex;align-items:center;gap:8px;text-decoration:none;color:inherit}
    .brand-icon{color:#bb86fc}
    .brand-name{font-size:1.3rem;font-weight:700;background:linear-gradient(135deg,#bb86fc,#03dac6);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
    .nav-links{display:flex;gap:4px}.spacer{flex:1}.nav-actions{display:flex;align-items:center;gap:8px}
    .active{background:rgba(187,134,252,.12)!important;color:#bb86fc!important}
    .user-info{padding:12px 16px;display:flex;flex-direction:column}.user-name{font-weight:600}.user-role{font-size:.75rem;opacity:.6;text-transform:capitalize}
  `]
})
export class NavbarComponent {
  isLoggedIn = this.auth.isLoggedIn;
  isAdmin = this.auth.isAdmin;
  cartCount = this.cart.itemCount;
  userName = computed(() => this.auth.currentUser()?.name ?? '');
  userRole = computed(() => this.auth.currentUser()?.role ?? '');
  constructor(private auth: AuthService, private cart: CartService) {}
  logout() { this.auth.logout(); }
}