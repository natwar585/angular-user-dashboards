/**
 * User Model
 * Defines the structure for a User object used throughout the application.
 */

/** Allowed roles for a user */
export type UserRole = 'Admin' | 'Editor' | 'Viewer';

/**
 * User interface representing a single user entry.
 */
export interface User {
  id: number;        // Unique identifier
  name: string;      // Full name of the user
  email: string;     // Email address of the user
  role: UserRole;    // Role assigned to the user
}
