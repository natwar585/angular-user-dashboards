import { Pipe, PipeTransform } from '@angular/core';
import { User, UserRole } from '../models/user.model';

/**
 * RoleCountPipe
 *
 * A pure pipe that counts how many users have a given role.
 * Used in the dashboard template for the stats bar and role legend.
 *
 * Usage:
 *   {{ users | roleCount:'Admin' }}  → returns number of Admin users
 *
 * Why a Pipe instead of a method?
 *   - Pipes are memoized (pure by default) — Angular won't re-compute
 *     unless the input reference changes.
 *   - Keeps the template clean and declarative.
 *   - Avoids calling class methods in templates (which run on every CD cycle).
 */
@Pipe({
  name: 'roleCount',
  pure: true, // Re-computes only when input reference changes
})
export class RoleCountPipe implements PipeTransform {
  /**
   * transform
   *
   * @param users  - The current array of users
   * @param role   - The UserRole to count
   * @returns      - Number of users with the given role
   */
  transform(users: User[], role: UserRole): number {
    if (!users || !role) return 0;
    return users.filter((u) => u.role === role).length;
  }
}
