import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse, HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from 'src/app/service/auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { environment } from 'src/app/config/enviroment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  errorMsg: string = '';
  private profileSubscription: Subscription | undefined;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }
    const { username, password } = this.loginForm.value;
    this.authService.login(username, password).subscribe({
      next: (response) => {
        const token = response.token;
        // Gọi API check-role để xác định vai trò
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        this.http.get(`${environment.apiBaseUrl}/admin/check-role`, { headers }).subscribe({
          next: () => {
            console.log('User is admin, redirecting to /admin/dashboard');
            this.router.navigate(['/admin/dashboard']).then(() => {
              this.snackBar.open('Đăng nhập thành công! Chào mừng Admin!', 'OK', { duration: 3000 });
            });
          },
          error: (err) => {
            console.log('User is not admin, redirecting to /view-all');
            this.authService.getProfile().subscribe({
              next: () => {
                this.router.navigate(['/view-all']).then(() => {
                  this.snackBar.open('Đăng nhập thành công!', 'OK', { duration: 3000 });
                });
              },
              error: (profileErr: HttpErrorResponse) => {
                this.errorMsg = 'Lỗi khi lấy thông tin người dùng: ' + (profileErr.error.message || 'Vui lòng thử lại');
                this.snackBar.open(this.errorMsg, 'OK', { duration: 5000 });
                this.authService.logout();
              }
            });
          }
        });
      },
      error: (err: HttpErrorResponse) => {
        this.errorMsg = err.error.message || 'Tên đăng nhập hoặc mật khẩu không đúng';
        this.snackBar.open(this.errorMsg, 'OK', { duration: 5000 });
      }
    });
  }

  ngOnDestroy(): void {
    if (this.profileSubscription) {
      this.profileSubscription.unsubscribe();
    }
  }
}