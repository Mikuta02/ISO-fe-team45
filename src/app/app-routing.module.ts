import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ProfileComponent} from './components/user/profile/profile.component';
import {LoginComponent} from './components/auth/login/login.component';
import {RegisterComponent} from './components/auth/register/register.component';
import {HomeComponent} from './components/page/home/home.component';
import {PostsComponent} from './components/posts/posts.component';
import {PostDetailsComponent} from './components/post-details/post-details.component';
import {UserListComponent} from './components/page/user-list/user-list.component';
import {CreatePostComponent} from './components/create-post/create-post.component';
import {EditPostComponent} from './components/edit-post/edit-post.component';
import {TrendsComponent} from './components/trends/trends.component';
import {MapComponent} from './components/map/map.component';
import {ChatComponent} from './components/chat/chat.component';
import {UserProfileComponent} from './components/user-profile/user-profile.component';
import {AdminGuard} from './guard/admin.guard';
import {AnalyticsComponent} from './components/admin/analytics/analytics.component';
import {MapPostsComponent} from './components/map-posts/map-posts.component';
import {AdminHomeComponent} from './components/admin-home/admin-home.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  { path: 'home', component: HomeComponent },
  { path: 'posts', component: PostsComponent },
  { path: 'posts/:id', component: PostDetailsComponent },

  { path: 'map', component: MapComponent },
  { path: 'map-posts', component: MapPostsComponent },

  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'profile', component: ProfileComponent },

  { path: 'user-list', component: UserListComponent },
  { path: 'create-post', component: CreatePostComponent },
  { path: 'edit-post/:id', component: EditPostComponent },
  { path: 'trends', component: TrendsComponent },
  { path: 'chat', component: ChatComponent },

  { path: 'user/:id', component: UserProfileComponent },

  { path: 'admin', component: AdminHomeComponent, canActivate: [AdminGuard] },
  { path: 'admin/analytics', component: AnalyticsComponent, canActivate: [AdminGuard] },

  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
