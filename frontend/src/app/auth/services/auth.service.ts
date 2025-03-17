import {Injectable} from '@angular/core';
import {Apollo, gql} from 'apollo-angular';
import {BehaviorSubject, Observable, throwError} from 'rxjs';
import {map, catchError, tap} from 'rxjs/operators';
import {Router} from '@angular/router';
import {LoginRequest} from '../../interface/requests/LoginRequest';
import {UserRequest} from '../../interface/requests/UserRequest';
import {AuthResponse} from '../../interface/response/AuthResponse';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private tokenExpirationTimer: any;

  private readonly LOGIN_MUTATION = gql`
    mutation Login($username: String!, $password: String!) {
      login(username: $username, password: $password) {
        token
        refreshToken
      }
    }
  `;

  private readonly REFRESH_TOKEN_MUTATION = gql`
    mutation RefreshToken($refreshToken: String!) {
      refreshToken(refreshToken: $refreshToken) {
        token
        refreshToken
      }
    }
  `;

  private readonly CREATE_USER_MUTATION = gql`
    mutation CreateUser($username: String!, $password: String!) {
      createUser(userRequest: { username: $username, password: $password}) {
        id
        username
      }
    }
  `;

  constructor(
    private apollo: Apollo,
    private router: Router
  ) {
    this.checkToken();
  }

  login(loginRequest: LoginRequest): Observable<AuthResponse> {
    return this.apollo.mutate<{ login: AuthResponse }>({
      mutation: this.LOGIN_MUTATION,
      variables: {
        username: loginRequest.username,
        password: loginRequest.password
      }
    }).pipe(
      map(result => result.data!.login),
      tap(response => this.handleAuthentication(response)),
      catchError(error => throwError(() => error))
    );
  }

  register(userRequest: UserRequest): Observable<any> {
    return this.apollo.mutate<{ createUser: any }>({
      mutation: this.CREATE_USER_MUTATION,
      variables: {
        username: userRequest.username,
        password: userRequest.password,
      }
    }).pipe(
      map(result => result.data!.createUser),
      catchError(error => throwError(() => error))
    );
  }

  refreshToken(refreshToken: string): Observable<AuthResponse> {
    return this.apollo.mutate<{ refreshToken: AuthResponse }>({
      mutation: this.REFRESH_TOKEN_MUTATION,
      variables: {
        refreshToken
      }
    }).pipe(
      map(result => result.data!.refreshToken),
      tap(response => this.handleAuthentication(response)),
      catchError(error => throwError(() => error))
    );
  }

  setupTokenRefresh(): void {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }

    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('tokenExpiration');

    if (!token || !expirationDate) return;

    const expirationTime = new Date(expirationDate).getTime();
    const now = new Date().getTime();
    const timeToExpiry = expirationTime - now;

    const refreshBuffer = 10 * 60 * 1000;

    if (timeToExpiry <= 0) {
      this.refreshTokenNow();
    } else if (timeToExpiry <= refreshBuffer) {
      this.refreshTokenNow();
    } else {
      // Schedule refresh for later
      const refreshDelay = timeToExpiry - refreshBuffer;
      console.log(`Token will refresh in ${refreshDelay / 1000} seconds`);

      this.tokenExpirationTimer = setTimeout(() => {
        this.refreshTokenNow();
      }, refreshDelay);
    }
  }

  private refreshTokenNow(): void {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      console.log('Refreshing token now');
      this.refreshToken(refreshToken).subscribe({
        next: () => {
          console.log('Token refreshed successfully');
        },
        error: (error) => {
          console.error('Failed to refresh token', error);
          if (this.isAuthenticated()) {
            setTimeout(() => this.refreshTokenNow(), 30000);
          }
        }
      });
    }
  }

  private handleAuthentication(authResponse: AuthResponse): void {
    const expirationDate = new Date(new Date().getTime() + 3600 * 1000);

    localStorage.setItem('token', authResponse.token);
    localStorage.setItem('refreshToken', authResponse.refreshToken);
    localStorage.setItem('tokenExpiration', expirationDate.toISOString());

    this.fetchUserInfo();

    this.autoLogout(3600 * 1000);
  }

  private fetchUserInfo(): void {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const user = {
          id: payload.userId,
          role: this.extractMainRole(payload.roles),
          username: payload.sub
        };
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUserSubject.next(user);
      } catch (e) {
        console.error('Failed to decode token', e);
        this.logout();
      }
    }
  }

  private extractMainRole(roles: string[]): string {
    if (!roles || !Array.isArray(roles) || roles.length === 0) {
      return 'USER';
    }
    return roles[0].replace('ROLE_', '');
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenExpiration');
    this.currentUserSubject.next(null);

    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }

    this.router.navigate(['/auth/login']);
  }

  autoLogout(expirationDuration: number): void {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }

  private checkToken(): void {
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');
    const expirationDate = localStorage.getItem('tokenExpiration');

    if (!token || !userJson || !expirationDate) {
      return;
    }

    const user = JSON.parse(userJson);
    const expirationTime = new Date(expirationDate).getTime() - new Date().getTime();

    if (expirationTime > 0) {
      this.currentUserSubject.next(user);
      this.autoLogout(expirationTime);
      this.setupTokenRefresh();
    } else {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        this.refreshToken(refreshToken).subscribe({
          error: () => this.logout()
        });
      } else {
        this.logout();
      }
    }
  }

  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'ADMIN';
  }

  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

}
