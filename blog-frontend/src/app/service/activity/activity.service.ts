import { Injectable } from '@angular/core';

export interface Post {
  id: number;
  title: string;
  excerpt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private likedPosts: Post[] = [];
  private savedPosts: Post[] = [];
  private recentlyViewed: Post[] = [];

  constructor() {
    // Khởi tạo dữ liệu giả lập nếu cần
    this.likedPosts = [
      { id: 1, title: 'Bài viết 1', excerpt: 'Đây là bài viết bạn đã thích...' },
      { id: 2, title: 'Bài viết 2', excerpt: 'Một bài viết thú vị khác...' }
    ];
    this.savedPosts = [
      { id: 3, title: 'Bài viết 3', excerpt: 'Bài viết bạn đã lưu để đọc sau...' }
    ];
    this.recentlyViewed = [];
  }

  getLikedPosts(): Post[] {
    return this.likedPosts;
  }

  addLikedPost(post: Post): void {
    if (!this.likedPosts.some(p => p.id === post.id)) {
      this.likedPosts.push(post);
    }
  }

  getSavedPosts(): Post[] {
    return this.savedPosts;
  }

  addSavedPost(post: Post): void {
    if (!this.savedPosts.some(p => p.id === post.id)) {
      this.savedPosts.push(post);
    }
  }

  getRecentlyViewed(): Post[] {
    return this.recentlyViewed;
  }

  addRecentlyViewed(post: Post): void {
    // Xóa bài viết nếu đã tồn tại để tránh trùng lặp
    this.recentlyViewed = this.recentlyViewed.filter(p => p.id !== post.id);
    // Thêm bài viết vào đầu danh sách
    this.recentlyViewed.unshift(post);
    // Giới hạn tối đa 5 bài viết
    if (this.recentlyViewed.length > 5) {
      this.recentlyViewed.pop();
    }
  }
}