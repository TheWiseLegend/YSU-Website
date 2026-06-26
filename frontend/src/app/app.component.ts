// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter, take } from 'rxjs/operators';
import { AppLoaderService } from './services/app-loader.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'اتحاد الطلبة اليمنيين في ماليزيا';

  constructor(private router: Router, private appLoader: AppLoaderService) {}

  ngOnInit(): void {
    // Hide the pre-boot loader once the first route has rendered — unless a
    // page claimed it (e.g. home waits on its hero images then hides it).
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      take(1),
    ).subscribe(() => {
      if (!this.appLoader.isHeld) {
        // Defer one frame so the first view has painted before we fade out.
        requestAnimationFrame(() => this.appLoader.hide());
      }
    });

    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    });
  }
}
