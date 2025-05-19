import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/app/config/enviroment';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private http: HttpClient, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const token = localStorage.getItem('jwt'); 

    if (!token) {
      console.log('No token found, redirecting to login');
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return of(false);
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${environment.apiBaseUrl}/admin/check-role`, { headers, withCredentials: false }).pipe(
      map(() => {
        console.log('Admin role verified');
        return true;
      }),
      catchError((err) => {
        console.error('AdminGuard error:', err);
        if (err.status === 403) {
          console.log('Forbidden: Not an admin, redirecting to view-all');
          this.router.navigate(['/view-all']);
        } else if (err.status === 401 || err.status === 0) {
          console.log('Unauthorized or network error, removing token and redirecting to login');
          localStorage.removeItem('jwt');
          this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        } else {
          console.log('Unknown error, redirecting to login');
          this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        }
        return of(false);
      })
    );
  }
}