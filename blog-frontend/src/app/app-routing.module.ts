import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreatedPostComponent } from './pages/created-post/created-post.component';
import { ViewAllComponent } from './pages/view-all/view-all.component';
import { ViewPostComponent } from './pages/view-post/view-post.component';
import { SearchByNameComponent } from './pages/search-by-name/search-by-name.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guards';
import { ProfileComponent } from './pages/profile/profile.component';
import { AboutComponent } from './pages/about/about.component';
import { ActivityHistoryComponent } from './pages/activity-history/activity-history.component';
import { ContactComponent } from './pages/contact/contact.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { AdminComponent } from './admin/admin.component';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { PostsComponent } from './admin/posts/posts.component';
import { UsersComponent } from './admin/users/users.component';

const routes: Routes = [
  // Public
  { path: '', redirectTo: '/view-all', pathMatch: 'full' },
  { path: 'view-all', component: ViewAllComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'search-by-name', component: SearchByNameComponent },
  { path: 'view-post/:id', component: ViewPostComponent },
  // Authenticated
  { path: 'posts/create-post', component: CreatedPostComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'activity-history', component: ActivityHistoryComponent, canActivate: [AuthGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard] },
  // Auth
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  // Admin
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AdminGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'users', component: UsersComponent },
      { path: 'posts', component: PostsComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}