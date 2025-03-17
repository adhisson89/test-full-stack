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
  templateUrl: 'post-management.component.html',
  styleUrls: ['./post-management.component.css']
})
export class UserPostManagementComponent implements OnInit {
  posts: PostRequest[] = [];
  postForm: FormGroup;
  loading = true;
  saving = false;
  error = '';
  editingPostId: string | null = null;
  currentUserId: string | null = null;
  successMessage = '';

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
    mutation UpdatePost($id: ID!, $title: String!, $content: String!, $public: Boolean!) {
      updatePostById(postRequest: {
        id: $id,
        title: $title,
        content: $content,
        public: $public,
      }) {
        id
        title
        content
        isPublic
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
    this.apollo.query<{ myPosts: PostRequest[] }>({
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
        this.showSuccessMessage('Post created successfully!');
        this.resetForm();
        this.saving = false;
        this.loadUserPosts();
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
      },
      refetchQueries: [{
        query: this.GET_USER_POSTS,
      }]
    }).subscribe({
      next: () => {
        this.showSuccessMessage('Post updated successfully!');
        this.resetForm();
        this.saving = false;
        this.loadUserPosts();
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
      next: () => {
        this.showSuccessMessage('Post deleted successfully!');
        this.loadUserPosts();
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
