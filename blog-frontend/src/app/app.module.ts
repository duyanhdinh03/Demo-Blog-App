import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AngularMaterialModule } from './AngularMaterialModule';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
// Components
import { AppComponent } from './app.component';
import { CreatedPostComponent } from './pages/created-post/created-post.component';
import { ViewAllComponent } from './pages/view-all/view-all.component';
import { ViewPostComponent } from './pages/view-post/view-post.component';
import { SearchByNameComponent } from './pages/search-by-name/search-by-name.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { AboutComponent } from './pages/about/about.component';
import { ContactComponent } from './pages/contact/contact.component';
import { ActivityHistoryComponent } from './pages/activity-history/activity-history.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { AdminComponent } from './admin/admin.component';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { UsersComponent } from './admin/users/users.component';
import { PostsComponent } from './admin/posts/posts.component';
import { FooterComponent } from './pages/footer/footer.component';

// Services and Interceptors
import { JwtInterceptor } from './interceptors/jwt.interceptor';
import { UserService } from './service/user/user.service';
import { PostService } from './service/post/post.service';
import { AdminService } from './service/admin/admin.service';
import { AuthService } from './service/auth/auth.service';
import { AdminCreatePostComponent } from './admin/admin-create-post/admin-create-post.component';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    CreatedPostComponent,
    ViewAllComponent,
    ViewPostComponent,
    SearchByNameComponent,
    LoginComponent,
    RegisterComponent,
    ProfileComponent,
    AboutComponent,
    ContactComponent,
    ActivityHistoryComponent,
    SettingsComponent,
    AdminComponent,
    DashboardComponent,
    UsersComponent,
    PostsComponent,
    FooterComponent,
    AdminCreatePostComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AngularMaterialModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    UserService,
    PostService,
    AdminService,
    AuthService
  ],
  schemas :[CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule {}