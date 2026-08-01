import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, map, of, shareReplay, tap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { StorageService } from '../../services/storage.service';
import { AuthResponse, LoginRequest, OtpChallenge, Permission, UserInfo } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  private currentUser = signal<UserInfo | null>(null);
  private token = signal<string | null>(null);
  private permissionsSig = signal<Permission[]>([]);
  private refreshInFlight$?: Observable<string>;

  readonly user = this.currentUser.asReadonly();
  readonly permissions = this.permissionsSig.asReadonly();
  readonly isAuthenticated = computed(() => !!this.token() && !!this.currentUser());

  constructor(
    private http: HttpClient,
    private router: Router,
    private storage: StorageService,
  ) {
    this.token.set(this.storage.getString(environment.tokenKey));
    this.currentUser.set(this.storage.getItem<UserInfo>(environment.userKey));
    this.permissionsSig.set(this.storage.getItem<Permission[]>(environment.permissionsKey) ?? []);
    this.checkTokenExpiration();
  }

  // ------------------------------- Auth API --------------------------------

  requestLoginOtp(credentials: LoginRequest): Observable<OtpChallenge> {
    return this.http.post<OtpChallenge>(`${this.apiUrl}/login`, credentials);
  }

  verifyLoginOtp(challengeId: string, code: string, sessionBinding: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/otp/verify`, { challengeId, code, sessionBinding }).pipe(
      tap((res) => this.handleAuthSuccess(res)),
    );
  }

  /** Refresh the access token (rotation). Returns the new access token. */
  refreshToken(): Observable<string> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, {}, { withCredentials: true }).pipe(
      tap((res) => this.handleAuthSuccess(res)),
      map((res) => res.accessToken),
      catchError((err) => {
        this.clearSession();
        return throwError(() => err);
      }),
    );
  }

  /**
   * Returns the token that may safely be attached to a protected request.
   *
   * When an expired access token still has a refresh token, all concurrent
   * startup requests share a single refresh operation instead of each sending
   * an avoidable 401 request first.
   */
  getValidAccessToken(): Observable<string | null> {
    const token = this.getToken();
    if (!token || !this.isTokenExpired(token)) {
      return of(token);
    }

    return this.refreshTokenOnce();
  }

  /** Shares one refresh request between all protected requests in flight. */
  refreshTokenOnce(): Observable<string> {
    if (!this.refreshInFlight$) {
      this.refreshInFlight$ = this.refreshToken().pipe(
        finalize(() => {
          this.refreshInFlight$ = undefined;
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    }

    return this.refreshInFlight$;
  }

  /** Invalidate all server-side sessions, then clear locally. */
  logoutAll(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout-all`, {}).pipe(
      tap(() => this.logout()),
      catchError(() => {
        this.logout();
        return throwError(() => new Error('logout-all failed'));
      }),
    );
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/auth/login']);
  }

  // ------------------------------- Accessors -------------------------------

  getToken(): string | null {
    return this.token();
  }

  getUser(): UserInfo | null {
    return this.currentUser();
  }

  hasPermission(permission: Permission): boolean {
    const owned = this.permissionsSig();
    const user = this.currentUser();
    if (user?.role === 'PlatformOwner' || user?.roles?.includes('PlatformOwner')) return true;
    // ManagePlatform is god-mode → grants everything.
    return owned.includes('ManagePlatform') || owned.includes(permission);
  }

  hasAnyPermission(...permissions: Permission[]): boolean {
    if (!permissions.length) return true;
    return permissions.some((p) => this.hasPermission(p));
  }

  // ------------------------------- Internals -------------------------------

  private handleAuthSuccess(res: AuthResponse): void {
    this.storage.setString(environment.tokenKey, res.accessToken);
    this.token.set(res.accessToken);
    const permissions = res.permissions ?? [];
    this.storage.setItem(environment.permissionsKey, permissions);
    this.permissionsSig.set(permissions);

    const user: UserInfo = {
      id: res.userId,
      email: res.email,
      fullName: res.fullName,
      role: res.role,
      roles: res.roles ?? [res.role],
      tenantId: res.tenantId,
    };
    this.storage.setItem(environment.userKey, user);
    this.currentUser.set(user);
  }

  private clearSession(): void {
    this.storage.removeItem(environment.tokenKey);
    this.storage.removeItem(environment.userKey);
    this.storage.removeItem(environment.permissionsKey);
    this.token.set(null);
    this.currentUser.set(null);
    this.permissionsSig.set([]);
  }

  /** An expired access token is only fatal when there is no refresh token. */
  private checkTokenExpiration(): void {
    const token = this.token();
    if (!token) return;
    if (this.isTokenExpired(token)) this.refreshTokenOnce().subscribe({ error: () => this.clearSession() });
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return typeof payload.exp !== 'number' || payload.exp * 1000 <= Date.now();
    } catch {
      return true;
    }
  }
}
