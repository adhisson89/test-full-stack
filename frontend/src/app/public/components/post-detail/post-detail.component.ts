import {Component, OnInit, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {Apollo, gql} from 'apollo-angular';
import {catchError, map} from 'rxjs/operators';
import {of} from 'rxjs';
import {PostRequest} from '../../../interface/requests/PostRequest';


@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="post-detail-container">
      <button class="back-button" routerLink="/public">← Back to Posts</button>

      <div *ngIf="loading" class="loading">Loading...</div>
      <div *ngIf="error" class="error">{{ error }}</div>

      <div class="post-content" *ngIf="!loading && !error && post">
        <h1>{{ post.title }}</h1>
        <div class="content">
          {{ post.content }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .post-detail-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    .back-button {
      background-color: transparent;
      border: none;
      color: #007bff;
      cursor: pointer;
      padding: 0;
      font-size: 16px;
      margin-bottom: 20px;
    }

    .post-content {
      border: 1px solid #eee;
      border-radius: 5px;
      padding: 20px;
    }

    h1 {
      margin-top: 0;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
    }

    .content {
      line-height: 1.6;
      white-space: pre-line;
    }

    .loading, .error {
      text-align: center;
      margin: 20px 0;
    }

    .error {
      color: red;
    }
  `]
})
export class PostDetailComponent implements OnInit {
  post: PostRequest | null = null;
  loading = true;
  error = '';

  private route = inject(ActivatedRoute);
  private apollo = inject(Apollo);
  private router = inject(Router);

  private readonly GET_POST = gql`
    query GetPost($id: ID!) {
      findPostById(id: $id) {
        id
        title
        content
      }
    }
  `;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (isNaN(id)) {
      this.error = 'Invalid post ID';
      this.loading = false;
      return;
    }

    this.loadPost(id);
  }

  loadPost(id: number): void {
    this.apollo.query<{ findPostById: PostRequest }>({
      query: this.GET_POST,
      variables: {id}
    }).pipe(
      map(result => result.data.findPostById),
      catchError(error => {
        this.error = error.message || 'Error loading post';
        this.loading = false;
        return of(null);
      })
    ).subscribe(post => {
      this.post = post;
      this.loading = false;
    });
  }
}
