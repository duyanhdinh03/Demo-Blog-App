import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/app/config/enviroment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { PostDTO } from 'src/app/models/post.model';
import { AdminService } from 'src/app/service/admin/admin.service';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss']
})
export class PostsComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'postedBy', 'date', 'status', 'actions'];
  dataSource = new MatTableDataSource<PostDTO>();
  totalItems: number = 0;
  pageSize: number = 5;
  pageIndex: number = 0;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.adminService.getAllPosts(this.pageIndex, this.pageSize).subscribe({
      next: (response: any) => {
        console.log('Dữ liệu bài viết:', response.content); // Log để kiểm tra
        this.dataSource.data = response.content;
        this.totalItems = response.totalElements || response.length;
      },
      error: (err) => {
        console.error('Lỗi tải bài viết:', err);
        this.snackBar.open('Lỗi khi tải bài viết: ' + err.message, 'OK', { duration: 5000 });
      }
    });
  }

  deletePost(postId: number): void {
    const token = localStorage.getItem('jwt');
    const headers = token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : undefined;

    this.http.delete(`${environment.apiBaseUrl}/admin/posts/${postId}`, { headers }).subscribe({
      next: () => {
        this.snackBar.open('Xóa bài viết thành công', 'OK', { duration: 3000 });
        this.loadPosts(); // Tải lại danh sách sau khi xóa
      },
      error: (err) => {
        this.snackBar.open('Lỗi khi xóa bài viết: ' + err.message, 'OK', { duration: 5000 });
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadPosts();
  }
}