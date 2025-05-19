import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'src/app/config/enviroment';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: { username: string, email: string, role: string } | null = null;
  isLoading = true;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    const token = localStorage.getItem('jwt');
    if (!token) {
      this.snackBar.open('Vui lòng đăng nhập', 'OK', { duration: 3000 });
      this.isLoading = false;
      return;
    }

    this.http.get<{ username: string, email: string, role: string }>(`${environment.apiBaseUrl}/profile`).subscribe({
      next: (user) => {
        this.user = user;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Lỗi tải hồ sơ:', err);
        this.snackBar.open('Không thể tải hồ sơ', 'OK', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }
}