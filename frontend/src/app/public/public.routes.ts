import {Routes} from '@angular/router';
import {PostListComponent} from './components/post-list/post-list.component';
import {PostDetailComponent} from './components/post-detail/post-detail.component';

export const PUBLIC_ROUTES: Routes = [
  {path: '', component: PostListComponent},
  {path: 'post/:id', component: PostDetailComponent}
];
