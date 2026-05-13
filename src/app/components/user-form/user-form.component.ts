import {
  Component,
  Input,
  OnInit,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { User, UserRole } from '../../models/user.model';

/**
 * UserFormComponent
 *
 * A lazy-loaded modal form component for adding a new user.
 * This component is NEVER part of the initial bundle.
 * It is dynamically imported only when the "Add User" button is clicked.
 *
 * Features:
 *  - Reactive form with validation (name, email, role)
 *  - Custom email format validation
 *  - Error messages displayed on touched/dirty fields
 *  - Emits the new user via onUserAdded callback (passed as Input)
 *  - Closes modal via onCancel callback (passed as Input)
 *
 * Communication Pattern:
 *  Since this is lazy-loaded via ngComponentOutlet (not in a parent template),
 *  we use @Input() callbacks instead of @Output() EventEmitters.
 *  This avoids the need for complex dynamic component event binding.
 */
@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
})
export class UserFormComponent implements OnInit {
  // ─────────────────────────────────────────────
  // Inputs (callbacks passed from UserDashboardComponent)
  // ─────────────────────────────────────────────

  /**
   * Callback to notify parent that a new user should be added.
   * Called with the form data on valid form submission.
   */
  @Input() onUserAdded!: (user: Omit<User, 'id'>) => void;

  /**
   * Callback to close the modal.
   * Called on cancel button click or after successful submission.
   */
  @Input() onCancel!: () => void;

  // ─────────────────────────────────────────────
  // Form State
  // ─────────────────────────────────────────────

  /** The reactive form group */
  userForm!: FormGroup;

  /** Whether the form has been submitted (used to show all errors at once) */
  isSubmitted = false;

  /** Available role options for the dropdown */
  readonly roleOptions: UserRole[] = ['Admin', 'Editor', 'Viewer'];

  constructor(private fb: FormBuilder) {}

  // ─────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────

  /**
   * ngOnInit
   * Builds the reactive form with validators.
   * Called after Angular instantiates the component.
   */
  ngOnInit(): void {
    this.buildForm();
  }

  // ─────────────────────────────────────────────
  // Form Setup
  // ─────────────────────────────────────────────

  /**
   * buildForm
   *
   * Initializes the reactive form using FormBuilder.
   * Validators:
   *  - name:  required, minLength(2), maxLength(50)
   *  - email: required, built-in email validator
   *  - role:  required, must be one of the allowed roles
   */
  private buildForm(): void {
    this.userForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-Z\s'-]+$/), // Only alphabets, spaces, hyphens, apostrophes
        ],
      ],
      email: [
        '',
        [
          Validators.required,
          Validators.email, // Angular's built-in RFC email validator
          Validators.maxLength(100),
        ],
      ],
      role: [
        '',
        [
          Validators.required,
          // Custom validator: value must be one of the allowed roles
          (control: AbstractControl) => {
            const valid = ['Admin', 'Editor', 'Viewer'].includes(control.value);
            return valid ? null : { invalidRole: true };
          },
        ],
      ],
    });
  }

  // ─────────────────────────────────────────────
  // Getters — shorthand access to form controls
  // Used in the template for cleaner validation checks
  // ─────────────────────────────────────────────

  /** Name field control */
  get nameControl(): AbstractControl {
    return this.userForm.get('name')!;
  }

  /** Email field control */
  get emailControl(): AbstractControl {
    return this.userForm.get('email')!;
  }

  /** Role field control */
  get roleControl(): AbstractControl {
    return this.userForm.get('role')!;
  }

  // ─────────────────────────────────────────────
  // Validation Helpers
  // ─────────────────────────────────────────────

  /**
   * shouldShowError
   *
   * Returns true if a field should display its error message.
   * A field shows errors if:
   *  - It has been touched (user clicked and left) OR form is submitted
   *  - AND the field has validation errors
   *
   * @param fieldName - The form control name
   */
  shouldShowError(fieldName: string): boolean {
    const control = this.userForm.get(fieldName);
    return !!(control && control.invalid && (control.touched || this.isSubmitted));
  }

  /**
   * getErrorMessage
   *
   * Returns the most relevant error message for a given field.
   * Priority: required > pattern/format > length
   *
   * @param fieldName - The form control name
   */
  getErrorMessage(fieldName: string): string {
    const control = this.userForm.get(fieldName);
    if (!control || !control.errors) return '';

    const errors = control.errors;

    switch (fieldName) {
      case 'name':
        if (errors['required'])   return 'Name is required.';
        if (errors['minlength'])  return `Name must be at least ${errors['minlength'].requiredLength} characters.`;
        if (errors['maxlength'])  return `Name cannot exceed ${errors['maxlength'].requiredLength} characters.`;
        if (errors['pattern'])    return 'Name can only contain letters, spaces, hyphens, and apostrophes.';
        break;

      case 'email':
        if (errors['required'])   return 'Email address is required.';
        if (errors['email'])      return 'Please enter a valid email address (e.g. user@domain.com).';
        if (errors['maxlength'])  return 'Email address is too long.';
        break;

      case 'role':
        if (errors['required'])   return 'Please select a role.';
        if (errors['invalidRole']) return 'Selected role is invalid.';
        break;
    }

    return 'Invalid input.';
  }

  // ─────────────────────────────────────────────
  // Form Submission
  // ─────────────────────────────────────────────

  /**
   * onSubmit
   *
   * Handles form submission:
   *  1. Marks the form as submitted (triggers all error messages).
   *  2. If invalid, stops here — no action.
   *  3. If valid, calls onUserAdded() with the form data.
   *     The parent (UserDashboardComponent) will update the BehaviorSubject.
   *  4. Resets the form and calls onCancel() to close the modal.
   */
  onSubmit(): void {
    this.isSubmitted = true; // Show all validation errors immediately

    if (this.userForm.invalid) {
      // Touch all fields to show errors
      this.userForm.markAllAsTouched();
      return;
    }

    // Extract form values with correct typing
    const formValue = this.userForm.value as Omit<User, 'id'>;

    // Call parent callback to add user (triggers BehaviorSubject update)
    this.onUserAdded({
      name: formValue.name.trim(),
      email: formValue.email.trim().toLowerCase(),
      role: formValue.role,
    });

    // Reset form after successful submission
    this.userForm.reset();
    this.isSubmitted = false;

    // Note: onCancel() is already called by onUserAdded handler in parent,
    // but we ensure modal closes regardless
  }

  /**
   * onCancelClick
   * Handles cancel button click — calls the parent's close callback.
   */
  onCancelClick(): void {
    this.onCancel();
  }
}
