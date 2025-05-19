import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { ActivityService } from 'src/app/service/activity/activity.service';
import { CommentService } from 'src/app/service/comment/comment.service';
import { PostService } from 'src/app/service/post/post.service';
import { UserService } from 'src/app/service/user/user.service';


@Component({
  selector: 'app-view-post',
  templateUrl: './view-post.component.html',
  styleUrls: ['./view-post.component.scss']
})
export class ViewPostComponent implements OnInit {
  postId = this.activatedRoute.snapshot.params['id'];
  postData: any;
  comments: any[] = []; 
  commentForm!: FormGroup;
  showComments: boolean = true;
  currentUser: User | null = null;

  constructor(
    private postService: PostService,
    private activatedRoute: ActivatedRoute,
    private matSnackBar: MatSnackBar,
    private fb: FormBuilder,
    private commentService: CommentService,
    private activityService: ActivityService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.commentForm = this.fb.group({
      content: [null, Validators.required],
      postedBy: [{ value: null, disabled: true }] // Vô hiệu hóa input, lấy từ currentUser
    });
    this.loadCurrentUser();
    this.getPostbyId();
  }

  loadCurrentUser(): void {
    const token = localStorage.getItem('jwt');
    if (token) {
      this.userService.getProfile().subscribe({
        next: (user: User) => {
          this.currentUser = user;
          this.commentForm.patchValue({ postedBy: user.username });
        },
        error: (err) => {
          console.error('Lỗi tải thông tin người dùng:', err);
          this.matSnackBar.open('Không thể tải thông tin người dùng', 'OK', { duration: 3000 });
        }
      });
    }
  }

  getPostbyId(): void {
    this.postService.getPostbyId(this.postId).subscribe({
      next: (res) => {
        this.postData = res;
        this.postData.likeCounts = this.postData.likeCounts || 0;
        this.postData.viewCounts = this.postData.viewCounts || 0;
        this.getCommentsByPost(); 
      },
      error: (err: HttpErrorResponse) => {
        console.error('Lỗi tải bài viết:', err);
        this.matSnackBar.open(`Không thể tải bài viết: ${err.error?.error || 'Lỗi server'}`, 'OK', { duration: 5000 });
      }
    });
  }

  getCommentsByPost(): void {
    this.commentService.getAllCommentsByPost(this.postId).subscribe({
      next: (res) => {
        this.comments = res || []; 
      },
      error: (err: HttpErrorResponse) => {
        console.error('Lỗi tải bình luận:', err);
        this.comments = []; 
        this.matSnackBar.open('Không thể tải bình luận, nhưng bạn vẫn có thể xem bài viết', 'OK', { duration: 5000 });
      }
    });
  }

  publishComment(): void {
    if (this.commentForm.invalid || !this.currentUser) {
      this.matSnackBar.open('Vui lòng điền nội dung bình luận', 'OK', { duration: 3000 });
      return;
    }

    const content = this.commentForm.get('content')?.value;
    this.commentService.createComment(this.postId, this.currentUser.username, content).subscribe({
      next: (res) => {
        this.matSnackBar.open('Bình luận được thêm thành công!', 'OK', { duration: 3000 });
        this.commentForm.reset();
        this.commentForm.patchValue({ postedBy: this.currentUser?.username });
        this.getCommentsByPost();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Lỗi thêm bình luận:', err);
        this.matSnackBar.open(`Lỗi khi thêm bình luận: ${err.error?.error || 'Lỗi server'}`, 'OK', { duration: 5000 });
      }
    });
  }

  likePost(): void {
    this.postService.likePost(this.postId).subscribe({
      next: () => {
        this.matSnackBar.open('Thích bài viết thành công!', 'OK', { duration: 3000 });
        this.getPostbyId();
      },
      error: (err) => {
        console.error('Lỗi thích bài viết:', err);
        this.matSnackBar.open(`Lỗi khi thích bài viết: ${err.error?.error || 'Lỗi server'}`, 'OK', { duration: 5000 });
      }
    });
  }

  favoritePost(): void {
    if (this.postData) {
      this.postData.favorites = (this.postData.favorites || 0) + 1;
      this.activityService.addLikedPost({
        id: this.postData.id,
        title: this.postData.name,
        excerpt: this.postData.content.length > 100 ? this.postData.content.substring(0, 100) + '...' : this.postData.content
      });
      this.matSnackBar.open('Đã thêm bài viết vào mục yêu thích!', 'OK', { duration: 3000 });
    }
  }

  savePost(): void {
    if (this.postData) {
      this.postData.isSaved = !this.postData.isSaved;
      if (this.postData.isSaved) {
        this.activityService.addSavedPost({
          id: this.postData.id,
          title: this.postData.name,
          excerpt: this.postData.content.length > 100 ? this.postData.content.substring(0, 100) + '...' : this.postData.content
        });
        this.matSnackBar.open('Đã lưu bài viết!', 'OK', { duration: 3000 });
      } else {
        this.matSnackBar.open('Đã bỏ lưu bài viết!', 'OK', { duration: 3000 });
      }
    }
  }

  toggleComments(): void {
  this.showComments = !this.showComments;
  if (this.showComments && !this.comments) {
    this.getCommentsByPost();
  }
}
}