import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Apollo, gql} from 'apollo-angular';
import {PostRequest} from '../../../interface/requests/PostRequest';


@Component({
  selector: 'app-post-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './post-management.component.html',
  styleUrls: ['./post-management.component.css']
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
