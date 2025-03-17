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
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.css']
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
