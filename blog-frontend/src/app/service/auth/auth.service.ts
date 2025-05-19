import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from 'src/app/config/enviroment';
import { tap } from 'rxjs/operators';
import { UserProfile } from 'src/app/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiBaseUrl;
  private userProfileSubject = new BehaviorSubject<UserProfile | null>(null);
  private isLoggedInSubject = new BehaviorSubject<boolean>(false); // Thêm subject để theo dõi trạng thái đăng nhập
  public isLoggedIn$ = this.isLoggedInSubject.asObservable(); // Observable để component subscribe

  constructor(private http: HttpClient) {
    this.loadProfile();
    this.updateLoggedInStatus(); // Khởi tạo trạng thái ban đầu
  }

  register(username: string, email: string, password: string): Observable<any> {
    const body = { username, email, password };
    return this.http.post(`${this.apiUrl}/auth/register`, body);
  }

  login(username: string, password: string): Observable<any> {
    const body = { username, password };
    return this.http.post(`${this.apiUrl}/auth/login`, body, { responseType: 'json' }).pipe(
      tap((response: any) => {
        const token = response.token;
        if (token) {
          localStorage.setItem('jwt', token);
          this.loadProfile();
          this.updateLoggedInStatus(); // Cập nhật trạng thái đăng nhập
        } else {
          throw new Error('Token không được trả về từ server');
        }
      })
    );
  }

  getProfile(): Observable<UserProfile> {
    const token = localStorage.getItem('jwt');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<UserProfile>(`${this.apiUrl}/user/profile`, { headers }).pipe(
      tap(profile => this.userProfileSubject.next(profile))
    );
  }

  checkUsername(username: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/auth/check-username/${username}`);
  }

  private loadProfile(): void {
    if (this.isLoggedIn()) {
      this.getProfile().subscribe({
        next: (profile) => console.log('Profile loaded:', profile),
        error: (err) => {
          console.error('Error loading profile:', err);
          if (err.status === 401) this.logout();
        }
      });
    }
  }

  private updateLoggedInStatus(): void {
    const loggedIn = !!localStorage.getItem('jwt');
    this.isLoggedInSubject.next(loggedIn); // Cập nhật trạng thái
  }

  getUserProfile(): Observable<UserProfile | null> {
    return this.userProfileSubject.asObservable();
  }

  logout(): void {
    localStorage.removeItem('jwt');
    this.userProfileSubject.next(null);
    this.updateLoggedInStatus(); // Cập nhật trạng thái đăng nhập
  }

  isLoggedIn(): boolean {
    const loggedIn = !!localStorage.getItem('jwt');
    console.log('isLoggedIn called:', loggedIn); // Log để debug
    return loggedIn;
  }

  isAdmin(): boolean {
    const profile = this.userProfileSubject.value;
    return profile?.role === 'ADMIN';
  }
}