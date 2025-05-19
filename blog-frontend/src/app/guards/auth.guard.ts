import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../service/auth/auth.service';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.auth.isLoggedIn$.pipe(
      take(1), // Chỉ lấy giá trị đầu tiên, không subscribe liên tục
      map(isLoggedIn => {
        if (isLoggedIn) {
          return true;
        }
        this.router.navigate(['/login'], {
          queryParams: { returnUrl: _state.url }
        });
        return false;
      })
    );
  }
}