import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Apollo, gql} from 'apollo-angular';
import {AuthService} from '../../../auth/services/auth.service';
import {PostRequest} from '../../../interface/requests/PostRequest';


@Component({
    selector: 'app-user-post-management',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
        <div class="post-management-container">
            <h2>My Posts</h2>

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
                        <textarea id="content" formControlName="content" rows="10"></textarea>
                        <div *ngIf="postForm.get('content')?.invalid && postForm.get('content')?.touched">
                            <span class="error">Content is required</span>
                        </div>
                    </div>

                    <div class="form-group checkbox">
                        <input type="checkbox" id="isPublic" formControlName="isPublic">
                        <label for="isPublic">Make this post public</label>
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
                <h3>Your Posts</h3>
                <table>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr *ngFor="let post of posts">
                        <td>{{ post.id }}</td>
                        <td>{{ post.title }}</td>
                        <td>{{ post.isPublic ? 'Public' : 'Private' }}</td>
                        <td>
                            <button (click)="editPost(post)">Edit</button>
                            <button (click)="deletePost(post.id)" class="delete-btn">Delete</button>
                        </td>
                    </tr>
                    <tr *ngIf="posts.length === 0">
                        <td colspan="4" class="no-data">No posts found</td>
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
    `]
})
export class UserPostManagementComponent implements OnInit {
    posts: PostRequest[] = [];
    postForm: FormGroup;
    loading = true;
    saving = false;
    error = '';
    editingPostId: string | null = null;
    currentUserId: string | null = null;

    private readonly GET_USER_POSTS = gql`
      query GetMyPosts {
        myPosts {
          id
          title
          content
          isPublic
          userId
        }
      }
    `;

    private readonly CREATE_POST = gql`
    mutation CreatePost($title: String!, $content: String!, $public: Boolean!, $userId: ID) {
      createPost(postRequest: {
        title: $title,
        content: $content,
        public: $public,
        userId: $userId
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
    mutation UpdatePost($id: ID!, $title: String!, $content: String!, $public: Boolean!, $userId: ID) {
      updatePostById(postRequest: {
        id: $id,
        title: $title,
        content: $content,
        public: $public,
        userId: $userId
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
        private fb: FormBuilder,
        private authService: AuthService
    ) {
        this.postForm = this.fb.group({
            title: ['', Validators.required],
            content: ['', Validators.required],
            isPublic: [false]
        });

        // Get current user ID
        const currentUser = this.authService.getCurrentUser();
        if (currentUser && currentUser.id) {
            this.currentUserId = currentUser.id;
        }
    }

    ngOnInit(): void {
        if (this.currentUserId) {
            this.loadUserPosts();
        } else {
            this.error = 'User ID not available';
            this.loading = false;
        }
    }

    loadUserPosts(): void {
      this.loading = true;
      this.apollo.query<{myPosts: PostRequest[]}>({
        query: this.GET_USER_POSTS,
        fetchPolicy: 'network-only'
      }).subscribe({
        next: (result) => {
          this.posts = result.data.myPosts;
          this.loading = false;
        },
        error: (err) => {
          this.error = err.message || 'Error loading posts';
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
        const {title, content, isPublic} = this.postForm.value;

        this.apollo.mutate<{ createPost: PostRequest }>({
            mutation: this.CREATE_POST,
            variables: {
                title,
                content,
                public: isPublic,
                userId: this.currentUserId
            },
            refetchQueries: [{
                query: this.GET_USER_POSTS,
            }]
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
        const {title, content, isPublic} = this.postForm.value;

        this.apollo.mutate<{ updatePostById: PostRequest }>({
            mutation: this.UPDATE_POST,
            variables: {
                id: this.editingPostId,
                title,
                content,
                public: isPublic,
                userId: this.currentUserId
            },
            refetchQueries: [{
                query: this.GET_USER_POSTS,
            }]
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
            variables: {id},
            refetchQueries: [{
                query: this.GET_USER_POSTS,
            }]
        }).subscribe({
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
}
