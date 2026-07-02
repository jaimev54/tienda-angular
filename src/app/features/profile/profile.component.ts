import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { ProfileService } from '../../core/services/profile.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSnackBarModule,
    MatProgressSpinnerModule, MatDividerModule
  ],
  template: `
    <div class="profile-container">
      <h1 class="profile-title">
        <mat-icon>account_circle</mat-icon>
        Mi Perfil
      </h1>

      @if (isLoading()) {
        <div class="loading"><mat-spinner diameter="48"/></div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="onSubmit()">

          <div class="section">
            <h2 class="section-title">Datos personales</h2>
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Nombre completo</mat-label>
                <input matInput formControlName="name"/>
                <mat-icon matSuffix>person</mat-icon>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Teléfono</mat-label>
                <input matInput formControlName="phone"/>
                <mat-icon matSuffix>phone</mat-icon>
              </mat-form-field>
            </div>
          </div>

          <mat-divider/>

          <div class="section">
            <h2 class="section-title">Dirección de envío</h2>
            <div class="form-grid">
              <mat-form-field appearance="outline" class="full">
                <mat-label>Calle y número</mat-label>
                <input matInput formControlName="street"/>
                <mat-icon matSuffix>home</mat-icon>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Colonia</mat-label>
                <input matInput formControlName="colony"/>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Código postal</mat-label>
                <input matInput formControlName="zipCode"/>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Ciudad</mat-label>
                <input matInput formControlName="city"/>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Estado</mat-label>
                <input matInput formControlName="state"/>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>País</mat-label>
                <input matInput formControlName="country"/>
              </mat-form-field>
            </div>
          </div>

          <div class="form-actions">
            <button mat-raised-button color="accent" type="submit"
              [disabled]="isSaving()">
              @if (isSaving()) {
                <mat-spinner diameter="20"/>
              } @else {
                        <ng-container>
                        <mat-icon>save</mat-icon> Guardar cambios
                        </ng-container>
                        }
            </button>
          </div>

        </form>
      }
    </div>
  `,
  styles: [`
    .profile-container { max-width: 800px; margin: 0 auto; padding: 32px 24px; }
    .profile-title {
      display: flex; align-items: center; gap: 12px;
      font-size: 2rem; font-weight: 800; margin-bottom: 32px;
    }
    .profile-title mat-icon { color: #bb86fc; font-size: 2rem; height: 2rem; width: 2rem; }
    .section { padding: 24px 0; }
    .section-title { font-size: 1.1rem; font-weight: 600; margin-bottom: 20px; opacity: 0.8; }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    @media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
    .full { grid-column: 1 / -1; }
    .form-actions { display: flex; justify-content: flex-end; padding-top: 16px; }
    .loading { display: flex; justify-content: center; padding: 80px; }
  `]
})
export class ProfileComponent implements OnInit {
  form: FormGroup;
  isLoading = signal(true);
  isSaving = signal(false);

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      name: [''],
      phone: [''],
      street: [''],
      colony: [''],
      city: [''],
      state: [''],
      zipCode: [''],
      country: ['México']
    });
  }

  ngOnInit(): void {
    this.profileService.getProfile().subscribe({
      next: user => {
        this.form.patchValue({
          name: user.name,
          phone: user.phone || '',
          street: user.street || '',
          colony: user.colony || '',
          city: user.city || '',
          state: user.state || '',
          zipCode: user.zipCode || '',
          country: user.country || 'México'
        });
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onSubmit(): void {
    this.isSaving.set(true);
    this.profileService.updateProfile(this.form.value).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.snackBar.open('Perfil actualizado', '✕', {
          duration: 2500, panelClass: 'snack-success'
        });
      },
      error: () => {
        this.isSaving.set(false);
        this.snackBar.open('Error al guardar', '✕', { duration: 2500 });
      }
    });
  }
}