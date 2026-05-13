import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

/**
 * Application Entry Point
 *
 * Bootstraps the Angular application using the root AppModule.
 * All lazy-loaded modules (UserDashboardModule, etc.) are deferred
 * and downloaded only when their routes are activated.
 */
platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error('Bootstrap error:', err));
