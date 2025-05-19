import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { environment } from 'src/app/config/enviroment';
import { PostRequest } from 'src/app/models/post.model';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiBaseUrl = environment.apiBaseUrl;
  private cache: { [key: string]: Observable<any> } = {};
  constructor(private http: HttpClient) { }
  createPost(postData: PostRequest): Observable<any> {
    const formData = new FormData();
    formData.append('name', postData.name);
    formData.append('content', postData.content);
    if (postData.tagNames && postData.tagNames.length > 0) {
      formData.append('tagNames', postData.tagNames.join(','));
    }
    return this.http.post(`${this.apiBaseUrl}/user/posts/create`, formData);
  }

  getAllPosts(params: any): Observable<any> {
    let cacheKey = Object.keys(params).sort().map(key => `${key}=${params[key]}`).join('&');
    if (!this.cache[cacheKey]) {
      let httpParams = new HttpParams();
      Object.keys(params).forEach(key => {
        if (params[key]) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
      httpParams = httpParams.set('status', 'APPROVED');
      this.cache[cacheKey] = this.http.get(`${this.apiBaseUrl}/posts`, { params: httpParams }).pipe(
        shareReplay(1)
      );
    }
    return this.cache[cacheKey];
  }

  searchByName(name: string): Observable<any> {
    return this.http.get(`${this.apiBaseUrl}/posts/search`, { params: { name } });
  }


  updatePost(id: number, post: any): Observable<any> {
    return this.http.put(`${this.apiBaseUrl}/posts/${id}`, post);
  }

  deletePost(id: number): Observable<any> {
    return this.http.delete(`${this.apiBaseUrl}/posts/${id}`);
  }

  getPostbyId(id: number): Observable<any> {
    return this.http.get(`${this.apiBaseUrl}/posts/${id}`);
  }

  likePost(id: number): Observable<any> {
    return this.http.post(`${this.apiBaseUrl}/posts/${id}/like`, {});
  }
}