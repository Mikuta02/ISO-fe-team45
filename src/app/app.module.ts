import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { RegisterComponent } from './components/auth/register/register.component';
import { LoginComponent } from './components/auth/login/login.component';
import { ProfileComponent } from './components/user/profile/profile.component';
import {jwtInterceptor} from './interceptors/jwt.service';
import { HomeComponent } from './components/page/home/home.component';
import { PostsComponent } from './components/posts/posts.component';
import { UserListComponent } from './components/page/user-list/user-list.component';
import { MapPostsComponent } from './components/map-posts/map-posts.component';
import { CreatePostComponent } from './components/create-post/create-post.component';
import { EditPostComponent } from './components/edit-post/edit-post.component';
import { TrendsComponent } from './components/trends/trends.component';
import { MapComponent } from './components/map/map.component';
import { ChatComponent } from './components/chat/chat.component';
import { StompRService } from '@stomp/ng2-stompjs';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {FollowService} from './services/follow.service';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { AdminHomeComponent } from './components/admin-home/admin-home.component';
import { AnalyticsComponent } from './components/admin/analytics/analytics.component';
import { FollowButtonComponent } from './components/follow-button/follow-button.component';
import './shared/leaflet-icon-fix';

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    LoginComponent,
    ProfileComponent,
    HomeComponent,
    PostsComponent,
    UserListComponent,
    MapPostsComponent,
    CreatePostComponent,
    EditPostComponent,
    TrendsComponent,
    MapComponent,
    ChatComponent,
    UserProfileComponent,
    AdminHomeComponent,
    AnalyticsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FollowButtonComponent,
    FormsModule,
    NgbModule
  ],
  providers: [
    provideHttpClient(
      withInterceptors([jwtInterceptor])
    ),
    StompRService,
    FollowService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
