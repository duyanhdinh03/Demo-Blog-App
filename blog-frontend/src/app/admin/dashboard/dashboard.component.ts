import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from 'src/app/service/admin/admin.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Chart } from 'chart.js/auto'; // Sử dụng import này thay vì Chart from 'chart.js/auto'
import { PageEvent } from '@angular/material/paginator';
import { catchError, forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  totalPosts: number = 0;
  totalUsers: number = 0;
  pageViews: number = 0;
  pendingPosts: number = 0;
  recentPosts: any[] = [];
  topPosts: any[] = [];
  recentPostsTotal: number = 0;
  topPostsTotal: number = 0;
  postForm!: FormGroup;
  showCreateForm: boolean = false;
  sortBy: string = 'viewCounts';
  private postsChart: Chart | undefined;
  private usersChart: Chart | undefined;
  private statusChart: Chart | undefined;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.postForm = this.fb.group({
      name: [null, Validators.required],
      content: [null, Validators.required],
      postedBy: [null, Validators.required],
      tags: [null]
    });
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.createCharts();
  }

  loadData(): void {
  this.isLoading = true;
  forkJoin({
    posts: this.adminService.getTotalPosts().pipe(catchError(err => of({ total: 0 }))),
    users: this.adminService.getTotalUsers().pipe(catchError(err => of({ total: 0 }))),
    views: this.adminService.getPageViews().pipe(catchError(err => of({ total: 0 }))),
    pending: this.adminService.getPendingPosts().pipe(catchError(err => of({ total: 0 }))),
    postsByDate: this.adminService.getPostsByDate().pipe(catchError(err => of([]))),
    usersByDate: this.adminService.getUsersByDate().pipe(
      catchError(err => {
        this.snackBar.open('Không thể tải dữ liệu người dùng theo ngày: ' + err.message, 'OK', { duration: 5000 });
        return of([]);
      })
    ),
    statusStats: this.adminService.getPostStatusStats().pipe(catchError(err => of({ approved: 0, pending: 0, overdue: 0 })))
  }).subscribe({
    next: (results) => {
      this.totalPosts = results.posts.total;
      this.totalUsers = results.users.total;
      this.pageViews = results.views.total;
      this.pendingPosts = results.pending.total;
      const postLabels = results.postsByDate.map((item: any) => item.date);
      const postData = results.postsByDate.map((item: any) => item.count);
      this.updatePostsChart(postLabels, postData);
      const userLabels = results.usersByDate.map((item: any) => item.date || 'Unknown');
      const userData = results.usersByDate.map((item: any) => item.count || 0);
      this.updateUsersChart(userLabels, userData);
      const statusLabels = ['Đã duyệt', 'Chưa duyệt', 'Quá hạn'];
      const statusData = [results.statusStats.approved, results.statusStats.pending, results.statusStats.overdue];
      this.updateStatusChart(statusLabels, statusData);
      this.isLoading = false;
    },
    error: (err) => {
      this.snackBar.open('Lỗi khi tải dữ liệu: ' + err.message, 'OK', { duration: 5000 });
      this.isLoading = false;
    }
  });
  this.loadRecentPosts();
  this.loadTopPosts();
}

  loadRecentPosts(page: number = 0): void {
    this.isLoading = true;
    this.adminService.getRecentPosts(page, 7).pipe(
      catchError(err => of({ content: [], totalPages: 0 }))
    ).subscribe(data => {
      this.recentPosts = data.content || [];
      this.recentPostsTotal = data.totalPages * 7 || 0;
      this.isLoading = false;
    });
  }

  loadTopPosts(page: number = 0): void {
    this.isLoading = true;
    this.adminService.getTopPosts(this.sortBy, page, 7).pipe(
      catchError(err => of({ content: [], totalPages: 0 }))
    ).subscribe(data => {
      this.topPosts = data.content || [];
      this.topPostsTotal = data.totalPages * 7 || 0;
      this.isLoading = false;
    });
  }

  onRecentPageChange(event: PageEvent): void {
    this.loadRecentPosts(event.pageIndex);
  }

  onTopPageChange(event: PageEvent): void {
    this.loadTopPosts(event.pageIndex);
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
  }

  addTags(event: any): void {
    const value = (event.target.value || '').split(',').map((t: string) => t.trim()).filter((t: string) => t);
    this.postForm.get('tags')?.setValue(value.join(','));
  }

  submitPost(): void {
    if (this.postForm.invalid) return;
    this.isLoading = true;
    const tags = this.postForm.get('tags')?.value ? this.postForm.get('tags')?.value.split(',').map((t: string) => t.trim()) : [];
    this.adminService.createPost(
      this.postForm.get('name')!.value,
      this.postForm.get('content')!.value,
      this.postForm.get('postedBy')!.value,
      tags
    ).pipe(
      catchError(err => {
        this.snackBar.open('Lỗi: ' + err.message, 'OK', { duration: 5000 });
        return of(null);
      })
    ).subscribe({
      next: () => {
        this.snackBar.open('Tạo bài viết thành công!', 'OK', { duration: 3000 });
        this.postForm.reset();
        this.showCreateForm = false;
        this.loadRecentPosts();
        this.isLoading = false;
      }
    });
  }

  cancelPost(): void {
    this.postForm.reset();
    this.showCreateForm = false;
  }

  viewPostDetails(postId: number): void {
    this.router.navigate([`/admin/view-post-details/${postId}`]);
  }

  approvePost(postId: number): void {
    this.isLoading = true;
    this.adminService.approvePost(postId).pipe(
      catchError(err => {
        this.snackBar.open('Lỗi khi duyệt bài viết: ' + err.message, 'OK', { duration: 5000 });
        return of(null);
      })
    ).subscribe({
      next: () => {
        this.snackBar.open('Duyệt bài viết thành công!', 'OK', { duration: 3000 });
        this.loadRecentPosts();
        this.loadTopPosts();
        this.isLoading = false;
      }
    });
  }

  getTimeAgo(date: string): string {
    const now = new Date();
    const postDate = new Date(date);
    const diffMs = now.getTime() - postDate.getTime();
    const diffMins = Math.round(diffMs / 60000);
    if (diffMins < 60) return `${diffMins} phút trước`;
    const diffHours = Math.round(diffMins / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    const diffDays = Math.round(diffHours / 24);
    return `${diffDays} ngày trước`;
  }

  private createCharts(): void {
    const postsCtx = document.getElementById('postsChart') as HTMLCanvasElement;
    const usersCtx = document.getElementById('usersChart') as HTMLCanvasElement;
    const statusCtx = document.getElementById('statusChart') as HTMLCanvasElement;

    if (postsCtx) {
      this.postsChart = new Chart(postsCtx, {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Số lượng bài viết', data: [], borderColor: '#2E6BB8', fill: false, tension: 0.4 }] },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true }, x: {} } }
      });
    }

    if (usersCtx) {
      this.usersChart = new Chart(usersCtx, {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Số người dùng mới', data: [], borderColor: '#FF6347', fill: false, tension: 0.4 }] },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true }, x: {} } }
      });
    }

    if (statusCtx) {
      this.statusChart = new Chart(statusCtx, {
        type: 'pie',
        data: { labels: ['Đã duyệt', 'Chưa duyệt', 'Quá hạn'], datasets: [{ label: 'Trạng thái bài viết', data: [0, 0, 0], backgroundColor: ['#36A2EB', '#FFCE56', '#FF6384'] }] },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }
  }

  private updatePostsChart(labels: string[], data: number[]): void {
    if (this.postsChart) {
      this.postsChart.data.labels = labels;
      this.postsChart.data.datasets[0].data = data;
      this.postsChart.update();
    }
  }

  private updateUsersChart(labels: string[], data: number[]): void {
    if (this.usersChart) {
      this.usersChart.data.labels = labels;
      this.usersChart.data.datasets[0].data = data;
      this.usersChart.update();
    }
  }

  private updateStatusChart(labels: string[], data: number[]): void {
    if (this.statusChart) {
      this.statusChart.data.labels = labels;
      this.statusChart.data.datasets[0].data = data;
      this.statusChart.update();
    }
  }

  ngOnDestroy(): void {
    if (this.postsChart) this.postsChart.destroy();
    if (this.usersChart) this.usersChart.destroy();
    if (this.statusChart) this.statusChart.destroy();
  }
}