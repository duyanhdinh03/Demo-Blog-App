import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from 'src/app/service/user/user.service';
import { User, SettingsDTO } from 'src/app/models/user.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  user: User | null = null;
  selectedLanguage = 'vi';
  settings: SettingsDTO = { postsPerPage: 10, homepagePreference: 'newest' };
  avatarUrl: string | null = null;
  activeTab: string = 'profile';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    public translate: TranslateService,
    private userService: UserService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      fullName: [''],
      address: [''],
      email: ['', [Validators.required, Validators.email]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.translate.addLangs(['en', 'vi']);
    this.translate.setDefaultLang('vi');
    this.translate.use(this.selectedLanguage);
    this.loadProfile();
    this.loadSettings();
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { mismatch: true };
  }

  loadProfile(): void {
    const token = localStorage.getItem('jwt');
    if (!token) {
      this.snackBar.open(this.translate.instant('settings.pleaseLogin'), 'OK', { duration: 3000 });
      return;
    }
    this.userService.getProfile().subscribe({
      next: (user: User) => {
        this.user = user;
        this.profileForm.patchValue({
          fullName: user.fullName || '',
          address: user.address || '',
          email: user.email || ''
        });
        this.avatarUrl = user.avatarUrl || null;
      },
      error: (err: any) => {
        this.snackBar.open(this.translate.instant('settings.loadProfileError'), 'OK', { duration: 3000 });
      }
    });
  }

  loadSettings(): void {
    const token = localStorage.getItem('jwt');
    if (!token) {
      this.snackBar.open(this.translate.instant('settings.pleaseLogin'), 'OK', { duration: 3000 });
      return;
    }
    this.userService.getSettings().subscribe({
      next: (settings: SettingsDTO) => {
        this.settings = settings;
      },
      error: (err: any) => {
        this.snackBar.open(this.translate.instant('settings.loadSettingsError'), 'OK', { duration: 3000 });
        this.settings = { postsPerPage: 10, homepagePreference: 'newest' };
      }
    });
  }

  updateProfile(): void {
    if (this.profileForm.valid) {
      this.userService.updateProfile(this.profileForm.value).subscribe({
        next: () => {
          this.snackBar.open(this.translate.instant('settings.profileUpdated'), 'OK', { duration: 3000 });
          this.loadProfile();
        },
        error: (err: any) => {
          this.snackBar.open(this.translate.instant('settings.updateProfileError'), 'OK', { duration: 3000 });
        }
      });
    }
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.userService.updateAvatar(file).subscribe({
        next: (response: any) => {
          this.avatarUrl = response.avatarUrl;
          this.snackBar.open(this.translate.instant('settings.avatarUpdated'), 'OK', { duration: 3000 });
          this.loadProfile();
        },
        error: (err: any) => {
          this.snackBar.open(this.translate.instant('settings.avatarUpdateError'), 'OK', { duration: 3000 });
        }
      });
    }
  }

  changePassword(): void {
    if (this.passwordForm.valid && confirm(this.translate.instant('settings.confirmChangePassword'))) {
        const passwordData = {
            currentPassword: this.passwordForm.value.currentPassword,
            newPassword: this.passwordForm.value.newPassword
        };
        console.log('Password data sent:', passwordData);
        this.userService.changePassword(passwordData).subscribe({
            next: (response: any) => {
                console.log('Password changed successfully:', response);
                this.snackBar.open(this.translate.instant('settings.passwordChanged'), 'OK', { duration: 3000 });
                this.passwordForm.reset();
            },
            error: (err: any) => {
                console.log('Change password error:', err);
                const errorMessage = err.error?.message || this.translate.instant('settings.changePasswordError');
                this.snackBar.open(errorMessage, 'OK', { duration: 3000 });
            }
        });
    }
}

  resetPasswordForm(): void {
    this.passwordForm.reset();
  }

  changeLanguage(): void {
    this.translate.use(this.selectedLanguage);
  }

  saveSettings(): void {
    this.userService.saveSettings(this.settings).subscribe({
      next: () => {
        localStorage.setItem('settings', JSON.stringify(this.settings));
        this.snackBar.open(this.translate.instant('settings.settingsSaved'), 'OK', { duration: 3000 });
      },
      error: (err: any) => {
        this.snackBar.open(this.translate.instant('settings.saveSettingsError'), 'OK', { duration: 3000 });
      }
    });
  }

  deleteAccount(): void {
    if (confirm(this.translate.instant('settings.confirmDelete'))) {
      this.userService.deleteAccount().subscribe({
        next: () => {
          this.snackBar.open(this.translate.instant('settings.deleteRequestSent'), 'OK', { duration: 3000 });
          localStorage.removeItem('jwt');
          this.router.navigateByUrl('/login');
        },
        error: (err: any) => {
          this.snackBar.open(this.translate.instant('settings.deleteRequestSent'), 'OK', { duration: 3000 });
        }
      });
    }
  }
}