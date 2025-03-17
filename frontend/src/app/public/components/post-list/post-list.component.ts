import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Apollo, gql } from 'apollo-angular';

interface Post {
  id: number;
  title: string;
  content: string;
  isPublic: boolean;
  userId: number;
}

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="post-list-container">
      <h2>Public Posts</h2>
      <div *ngIf="loading" class="loading">Loading...</div>
      <div *ngIf="error" class="error">{{ error }}</div>

      <div class="posts-grid" *ngIf="!loading && !error">
        <div *ngFor="let post of displayedPosts" class="post-card">
          <h3>{{ post.title }}</h3>
          <p>{{ post.content | slice:0:100 }}{{ post.content.length > 100 ? '...' : '' }}</p>
          <a [routerLink]="['/public/post', post.id]" class="read-more">Leer más</a>
        </div>
      </div>

      <div class="pagination" *ngIf="totalPages > 1">
        <button
          [disabled]="currentPage === 1"
          (click)="changePage(currentPage - 1)">
          Previous
        </button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button
          [disabled]="currentPage === totalPages"
          (click)="changePage(currentPage + 1)">
          Next
        </button>
      </div>
    </div>
  `,
  styles: [`
    .post-list-container {
      padding: 20px;
    }
    .loading, .error {
      text-align: center;
      margin: 20px 0;
    }
    .error {
      color: red;
    }
    .posts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin: 20px 0;
    }
    .post-card {
      border: 1px solid #ddd;
      border-radius: 5px;
      padding: 15px;
      transition: transform 0.3s;
    }
    .post-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    .read-more {
      display: inline-block;
      margin-top: 10px;
      color: #007bff;
      text-decoration: none;
    }
    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10px;
      margin-top: 20px;
    }
    button {
      padding: 5px 10px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 3px;
      cursor: pointer;
    }
    button:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }
  `]
})
export class PostListComponent implements OnInit {
  posts: Post[] = [];
  displayedPosts: Post[] = [];
  loading = true;
  error = '';

  currentPage = 1;
  totalPages = 1;
  postsPerPage = 4;

  private readonly GET_PUBLIC_POSTS = gql`
    query GetPublicPosts {
      findPublicPosts {
        id
        title
        content
        isPublic
        userId
      }
    }
  `;

  constructor(private apollo: Apollo) { }

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.loading = true;
    this.apollo.query<any>({
      query: this.GET_PUBLIC_POSTS
    }).subscribe({
      next: (response) => {
        this.posts = response.data.findPublicPosts;
        this.calculatePagination();
        this.updateDisplayedPosts();
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Error loading posts';
        this.loading = false;
      }
    });
  }

  // Implement client-side pagination
  calculatePagination(): void {
    this.totalPages = Math.ceil(this.posts.length / this.postsPerPage);
    if (this.totalPages === 0) this.totalPages = 1;
    if (this.currentPage > this.totalPages) this.currentPage = 1;
  }

  updateDisplayedPosts(): void {
    const startIndex = (this.currentPage - 1) * this.postsPerPage;
    const endIndex = startIndex + this.postsPerPage;
    this.displayedPosts = this.posts.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedPosts();
    }
  }
}
