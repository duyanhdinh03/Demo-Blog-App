import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/app/config/enviroment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { catchError, of } from 'rxjs';

interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
  role: string;
}

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  displayedColumns: string[] = ['id', 'username', 'email', 'createdAt', 'role', 'actions'];
  users: User[] = [];
  showUserForm: boolean = false;
  userForm!: FormGroup;
  isLoading: boolean = false;

  constructor(private http: HttpClient, private snackBar: MatSnackBar, private fb: FormBuilder) {
    this.userForm = this.fb.group({
      username: [null, Validators.required],
      password: [null, Validators.required],
      email: [null, [Validators.required, Validators.email]],
      role: ['USER', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    const token = localStorage.getItem('jwt');
    const headers = token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : undefined;

    this.http.get<User[]>(`${environment.apiBaseUrl}/admin/users`, { headers }).pipe(
      catchError(err => {
        this.snackBar.open('Lỗi khi lấy danh sách người dùng: ' + err.message, 'OK', { duration: 5000 });
        return of([]);
      })
    ).subscribe(data => {
      this.users = data.filter(user => user.role !== 'ADMIN');
      this.isLoading = false;
    });
  }

  deleteUser(userId: number): void {
    this.isLoading = true;
    const token = localStorage.getItem('jwt');
    const headers = token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : undefined;

    this.http.delete(`${environment.apiBaseUrl}/admin/users/${userId}`, { headers }).pipe(
      catchError(err => {
        this.snackBar.open('Lỗi khi xóa người dùng: ' + err.message, 'OK', { duration: 5000 });
        return of(null);
      })
    ).subscribe({
      next: () => {
        this.users = this.users.filter(user => user.id !== userId);
        this.snackBar.open('Xóa người dùng thành công', 'OK', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  toggleRole(userId: number, currentRole: string): void {
    this.isLoading = true;
    const newRole = currentRole === 'USER' ? 'STAFF' : 'USER';
    const token = localStorage.getItem('jwt');
    const headers = token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : undefined;

    this.http.put(`${environment.apiBaseUrl}/admin/users/${userId}/role`, { role: newRole }, { headers }).pipe(
      catchError(err => {
        this.snackBar.open('Lỗi khi thay đổi quyền: ' + err.message, 'OK', { duration: 5000 });
        return of(null);
      })
    ).subscribe({
      next: () => {
        this.users = this.users.map(user => user.id === userId ? { ...user, role: newRole } : user);
        this.snackBar.open(`Đã thay đổi quyền thành ${newRole}`, 'OK', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  toggleUserForm(): void {
    this.showUserForm = !this.showUserForm;
    if (!this.showUserForm) this.userForm.reset();
  }

  createUser(): void {
    if (this.userForm.invalid) return;
    this.isLoading = true;
    const token = localStorage.getItem('jwt');
    const headers = token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : undefined;

    this.http.post(`${environment.apiBaseUrl}/admin/users`, {
      username: this.userForm.get('username')!.value,
      password: this.userForm.get('password')!.value,
      email: this.userForm.get('email')!.value,
      role: this.userForm.get('role')!.value
    }, { headers }).pipe(
      catchError(err => {
        this.snackBar.open('Lỗi khi thêm người dùng: ' + err.message, 'OK', { duration: 5000 });
        return of(null);
      })
    ).subscribe({
      next: () => {
        this.snackBar.open('Thêm người dùng thành công', 'OK', { duration: 3000 });
        this.toggleUserForm();
        this.loadUsers();
        this.isLoading = false;
      }
    });
  }
}