import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Apollo, gql} from 'apollo-angular';
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
      <div *ngIf="successMessage" class="success">{{ successMessage }}</div>

      <!-- Post Form - Only shown when editing -->
      <div class="form-container" *ngIf="editingPostId">
        <h3>Edit Post</h3>
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
            <button type="submit" [disabled]="postForm.invalid || saving">Update</button>
            <button type="button" (click)="cancelEdit()">Cancel</button>
          </div>
        </form>
      </div>

      <!-- Message when not editing -->
      <div class="admin-instructions" *ngIf="!editingPostId">
        <p>Los administradores no pueden crear posts, selecciona uno para editarlo.</p>
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
  styles: [`
    .post-management-container {
      padding: 20px;
    }

    .form-container {
      margin-bottom: 30px;
      border: 1px solid #ddd;
      padding: 20px;
      border-radius: 5px;
    }

    .form-group {
      margin-bottom: 15px;
    }

    .checkbox {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .checkbox input {
      width: auto;
    }

    label {
      display: block;
      margin-bottom: 5px;
    }

    .checkbox label {
      margin-bottom: 0;
    }

    input, textarea {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
    }

    .form-actions {
      display: flex;
      gap: 10px;
    }

    button {
      padding: 8px 16px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 3px;
      cursor: pointer;
    }

    button:disabled {
      background-color: #cccccc;
    }

    .delete-btn {
      background-color: #dc3545;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }

    th {
      background-color: #f5f5f5;
    }

    .no-data {
      text-align: center;
      padding: 20px;
    }

    .loading, .error {
      text-align: center;
      margin: 20px 0;
    }

    .error {
      color: red;
    }

    .success {
      text-align: center;
      margin: 20px 0;
      padding: 10px;
      background-color: #d4edda;
      border-color: #c3e6cb;
      color: #155724;
      border-radius: 4px;
    }

    .admin-instructions {
      margin: 20px 0;
      padding: 15px;
      background-color: #f8f9fa;
      border-left: 4px solid #007bff;
      border-radius: 3px;
    }

  `]
})
export class PostManagementComponent implements OnInit {
  posts: PostRequest[] = [];
  postForm: FormGroup;
  loading = true;
  saving = false;
  error = '';
  editingPostId: string | null = null;
  successMessage = '';

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
        this.posts = [];
        this.loading = false;
      }
    });
  }

  savePost(): void {
    if (this.postForm.invalid) return;
    this.saving = true;
    this.updatePost();

  }


  updatePost(): void {
    const {title, content, isPublic} = this.postForm.value;

    this.apollo.mutate<{ updatePostById: PostRequest }>({
      mutation: this.UPDATE_POST,
      variables: {
        id: this.editingPostId,
        title,
        content,
        public: isPublic // Note the field name difference
      },
      refetchQueries: [{query: this.GET_POSTS}]
    }).subscribe({
      next: () => {
        this.showSuccessMessage('Post updated successfully!');
        this.resetForm();
        this.saving = false;
        this.loadPosts();
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
      variables: {id},
      refetchQueries: [{query: this.GET_POSTS}]
    }).subscribe({
      next: () => {
        this.showSuccessMessage('Post deleted successfully!');
        this.loadPosts();
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
    this.postForm.reset({isPublic: false});
    this.error = '';
  }

  private showSuccessMessage(message: string): void {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

}
