import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { UserDashboardRoutingModule } from './user-dashboard-routing.module';
import { UserDashboardComponent } from './components/user-dashboard/user-dashboard.component';
import { UserFormComponent } from './components/user-form/user-form.component';
import { RoleCountPipe } from './pipes/role-count.pipe';

/**
 * UserDashboardModule
 *
 * Feature module that encapsulates the entire dashboard feature.
 * It is lazy-loaded by the AppRoutingModule so it is NOT part of the initial bundle.
 *
 * Includes:
 *  - UserDashboardComponent: Main dashboard view
 *  - UserFormComponent: Modal form (also lazy-loaded at component level via dynamic import)
 *  - RoleCountPipe: Counts users by role for the template
 *  - ReactiveFormsModule: Required for formGroup, formControlName, etc.
 *
 * Note on Lazy Loading Strategy:
 *  Two levels of lazy loading are used:
 *  Level 1 (Module): This module itself is lazy-loaded via the router.
 *                    The router downloads this chunk only when the /dashboard route is activated.
 *  Level 2 (Component): UserFormComponent is further lazy-loaded at runtime via dynamic import()
 *                       inside UserDashboardComponent.openModal().
 *                       This means the form chunk is deferred until the first modal open.
 */
@NgModule({
  declarations: [
    UserDashboardComponent, // Main dashboard
    UserFormComponent,      // Lazy-loaded modal form
    RoleCountPipe,          // Role count pipe for stats
  ],
  imports: [
    CommonModule,                 // *ngIf, *ngFor, NgComponentOutlet, etc.
    ReactiveFormsModule,          // FormGroup, FormBuilder, Validators
    UserDashboardRoutingModule,   // Routes: '' → UserDashboardComponent
  ],
})
export class UserDashboardModule {}
