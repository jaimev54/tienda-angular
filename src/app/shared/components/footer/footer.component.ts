import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-footer', standalone: true, imports: [MatIconModule],
  template: `<footer class="footer"><div class="footer-content"><div class="footer-brand"><mat-icon>storefront</mat-icon><span>DarkStore</span></div><p class="footer-text"> 2025 DarkStore. Proyecto de portafolio.</p></div></footer>`,
  styles: [`.footer{background:#0a0a0a;border-top:1px solid rgba(255,255,255,.06);padding:24px;text-align:center}.footer-content{display:flex;flex-direction:column;align-items:center;gap:8px}.footer-brand{display:flex;align-items:center;gap:8px;color:#bb86fc;font-weight:700}.footer-text{opacity:.4;font-size:.85rem;margin:0}`]
})
export class FooterComponent {}
