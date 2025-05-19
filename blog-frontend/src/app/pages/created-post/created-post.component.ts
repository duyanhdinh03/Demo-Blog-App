import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { PostService } from 'src/app/service/post/post.service';
import { PostRequest } from 'src/app/models/post.model';
import { environment } from 'src/app/config/enviroment';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';

@Component({
  selector: 'app-created-post',
  templateUrl: './created-post.component.html',
  styleUrls: ['./created-post.component.scss']
})
export class CreatedPostComponent implements OnInit, OnDestroy {
  postForm!: FormGroup;
  tags: string[] = [];
  availableTags: string[] = [];
  editor!: Editor;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private postService: PostService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.postForm = this.fb.group({
      name: [null, [Validators.required, Validators.pattern(/\S+/)]]
    });

    this.editor = new Editor({
      element: document.querySelector('.tiptap') as HTMLElement,
      extensions: [
        StarterKit,
        Image.configure({
          inline: true,
          allowBase64: true
        })
      ],
      content: ''
    });

    this.http.get<{ id: number; name: string }[]>(`${environment.apiBaseUrl}/tags`).subscribe({
      next: (tags) => {
        this.availableTags = tags.map(tag => tag.name);
      },
      error: (err: any) => {
        console.error('Lỗi tải tags:', err);
        this.snackBar.open('Không thể tải danh sách tags', 'OK', { duration: 3000 });
      }
    });
  }

  ngOnDestroy() {
    if (this.editor) {
      this.editor.destroy();
    }
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        this.editor.chain().focus().setImage({ src: base64 }).run();
      };
      reader.readAsDataURL(file);
    }
  }

  add(event: any) {
    const value = (event.value || '').trim();
    if (value && !this.tags.includes(value)) {
      this.tags.push(value);
    }
    event.chipInput!.clear();
  }

  remove(tag: any) {
    const index = this.tags.indexOf(tag);
    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  createPost(): void {
    if (this.postForm.invalid || !this.editor.getHTML()) {
      this.snackBar.open('Vui lòng điền tiêu đề và nội dung', 'OK', { duration: 3000 });
      return;
    }

    const token = localStorage.getItem('jwt');
    if (!token) {
      this.snackBar.open('Bạn cần đăng nhập để tạo bài viết', 'OK', { duration: 3000 });
      this.router.navigateByUrl('/login');
      return;
    }

    const postData: PostRequest = {
      name: this.postForm.get('name')?.value,
      content: this.editor.getHTML(),
      tagNames: this.tags.filter(tag => tag && tag.trim().length > 0) // Loại bỏ tag rỗng
    };

    console.log('Dữ liệu gửi đi:', postData); // Ghi log để kiểm tra

    this.postService.createPost(postData).subscribe({
      next: () => {
        this.snackBar.open('Bài viết được tạo thành công!', 'OK', { duration: 3000 });
        this.router.navigateByUrl('/view-all');
        this.postForm.reset();
        this.tags = [];
        this.editor.commands.clearContent();
      },
      error: (err: any) => {
        console.error('Lỗi tạo bài viết:', err);
        const errorMessage = err.error?.error || err.error?.message || 'Tạo bài viết thất bại. Vui lòng thử lại.';
        this.snackBar.open(errorMessage, 'OK', { duration: 5000 });
      }
    });
  }
}