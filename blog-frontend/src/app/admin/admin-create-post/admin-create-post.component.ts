import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AdminService } from 'src/app/service/admin/admin.service';

@Component({
  selector: 'app-admin-create-post',
  templateUrl: './admin-create-post.component.html',
  styleUrls: ['./admin-create-post.component.scss']
})
export class AdminCreatePostComponent implements OnInit {
  postForm!: FormGroup;
  tags: string[] = [];

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private matSnackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.postForm = this.fb.group({
      name: [null, Validators.required],
      content: [null, Validators.required],
      postedBy: [null, Validators.required],
      tags: [null]
    });
  }

  addTags(event: any): void {
    const value = (event.target.value || '').split(',').map((t: string) => t.trim()).filter((t: any) => t);
    this.tags = value;
    this.postForm.get('tags')?.setValue(value.join(','));
  }

  createPost(): void {
    if (this.postForm.invalid) {
      this.matSnackBar.open('Vui lòng điền đầy đủ thông tin', 'OK', { duration: 3000 });
      return;
    }

    this.adminService.createPost(
      this.postForm.get('name')!.value,
      this.postForm.get('content')!.value,
      this.postForm.get('postedBy')!.value,
      this.tags
    ).subscribe({
      next: (res: any) => {
        this.matSnackBar.open('Tạo bài viết thành công! Chờ duyệt nếu cần.', 'OK', { duration: 3000 });
        this.postForm.reset();
        this.tags = [];
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err: { message: string; }) => {
        this.matSnackBar.open('Lỗi khi tạo bài viết: ' + err.message, 'OK', { duration: 5000 });
      }
    });
  }

  cancel(): void {
    this.postForm.reset();
    this.tags = [];
    this.router.navigate(['/admin/dashboard']);
  }
}