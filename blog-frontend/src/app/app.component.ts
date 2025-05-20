import { Component, HostListener, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from './service/auth/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush 
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'blog-frontend';
  private routeSubscription: Subscription | undefined;
  showNavbarAndHero: boolean = true;
  isSticky: boolean = false;
  currentTheme: string = 'light';
  isPublicRoute: boolean = true; 
  private publicRoutes = ['/view-all', '/view-post', '/search-by-name', '/about', '/contact'];

  constructor(
    public authService: AuthService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('theme') || 'light';
    this.currentTheme = savedTheme;
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.routeSubscription = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const url = event.urlAfterRedirects;
      this.showNavbarAndHero = !(
        url.startsWith('/admin') ||
        url.startsWith('/login') ||
        url.startsWith('/register') ||
        url.startsWith('/profile') ||
        url.startsWith('/activity-history') ||
        url.startsWith('/settings') ||
        url.startsWith('/posts/create-post')
      );
      this.isPublicRoute = this.publicRoutes.some(route => url.startsWith(route));
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isSticky = window.pageYOffset > 0;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  toggleTheme(): void {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    localStorage.setItem('theme', this.currentTheme);
  }
}