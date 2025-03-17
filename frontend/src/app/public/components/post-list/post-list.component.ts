import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {Apollo, gql} from 'apollo-angular';

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
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
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

  constructor(private apollo: Apollo) {
  }

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
