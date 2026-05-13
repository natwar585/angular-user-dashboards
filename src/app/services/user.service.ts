import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, UserRole } from '../models/user.model';

/**
 * UserService
 *
 * Centralized state management for users using RxJS BehaviorSubject.
 * Acts as the single source of truth for user data across components.
 * Any component subscribed to users$ will automatically receive updates.
 */
@Injectable({
  providedIn: 'root', // Singleton service — available app-wide
})
export class UserService {
  /**
   * BehaviorSubject holding the current list of users.
   * BehaviorSubject is preferred here because:
   *   1. It holds the "current value" — new subscribers immediately get the latest data.
   *   2. It can be updated imperatively via .next().
   *
   * Initialized with 3 seed users for demo purposes.
   */
  private usersSubject = new BehaviorSubject<User[]>([
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'Editor' },
    { id: 3, name: 'Carol White', email: 'carol@example.com', role: 'Viewer' },
  ]);

  /**
   * Public Observable stream of users.
   * Components should subscribe to this (not the BehaviorSubject directly)
   * to follow the principle of exposing only what is necessary.
   */
  public users$: Observable<User[]> = this.usersSubject.asObservable();

  /**
   * Auto-incrementing ID counter.
   * Starts at 4 since we have 3 seed users.
   */
  private nextId = 4;

  /**
   * Adds a new user to the current users list.
   *
   * @param userData - Partial user object containing name, email, and role (without id)
   *
   * Steps:
   *  1. Retrieve the current snapshot of users.
   *  2. Create a new User with a unique ID.
   *  3. Push the updated array back into the BehaviorSubject.
   *     All subscribers (dashboard table + chart) automatically receive the update.
   */
  addUser(userData: Omit<User, 'id'>): void {
    const currentUsers = this.usersSubject.getValue(); // Get current snapshot
    const newUser: User = {
      id: this.nextId++,
      ...userData,
    };
    // Emit new array (immutable update pattern — avoids mutation bugs)
    this.usersSubject.next([...currentUsers, newUser]);
  }

  /**
   * Returns the current snapshot of users (non-reactive).
   * Useful when you need the value synchronously without subscribing.
   */
  getUsers(): User[] {
    return this.usersSubject.getValue();
  }

  /**
   * Calculates the distribution count of each role from the current user list.
   *
   * @returns An object with counts for Admin, Editor, and Viewer roles.
   *
   * Used by the dashboard to build Chart.js data.
   */
  getRoleDistribution(users: User[]): Record<UserRole, number> {
    // Initialize all roles to 0
    const distribution: Record<UserRole, number> = {
      Admin: 0,
      Editor: 0,
      Viewer: 0,
    };

    // Count each user's role
    users.forEach((user) => {
      distribution[user.role]++;
    });

    return distribution;
  }
}
