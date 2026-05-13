import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

/**
 * AppModule
 *
 * Root module of the application.
 *
 * Kept minimal intentionally:
 *  - Only BrowserModule and AppRoutingModule are imported here.
 *  - All feature logic (UserDashboardModule, UserFormComponent, Chart.js)
 *    is lazy-loaded — NOT part of this module.
 *
 * This keeps the initial bundle as small as possible.
 */
@NgModule({
  declarations: [
    AppComponent, // Root shell component
  ],
  imports: [
    BrowserModule,     // Required for browser platform (DOM, etc.)
    AppRoutingModule,  // Routes with lazy-loaded UserDashboardModule
  ],
  providers: [
    // UserService is providedIn: 'root' — no need to register here
  ],
  bootstrap: [AppComponent], // Entry point for Angular app
})
export class AppModule {}
