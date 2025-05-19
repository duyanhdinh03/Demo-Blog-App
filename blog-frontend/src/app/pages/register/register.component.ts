import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm!: FormGroup;
  errorMsg: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;
    const { username, email, password } = this.registerForm.value;

    this.authService.checkUsername(username).subscribe({
      next: (exists) => {
        if (exists) {
          this.errorMsg = 'Username đã tồn tại';
        } else {
          this.authService.register(username, email, password).subscribe({
            next: () => {
              this.snackBar.open('Đăng ký thành công! Vui lòng đăng nhập.', 'OK', { duration: 3000 });
              this.router.navigateByUrl('/login');
            },
            error: (err) => {
              this.errorMsg = err.error?.message || 'Đăng ký thất bại';
            }
          });
        }
      },
      error: (err) => {
        this.errorMsg = 'Lỗi kiểm tra username';
      }
    });
  }
}