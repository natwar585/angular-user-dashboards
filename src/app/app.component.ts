import { Component } from '@angular/core';

/**
 * AppComponent
 *
 * Root shell component.
 * Only contains <router-outlet> which is where Angular renders
 * the lazy-loaded UserDashboardComponent.
 */
@Component({
  selector: 'app-root',
  template: `<router-outlet></router-outlet>`,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }
  `],
})
export class AppComponent {
  title = 'user-dashboard';
}
