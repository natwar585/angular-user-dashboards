import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

/**
 * AppRoutingModule
 *
 * Defines the top-level application routes.
 *
 * Lazy Loading:
 *  The 'dashboard' route uses loadChildren() with a dynamic import().
 *  This means the UserDashboardModule chunk is downloaded from the server
 *  ONLY when the user navigates to /dashboard — not at app startup.
 *
 *  This reduces the initial bundle size significantly, especially important
 *  if Chart.js and form logic are heavy.
 */
const routes: Routes = [
  {
    // Redirect root to dashboard
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    // ✅ LAZY LOAD: UserDashboardModule loaded only on /dashboard navigation
    path: 'dashboard',
    loadChildren: () =>
      import('./user-dashboard.module').then((m) => m.UserDashboardModule),
  },
  {
    // Fallback — redirect unknown routes to dashboard
    path: '**',
    redirectTo: 'dashboard',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      // Use hash-based routing for compatibility without server-side config
      // Switch to PathLocationStrategy (default) if server supports it
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
