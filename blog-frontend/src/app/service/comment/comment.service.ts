import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/app/config/enviroment';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiBaseUrl = environment.apiBaseUrl;
  private cache: { [key: string]: Observable<any> } = {};
  constructor(private http:HttpClient) { }
  
  
  createComment(postId: number, postedBy: string, content: string): Observable<any> {
    const formData = new FormData();
    formData.append('postId', postId.toString());
    formData.append('postedBy', postedBy.toString());
    formData.append('content', content);
    return this.http.post(`${this.apiBaseUrl}/user/comments/create`, formData);
  }

  getAllCommentsByPost(postId: number): Observable<any> {
    const cacheKey = `comments_${postId}`;
    if (!this.cache[cacheKey]) {
      this.cache[cacheKey] = this.http.get(`${this.apiBaseUrl}/user/comments/${postId}`).pipe(
        shareReplay(1)
      );
    }
    return this.cache[cacheKey];
  }
}
