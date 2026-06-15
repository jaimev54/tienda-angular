import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';
  private _currentUser = signal<User | null>(this.loadUser());
  currentUser = this._currentUser.asReadonly();
  isLoggedIn = computed(() => !!this._currentUser());
  isAdmin = computed(() => this._currentUser()?.role === 'admin');

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap(r => this.saveSession(r)));
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, data).pipe(
      tap(r => this.saveSession(r)));
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null { return localStorage.getItem(this.TOKEN_KEY); }

  private saveSession(r: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, r.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(r.user));
    this._currentUser.set(r.user);
  }

  private loadUser(): User | null {
    const u = localStorage.getItem(this.USER_KEY);
    return u ? JSON.parse(u) : null;
  }
}
