import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserDashboardComponent } from './components/user-dashboard/user-dashboard.component';

/**
 * UserDashboardRoutingModule
 *
 * Child routes for the UserDashboardModule feature.
 * When the router loads the 'dashboard' lazy chunk, it uses these routes.
 *
 * The default path ('') renders UserDashboardComponent at /dashboard.
 */
const routes: Routes = [
  {
    path: '',
    component: UserDashboardComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserDashboardRoutingModule {}
