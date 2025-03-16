// src/app/admin/components/post-management/post-management.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Apollo, gql } from 'apollo-angular';
import {PostRequest} from '../../../interface/requests/PostRequest';


@Component({
  selector: 'app-post-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
      <div class="post-management-container">
          <h2>Post Management</h2>

          <div *ngIf="loading" class="loading">Loading...</div>
          <div *ngIf="error" class="error">{{ error }}</div>

          <!-- Post Form -->
          <div class="form-container">
              <h3>{{ editingPostId ? 'Edit Post' : 'Create New Post' }}</h3>
              <form [formGroup]="postForm" (ngSubmit)="savePost()">
                  <div class="form-group">
                      <label for="title">Title</label>
                      <input type="text" id="title" formControlName="title">
                      <div *ngIf="postForm.get('title')?.invalid && postForm.get('title')?.touched">
                          <span class="error">Title is required</span>
                      </div>
                  </div>

                  <div class="form-group">
                      <label for="content">Content</label>
                      <textarea id="content" formControlName="content" rows="5"></textarea>
                      <div *ngIf="postForm.get('content')?.invalid && postForm.get('content')?.touched">
                          <span class="error">Content is required</span>
                      </div>
                  </div>

                  <div class="form-group checkbox">
                      <input type="checkbox" id="isPublic" formControlName="isPublic">
                      <label for="isPublic">Public Post</label>
                  </div>

                  <div class="form-actions">
                      <button type="submit" [disabled]="postForm.invalid || saving">
                          {{ editingPostId ? 'Update' : 'Create' }}
                      </button>
                      <button type="button" *ngIf="editingPostId" (click)="cancelEdit()">Cancel</button>
                  </div>
              </form>
          </div>

          <!-- Posts List -->
          <div class="post-list" *ngIf="!loading">
              <h3>Posts</h3>
              <table>
                  <thead>
                  <tr>
                      <th>ID</th>
                      <th>Title</th>
                      <th>Public</th>
                      <th>User ID</th>
                      <th>Actions</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr *ngFor="let post of posts">
                      <td>{{ post.id }}</td>
                      <td>{{ post.title }}</td>
                      <td>{{ post.isPublic ? 'Yes' : 'No' }}</td>
                      <td>{{ post.userId }}</td>
                      <td>
                          <button (click)="editPost(post)">Edit</button>
                          <button (click)="deletePost(post.id)" class="delete-btn">Delete</button>
                      </td>
                  </tr>
                  <tr *ngIf="posts && posts.length === 0">
                      <td colspan="5" class="no-data">No posts found</td>
                  </tr>
                  </tbody>
              </table>
          </div>
      </div>
  `,
  styles: [/* styles remain unchanged */]
})
export class PostManagementComponent implements OnInit {
  posts: PostRequest[] = []; // Initialize as empty array
  postForm: FormGroup;
  loading = true;
  saving = false;
  error = '';
  editingPostId: string | null = null;

  private readonly GET_POSTS = gql`
    query GetAllPosts {
      findAllPosts {
        id
        title
        content
        isPublic
        userId
      }
    }
  `;

  private readonly CREATE_POST = gql`
    mutation CreatePost($title: String!, $content: String!, $public: Boolean!) {
      createPost(postRequest: {
        title: $title,
        content: $content,
        public: $public
      }) {
        id
        title
        content
        isPublic
        userId
      }
    }
  `;

  private readonly UPDATE_POST = gql`
    mutation UpdatePost($id: ID!, $title: String!, $content: String!, $public: Boolean!) {
      updatePostById(postRequest: {
        id: $id,
        title: $title,
        content: $content,
        public: $public
      }) {
        id
        title
        content
        isPublic
        userId
      }
    }
  `;

  private readonly DELETE_POST = gql`
    mutation DeletePost($id: ID!) {
      deletePostById(id: $id)
    }
  `;

  constructor(
    private apollo: Apollo,
    private fb: FormBuilder
  ) {
    this.postForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      isPublic: [false] // Changed from public to isPublic
    });
  }

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.loading = true;
    this.apollo.query<{ findAllPosts: PostRequest[] }>({
      query: this.GET_POSTS,
      fetchPolicy: 'network-only'
    }).subscribe({
      next: (result) => {
        if (result.data && result.data.findAllPosts) {
          this.posts = result.data.findAllPosts;
        } else {
          this.posts = []; // Ensure posts is always an array
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Error loading posts';
        this.posts = []; // Initialize as empty array in case of error
        this.loading = false;
      }
    });
  }

  savePost(): void {
    if (this.postForm.invalid) return;

    this.saving = true;

    if (this.editingPostId) {
      this.updatePost();
    } else {
      this.createPost();
    }
  }

  createPost(): void {
    const { title, content, isPublic } = this.postForm.value;

    this.apollo.mutate<{ createPost: PostRequest }>({
      mutation: this.CREATE_POST,
      variables: {
        title,
        content,
        public: isPublic // Note the field name difference
      },
      refetchQueries: [{ query: this.GET_POSTS }]
    }).subscribe({
      next: () => {
        this.resetForm();
        this.saving = false;
      },
      error: (err) => {
        this.error = err.message || 'Error creating post';
        this.saving = false;
      }
    });
  }

  updatePost(): void {
    const { title, content, isPublic } = this.postForm.value;

    this.apollo.mutate<{ updatePostById: PostRequest }>({
      mutation: this.UPDATE_POST,
      variables: {
        id: this.editingPostId,
        title,
        content,
        public: isPublic // Note the field name difference
      },
      refetchQueries: [{ query: this.GET_POSTS }]
    }).subscribe({
      next: () => {
        this.resetForm();
        this.saving = false;
      },
      error: (err) => {
        this.error = err.message || 'Error updating post';
        this.saving = false;
      }
    });
  }

  deletePost(id: string): void {
    if (!confirm('Are you sure you want to delete this post?')) return;

    this.apollo.mutate<{ deletePostById: string }>({
      mutation: this.DELETE_POST,
      variables: { id },
      refetchQueries: [{ query: this.GET_POSTS }]
    }).subscribe({
      next: () => {
        // Success message if needed
      },
      error: (err) => {
        this.error = err.message || 'Error deleting post';
      }
    });
  }

  editPost(post: PostRequest): void {
    this.editingPostId = post.id;

    this.postForm.patchValue({
      title: post.title,
      content: post.content,
      isPublic: post.isPublic
    });
  }

  cancelEdit(): void {
    this.resetForm();
  }

  resetForm(): void {
    this.editingPostId = null;
    this.postForm.reset({ isPublic: false });
    this.error = '';
  }
}
