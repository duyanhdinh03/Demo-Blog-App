import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/app/config/enviroment';

@Injectable({
  providedIn: 'root'
})
export class TagService {
  private apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getAllTags(): Observable<any> {
    return this.http.get(`${this.apiBaseUrl}/tags`);
  }

  createTag(tag: any): Observable<any> {
    return this.http.post(`${this.apiBaseUrl}/tags`, tag);
  }

  updateTag(id: number, tag: any): Observable<any> {
    return this.http.put(`${this.apiBaseUrl}/tags/${id}`, tag);
  }

  deleteTag(id: number): Observable<any> {
    return this.http.delete(`${this.apiBaseUrl}/tags/${id}`);
  }
}