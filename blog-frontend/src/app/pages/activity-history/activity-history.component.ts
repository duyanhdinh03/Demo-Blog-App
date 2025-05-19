import { Component } from '@angular/core';

@Component({
  selector: 'app-activity-history',
  templateUrl: './activity-history.component.html',
  styleUrls: ['./activity-history.component.scss']
})
export class ActivityHistoryComponent {
  likedPosts = [
    { title: 'Bài viết 1', excerpt: 'Đây là bài viết bạn đã thích...' },
    { title: 'Bài viết 2', excerpt: 'Một bài viết thú vị khác...' }
  ];

  savedPosts = [
    { title: 'Bài viết 3', excerpt: 'Bài viết bạn đã lưu để đọc sau...' }
  ];
recentlyViewed: any;
}