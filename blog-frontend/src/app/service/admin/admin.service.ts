import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, shareReplay, interval } from 'rxjs';
import { UserProfile } from 'src/app/models/user.model';
import { PostDTO, PostSummary } from 'src/app/models/post.model';
import { environment } from 'src/app/config/enviroment';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService implements OnDestroy {
  private apiUrl = environment.apiBaseUrl;
  private cache: { [key: string]: Observable<any> } = {};
  private refreshSubject = new Subject<string>();
  private readonly REFRESH_INTERVAL_MS = 30 * 60 * 1000; // 30 phút = 30 * 60 * 1000 milliseconds

  constructor(private http: HttpClient, private authService: AuthService) {
    // Lắng nghe sự kiện làm mới cache từ refreshSubject
    this.refreshSubject.subscribe(cacheKey => {
      delete this.cache[cacheKey]; // Xóa cache khi nhận tín hiệu làm mới
    });

    // Tự động làm mới cache mỗi 30 phút
    interval(this.REFRESH_INTERVAL_MS).subscribe(() => {
      this.refreshAllCaches();
    });
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwt');
    return token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : new HttpHeaders();
  }

  // Làm mới cache thủ công cho một key cụ thể
  refreshCache(cacheKey: string): void {
    this.refreshSubject.next(cacheKey);
  }

  // Làm mới tất cả cache
  private refreshAllCaches(): void {
    Object.keys(this.cache).forEach(cacheKey => {
      this.refreshSubject.next(cacheKey);
    });
  }

  getAllUsers(): Observable<UserProfile[]> {
    if (!this.authService.isAdmin()) throw new Error('Chỉ admin mới có quyền truy cập');
    const cacheKey = 'getAllUsers';
    if (!this.cache[cacheKey]) {
      this.cache[cacheKey] = this.http.get<UserProfile[]>(`${this.apiUrl}/admin/users`, { headers: this.getHeaders() }).pipe(
        shareReplay(1)
      );
    }
    return this.cache[cacheKey];
  }

  getUserByUsername(username: string): Observable<UserProfile> {
    if (!this.authService.isAdmin()) throw new Error('Chỉ admin mới có quyền truy cập');
    const cacheKey = `getUserByUsername_${username}`;
    if (!this.cache[cacheKey]) {
      this.cache[cacheKey] = this.http.get<UserProfile>(`${this.apiUrl}/admin/users/${username}`, { headers: this.getHeaders() }).pipe(
        shareReplay(1)
      );
    }
    return this.cache[cacheKey];
  }

  createPost(name: string, content: string, postedBy: string, tagNames: string[]): Observable<PostDTO> {
    if (!this.authService.isAdmin()) throw new Error('Chỉ admin mới có quyền truy cập');
    const token = localStorage.getItem('jwt');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const params = { name, content, postedBy, tagNames: JSON.stringify(tagNames) };
    return this.http.post<PostDTO>(`${this.apiUrl}/api/posts/create`, params, { headers });
  }

  getRecentPosts(page: number, size: number): Observable<{ content: PostSummary[], totalPages: number }> {
    if (!this.authService.isAdmin()) throw new Error('Chỉ admin mới có quyền truy cập');
    const cacheKey = `getRecentPosts_${page}_${size}`;
    if (!this.cache[cacheKey]) {
      const token = localStorage.getItem('jwt');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.cache[cacheKey] = this.http.get<{ content: PostSummary[], totalPages: number }>(
        `${this.apiUrl}/admin/posts/recent?page=${page}&size=${size}`, { headers }
      ).pipe(
        shareReplay(1)
      );
    }
    return this.cache[cacheKey];
  }

  getTopPosts(sortBy: string, page: number, size: number): Observable<{ content: PostSummary[], totalPages: number }> {
    if (!this.authService.isAdmin()) throw new Error('Chỉ admin mới có quyền truy cập');
    const cacheKey = `getTopPosts_${sortBy}_${page}_${size}`;
    if (!this.cache[cacheKey]) {
      const token = localStorage.getItem('jwt');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.cache[cacheKey] = this.http.get<{ content: PostSummary[], totalPages: number }>(
        `${this.apiUrl}/admin/posts/top?sortBy=${sortBy}&size=${size}&page=${page}`, { headers }
      ).pipe(
        shareReplay(1)
      );
    }
    return this.cache[cacheKey];
  }

  approvePost(postId: number): Observable<PostDTO> {
    if (!this.authService.isAdmin()) throw new Error('Chỉ admin mới có quyền truy cập');
    const token = localStorage.getItem('jwt');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<PostDTO>(`${this.apiUrl}/admin/posts/${postId}/approve`, {}, { headers });
  }

  getPageViews(): Observable<{ total: number }> {
    if (!this.authService.isAdmin()) throw new Error('Chỉ admin mới có quyền truy cập');
    const cacheKey = 'getPageViews';
    if (!this.cache[cacheKey]) {
      const token = localStorage.getItem('jwt');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.cache[cacheKey] = this.http.get<{ total: number }>(`${this.apiUrl}/admin/stats/page-views`, { headers }).pipe(
        shareReplay(1)
      );
    }
    return this.cache[cacheKey];
  }

  getPendingPosts(): Observable<{ total: number }> {
    if (!this.authService.isAdmin()) throw new Error('Chỉ admin mới có quyền truy cập');
    const cacheKey = 'getPendingPosts';
    if (!this.cache[cacheKey]) {
      const token = localStorage.getItem('jwt');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.cache[cacheKey] = this.http.get<{ total: number }>(`${this.apiUrl}/admin/stats/pending-posts`, { headers }).pipe(
        shareReplay(1)
      );
    }
    return this.cache[cacheKey];
  }

  getPostStatusStats(): Observable<{ approved: number, pending: number, overdue: number }> {
    if (!this.authService.isAdmin()) throw new Error('Chỉ admin mới có quyền truy cập');
    const cacheKey = 'getPostStatusStats';
    if (!this.cache[cacheKey]) {
      const token = localStorage.getItem('jwt');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.cache[cacheKey] = this.http.get<{ approved: number, pending: number, overdue: number }>(
        `${this.apiUrl}/admin/stats/post-status`, { headers }
      ).pipe(
        shareReplay(1)
      );
    }
    return this.cache[cacheKey];
  }

  getTotalPosts(pageIndex?: number, pageSize?: number): Observable<{ total: number }> {
    if (!this.authService.isAdmin()) throw new Error('Chỉ admin mới có quyền truy cập');
    const cacheKey = 'getTotalPosts';
    if (!this.cache[cacheKey]) {
      const token = localStorage.getItem('jwt');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.cache[cacheKey] = this.http.get<{ total: number }>(`${this.apiUrl}/admin/stats/posts`, { headers }).pipe(
        shareReplay(1)
      );
    }
    return this.cache[cacheKey];
  }

  getTotalUsers(): Observable<{ total: number }> {
    if (!this.authService.isAdmin()) throw new Error('Chỉ admin mới có quyền truy cập');
    const cacheKey = 'getTotalUsers';
    if (!this.cache[cacheKey]) {
      const token = localStorage.getItem('jwt');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.cache[cacheKey] = this.http.get<{ total: number }>(`${this.apiUrl}/admin/stats/users`, { headers }).pipe(
        shareReplay(1)
      );
    }
    return this.cache[cacheKey];
  }

  getPostsByDate(): Observable<DateStatsResponse[]> {
    if (!this.authService.isAdmin()) throw new Error('Chỉ admin mới có quyền truy cập');
    const cacheKey = 'getPostsByDate';
    if (!this.cache[cacheKey]) {
      const token = localStorage.getItem('jwt');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.cache[cacheKey] = this.http.get<DateStatsResponse[]>(`${this.apiUrl}/admin/stats/posts-by-date`, { headers }).pipe(
        shareReplay(1)
      );
    }
    return this.cache[cacheKey];
  }

  getUsersByDate(): Observable<DateStatsResponse[]> {
    if (!this.authService.isAdmin()) throw new Error('Chỉ admin mới có quyền truy cập');
    const cacheKey = 'getUsersByDate';
    if (!this.cache[cacheKey]) {
      const token = localStorage.getItem('jwt');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.cache[cacheKey] = this.http.get<DateStatsResponse[]>(`${this.apiUrl}/admin/stats/users-by-date`, { headers }).pipe(
        shareReplay(1)
      );
    }
    return this.cache[cacheKey];
  }

  getAllPosts(page: number, size: number): Observable<{ content: PostDTO[], totalElements: number }> {
    if (!this.authService.isAdmin()) throw new Error('Chỉ admin mới có quyền truy cập');
    const cacheKey = `getAllPosts_${page}_${size}`;
    if (!this.cache[cacheKey]) {
      const token = localStorage.getItem('jwt');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.cache[cacheKey] = this.http.get<{ content: PostDTO[], totalElements: number }>(
        `${this.apiUrl}/admin/posts?page=${page}&size=${size}`, { headers }
      ).pipe(
        shareReplay(1)
      );
    }
    return this.cache[cacheKey];
  }

  // Hủy bỏ interval khi service bị destroy
  ngOnDestroy(): void {
    this.refreshSubject.complete();
  }
}

interface DateStatsResponse {
  date: string;
  count: number;
}