import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
@Component({
  selector: 'app-login', standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <mat-icon class="auth-icon">storefront</mat-icon>
        <h2>Iniciar sesion</h2>
        <p class="auth-subtitle">Bienvenido de vuelta</p>
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
          <mat-form-field appearance="outline">
            <mat-label>Correo electronico</mat-label>
            <input matInput formControlName="email" type="email"/>
            <mat-icon matSuffix>email</mat-icon>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Contrasena</mat-label>
            <input matInput formControlName="password" [type]="showPwd()?'text':'password'"/>
            <button mat-icon-button matSuffix type="button" (click)="showPwd.set(!showPwd())">
              <mat-icon>{{showPwd()?'visibility_off':'visibility'}}</mat-icon>
            </button>
          </mat-form-field>
          @if(error()){<div class="auth-error">{{error()}}</div>}
          <button mat-raised-button color="accent" type="submit" class="submit-btn" [disabled]="isLoading()||form.invalid">
            @if(isLoading()){<mat-spinner diameter="20"/>}@else{Iniciar sesion}
          </button>
        </form>
        <p class="auth-link">No tienes cuenta? <a routerLink="/auth/register">Registrate aqui</a></p>
      </div>
    </div>`,
  styles: [`
    .auth-container{min-height:calc(100vh - 64px);display:flex;align-items:center;justify-content:center;padding:24px;background:radial-gradient(ellipse at 50% 0%,rgba(187,134,252,.08) 0%,transparent 60%)}
    .auth-card{width:100%;max-width:420px;background:#1e1e1e;border:1px solid rgba(255,255,255,.08);border-radius:20px;padding:48px 40px;text-align:center}
    .auth-icon{font-size:48px;height:48px;width:48px;color:#bb86fc}
    h2{font-size:1.8rem;font-weight:700;margin:16px 0 4px}.auth-subtitle{opacity:.5;margin-bottom:32px}
    .auth-form{display:flex;flex-direction:column;gap:4px}.auth-form mat-form-field{width:100%}
    .auth-error{background:rgba(207,102,121,.15);border:1px solid rgba(207,102,121,.4);color:#cf6679;padding:10px 14px;border-radius:8px;font-size:.85rem}
    .submit-btn{margin-top:8px;padding:12px;font-size:1rem;min-height:48px}
    .auth-link{margin-top:24px;opacity:.7}.auth-link a{color:#bb86fc;text-decoration:none;font-weight:600}
  `]
})
export class LoginComponent {
  form: FormGroup;
  isLoading = signal(false); showPwd = signal(false); error = signal('');
  constructor(fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = fb.group({ email: ['', [Validators.required, Validators.email]], password: ['', Validators.required] });
  }
  onSubmit() {
    if(this.form.invalid) return; this.isLoading.set(true); this.error.set('');
    this.auth.login(this.form.value).subscribe({
      next: () => { this.isLoading.set(false); this.router.navigate(['/catalog']); },
      error: (e) => { this.isLoading.set(false); this.error.set(e.error?.message||'Credenciales invalidas'); }
    });
  }
}
