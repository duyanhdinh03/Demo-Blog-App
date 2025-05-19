import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/app/config/enviroment';
import { User, SettingsDTO, UserProfile } from 'src/app/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<User> {
    const token = localStorage.getItem('jwt');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<User>(`${this.apiUrl}/user/profile`, { headers });
  }

  getSettings(): Observable<SettingsDTO> {
    const token = localStorage.getItem('jwt');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<SettingsDTO>(`${this.apiUrl}/user/settings`, { headers });
  }

  updateProfile(userData: Partial<User>): Observable<any> {
    const token = localStorage.getItem('jwt');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${this.apiUrl}/user/profile/update`, userData, { headers });
}

  updateAvatar(file: File): Observable<any> {
    const token = localStorage.getItem('jwt');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const formData = new FormData();
    formData.append('avatar', file);
    return this.http.post(`${this.apiUrl}/user/profile/update-avatar`, formData, { headers });
  }

  changePassword(passwordData: { currentPassword: string, newPassword: string }): Observable<any> {
    const token = localStorage.getItem('jwt');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.apiUrl}/user/profile/change-password`, passwordData, { headers });
  }

  saveSettings(settings: SettingsDTO): Observable<any> {
    const token = localStorage.getItem('jwt');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${this.apiUrl}/user/settings`, settings, { headers });
  }

  deleteAccount(): Observable<any> {
    const token = localStorage.getItem('jwt');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(`${this.apiUrl}/user/account`, { headers });
  }

  getUserByUsername(username: string): Observable<UserProfile> {
    const token = localStorage.getItem('jwt');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<UserProfile>(`${this.apiUrl}/user/${username}`, { headers });
  }
}