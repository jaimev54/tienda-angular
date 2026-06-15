import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CurrencyPipe } from '@angular/common';
import { CartService } from '../../core/services/cart.service';
import { environment } from '../../../environments/environment';

interface SessionStatus {
  status: string;
  customerEmail: string | null;
  amountTotal: number;
  currency: string;
}

@Component({
  selector: 'app-checkout-success', standalone: true,
  imports: [RouterLink, MatIconModule, MatButtonModule, MatProgressSpinnerModule, CurrencyPipe],
  template: `
    <div class="success-container">
      @if(isLoading()){
        <div class="loading"><mat-spinner diameter="48"/><p>Verificando tu pago...</p></div>
      } @else if(session()?.status==='paid'){
        <div class="success-card">
          <mat-icon class="success-icon">check_circle</mat-icon>
          <h1>Pago exitoso!</h1>
          <p class="subtitle">Tu pedido ha sido procesado correctamente</p>
          <div class="details">
            <div class="detail-row"><span>Total pagado</span><strong>{{session()!.amountTotal|currency:'MXN':'symbol':'1.2-2'}}</strong></div>
            @if(session()?.customerEmail){<div class="detail-row"><span>Recibo enviado a</span><strong>{{session()!.customerEmail}}</strong></div>}
          </div>
          <a mat-raised-button color="accent" routerLink="/catalog"><mat-icon>storefront</mat-icon> Seguir comprando</a>
        </div>
      } @else {
        <div class="error-card">
          <mat-icon class="error-icon">error</mat-icon>
          <h1>No se pudo confirmar el pago</h1>
          <p class="subtitle">Si el cargo se realizo, contacta a soporte</p>
          <a mat-raised-button color="accent" routerLink="/cart">Volver al carrito</a>
        </div>
      }
    </div>`,
  styles: [`
    .success-container{min-height:calc(100vh - 64px);display:flex;align-items:center;justify-content:center;padding:24px}
    .loading{display:flex;flex-direction:column;align-items:center;gap:16px;opacity:.7}
    .success-card,.error-card{max-width:480px;width:100%;background:#1e1e1e;border:1px solid rgba(255,255,255,.08);border-radius:20px;padding:48px 40px;text-align:center}
    .success-icon{font-size:64px;height:64px;width:64px;color:#03dac6}
    .error-icon{font-size:64px;height:64px;width:64px;color:#cf6679}
    h1{font-size:1.8rem;font-weight:700;margin:16px 0 4px}.subtitle{opacity:.6;margin-bottom:24px}
    .details{background:rgba(255,255,255,.03);border-radius:12px;padding:16px;margin-bottom:24px}
    .detail-row{display:flex;justify-content:space-between;padding:8px 0;font-size:.9rem}
    .detail-row:not(:last-child){border-bottom:1px solid rgba(255,255,255,.06)}
    .success-card a,.error-card a{width:100%;padding:12px}
  `]
})
export class CheckoutSuccessComponent implements OnInit {
  session = signal<SessionStatus|null>(null);
  isLoading = signal(true);
  constructor(private route: ActivatedRoute, private http: HttpClient, private cartService: CartService) {}
  ngOnInit() {
    const sessionId = this.route.snapshot.queryParamMap.get('session_id');
    if(!sessionId) { this.isLoading.set(false); return; }
    this.http.get<SessionStatus>(`${environment.apiUrl}/payments/session/${sessionId}`).subscribe({
      next: (res) => { this.session.set(res); this.isLoading.set(false); if(res.status==='paid') this.cartService.loadCart().subscribe(); },
      error: () => this.isLoading.set(false)
    });
  }
}
