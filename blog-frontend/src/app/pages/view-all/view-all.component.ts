import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PostService } from 'src/app/service/post/post.service';
import { TagService } from 'src/app/service/tag/tag.service';
import { Post, Tag } from 'src/app/models/post.model';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { UserService } from 'src/app/service/user/user.service';
import { Observable, BehaviorSubject, forkJoin } from 'rxjs';
import { User, UserProfile } from 'src/app/models/user.model';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-view-all',
  templateUrl: './view-all.component.html',
  styleUrls: ['./view-all.component.scss']
})
export class ViewAllComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  allPosts: { content: Post[], totalElements: number, totalPages: number } = { content: [], totalElements: 0, totalPages: 0 };
  featuredPosts: Post[] = [];
  latestPosts: Post[] = [];
  featuredSlides: Post[][] = []; // Mảng các nhóm 5 bài viết cho Featured Posts
  latestSlides: Post[][] = [];   // Mảng các nhóm 5 bài viết cho Latest Posts
  tags: Tag[] = [];
  selectedTag: string | null = null;
  isLoading = true;
  pageSize = 12;
  pageIndex = 0;
  sortMode: string = 'newest';
  searchTerm: string = '';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  private userAvatars: { [key: string]: string } = {};

  constructor(
    private postService: PostService,
    private tagService: TagService,
    private snackBar: MatSnackBar,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadTags();
    this.loadFeaturedPosts();
    this.loadLatestPosts();
    this.loadPosts();
    this.loadCurrentUser();
  }

  // Hàm tạo các nhóm 5 bài viết để hiển thị trong slider
  createSlides(posts: Post[]): Post[][] {
    if (posts.length === 0) return [];
    const slides: Post[][] = [];
    const numPosts = posts.length; // Số bài viết (tối đa 6)
    for (let i = 0; i < numPosts; i++) {
      const slide: Post[] = [];
      for (let j = 0; j < 5; j++) {
        const index = (i + j) % numPosts; // Lặp vòng qua danh sách bài viết
        slide.push(posts[index]);
      }
      slides.push(slide);
    }
    return slides;
  }

  sanitizeContent(content: string): string {
    return content.replace(/src="\/(z|nope)"/g, 'src="assets/default-image.png"');
  }

  loadCurrentUser(): void {
    const token = localStorage.getItem('jwt');
    if (token) {
      this.userService.getProfile().subscribe({
        next: (user: User) => {
          this.currentUserSubject.next(user);
        },
        error: (err: any) => {
          console.error('Lỗi tải thông tin người dùng:', err);
          this.snackBar.open('Không thể tải thông tin người dùng', 'OK', { duration: 3000 });
        }
      });
    }
  }

  loadFeaturedPosts(): void {
    this.postService.getAllPosts({ page: 0, size: 100 }).subscribe({
      next: (res: any) => {
        const posts: Post[] = res.content.map((post: Post) => ({
          ...post,
          content: this.sanitizeContent(post.content),
          tags: post.tags || [],
          tagNames: post.tags && post.tags.length > 0 
            ? post.tags.map((tag: Tag) => tag.name).join(', ') 
            : 'Không có tags'
        }));
        const currentTime = new Date().getTime();
        const scoredPosts = posts.map(post => {
          const postDate = post.date ? new Date(post.date).getTime() : currentTime;
          const daysSinceCreation = Math.max((currentTime - postDate) / (1000 * 60 * 60 * 24), 1);
          const score = ((post.viewCounts ?? 0) + (post.likeCounts ?? 0)) / daysSinceCreation;
          return { ...post, score };
        });
        this.featuredPosts = scoredPosts.sort((a, b) => b.score - a.score).slice(0, 6); // Lấy top 6
        this.featuredSlides = this.createSlides(this.featuredPosts); // Tạo các nhóm 5 bài viết
        this.loadUserAvatars(this.featuredPosts);
      },
      error: (err: any) => {
        console.error('Lỗi tải bài viết nổi bật:', err);
        this.snackBar.open('Không thể tải bài viết nổi bật', 'OK', { duration: 3000 });
      }
    });
  }

  loadLatestPosts(): void {
    const params = { page: 0, size: 6, sort: 'date,desc' }; // Lấy top 6 bài mới nhất
    this.postService.getAllPosts(params).subscribe({
      next: (res: any) => {
        this.latestPosts = res.content.map((post: Post) => ({
          ...post,
          content: this.sanitizeContent(post.content),
          tags: post.tags || [],
          tagNames: post.tags && post.tags.length > 0 
            ? post.tags.map((tag: Tag) => tag.name).join(', ') 
            : 'Không có tags'
        }));
        this.latestSlides = this.createSlides(this.latestPosts); // Tạo các nhóm 5 bài viết
        this.loadUserAvatars(this.latestPosts);
      },
      error: (err: any) => {
        console.error('Lỗi tải bài viết mới nhất:', err);
        this.snackBar.open('Không thể tải bài viết mới nhất', 'OK', { duration: 3000 });
      }
    });
  }

  filterByTag(tag: Tag): void {
    this.selectedTag = this.selectedTag === tag.name ? null : tag.name;
    this.pageIndex = 0;
    this.loadPosts();
  }

  clearFilter(): void {
    this.selectedTag = null;
    this.pageIndex = 0;
    this.loadPosts();
  }

  onSortChange(): void {
    this.pageIndex = 0;
    this.loadPosts();
  }

  loadPosts(): void {
    this.isLoading = true;
    const params: any = { page: this.pageIndex, size: this.pageSize };

    if (this.selectedTag) params.tag = this.selectedTag; // Lọc theo tag

    switch (this.sortMode) {
      case 'newest': params.sort = 'date,desc'; break;
      case 'mostLikes': params.sort = 'likeCounts,desc'; break;
      case 'mostViews': params.sort = 'viewCounts,desc'; break;
    }

    this.postService.getAllPosts(params).subscribe({
      next: (res: any) => {
        this.allPosts = {
          content: res.content.map((post: Post) => ({
            ...post,
            content: this.sanitizeContent(post.content),
            tags: post.tags || [],
            tagNames: post.tags && post.tags.length > 0 
              ? post.tags.map((tag: Tag) => tag.name).join(', ') 
              : 'Không có tags'
          })),
          totalElements: res.totalElements,
          totalPages: res.totalPages
        };
        this.loadUserAvatars(this.allPosts.content);
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Lỗi tải bài viết:', err);
        this.snackBar.open('Không thể tải bài viết', 'OK', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  loadUserAvatars(posts: Post[]): void {
    const uniquePosters = [...new Set(posts.map(post => post.postedBy))].filter(username => username !== 'Admin');
    const requests = uniquePosters.map(username => 
      this.userService.getUserByUsername(username).pipe(
        map((profile: UserProfile) => profile.username === username ? profile : null),
        catchError(() => of(null))
      )
    );
    forkJoin(requests).subscribe({
      next: (profiles: (UserProfile | null)[]) => {
        profiles.forEach(profile => {
          if (profile) {
            this.userAvatars[profile.username] = profile.avatarUrl || 'https://picsum.photos/40/40';
          }
        });
        this.updatePostAvatars(posts);
      },
      error: (err: any) => {
        console.error('Lỗi tải avatar của người dùng:', err);
        this.updatePostAvatars(posts);
      }
    });
  }

  updatePostAvatars(posts: Post[]): void {
    posts.forEach(post => {
      post.avatarUrl = this.userAvatars[post.postedBy] || 'https://picsum.photos/40/40';
    });
  }

  loadTags(): void {
    this.tagService.getAllTags().subscribe({
      next: (tags: Tag[]) => this.tags = tags,
      error: (err: any) => {
        console.error('Lỗi tải tags:', err);
        this.snackBar.open('Không thể tải tags', 'OK', { duration: 3000 });
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadPosts();
  }

  searchByName(): void {
    if (this.searchTerm && this.searchTerm.trim().length > 0) {
      this.postService.searchByName(this.searchTerm.trim()).subscribe({
        next: (res: any) => {
          this.allPosts.content = res.map((post: Post) => ({
            ...post,
            content: this.sanitizeContent(post.content),
            tags: post.tags || [],
            tagNames: post.tags && post.tags.length > 0 
              ? post.tags.map((tag: Tag) => tag.name).join(', ') 
              : 'Không có tags'
          }));
          this.allPosts.totalElements = res.length;
          this.allPosts.totalPages = 1;
          this.loadUserAvatars(this.allPosts.content);
          this.isLoading = false;
        },
        error: (err: any) => {
          console.error('Lỗi tìm kiếm:', err);
          this.snackBar.open('Không thể tìm kiếm', 'OK', { duration: 3000 });
          this.isLoading = false;
        }
      });
    }
  }
}