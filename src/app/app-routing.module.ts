import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ProfileComponent} from './components/user/profile/profile.component';
import {LoginComponent} from './components/auth/login/login.component';
import {RegisterComponent} from './components/auth/register/register.component';
import {HomeComponent} from './components/page/home/home.component';
import {PostsComponent} from './components/posts/posts.component';
import {UserListComponent} from './components/page/user-list/user-list.component';
import {CreatePostComponent} from './components/create-post/create-post.component';
import {EditPostComponent} from './components/edit-post/edit-post.component';
import {TrendsComponent} from './components/trends/trends.component';
import {MapComponent} from './components/map/map.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'posts', component: PostsComponent },
  { path: 'users', component: UserListComponent },
  { path: 'create-post', component: CreatePostComponent },
  { path: 'posts/edit/:id', component: EditPostComponent},
  { path: 'trends', component: TrendsComponent },
  { path: 'map', component: MapComponent } // samo ulogovani korisnici
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
