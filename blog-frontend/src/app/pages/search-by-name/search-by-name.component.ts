import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PostService } from 'src/app/service/post/post.service';

@Component({
  selector: 'app-search-by-name',
  templateUrl: './search-by-name.component.html',
  styleUrls: ['./search-by-name.component.scss']
})
export class SearchByNameComponent {
  result: any[] = [];
  name: string = "";
  errorMsg: string = "";

  constructor(
    private postService: PostService,
    private snackBar: MatSnackBar
  ) {}

  searchByName(): void {
    this.errorMsg = "";
    this.result = [];

    if (!this.name || this.name.trim().length === 0) {
      this.errorMsg = "Please enter a keyword to search.";
      return;
    }

    this.postService.searchByName(this.name.trim()).subscribe(
      (res: any) => {
        this.result = Array.isArray(res) ? res : [res];
      },
      (err) => {
        if (err.status === 400) {
          this.errorMsg = err.error || "Invalid search term.";
        } else {
          this.snackBar.open("Something went wrong!!! " + (err.error || err.message), "Ok");
        }
      }
    );
  }
}