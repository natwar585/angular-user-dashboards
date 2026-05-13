import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { UserService } from '../../services/user.service';
import { User, UserRole } from '../../models/user.model';

/**
 * UserDashboardComponent
 *
 * The main dashboard component that:
 *  - Displays a dynamic user table (Name, Email, Role)
 *  - Renders a Chart.js pie chart for role distribution
 *  - Opens a lazy-loaded modal form to add new users
 *  - Manages pagination and search/filter for the table (bonus)
 *
 * Lazy Loading Strategy:
 *  - UserFormComponent is lazy-loaded via dynamic import when the modal is opened.
 *  - Chart.js is lazy-loaded inside ngAfterViewInit using dynamic import().
 *
 * RxJS Strategy:
 *  - Subscribes to UserService.users$ (BehaviorSubject observable).
 *  - Any new user addition automatically triggers table + chart re-render.
 *  - Subscription is stored and cleaned up in ngOnDestroy to prevent memory leaks.
 */
@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss'],
})
export class UserDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  // ─────────────────────────────────────────────
  // State Variables
  // ─────────────────────────────────────────────

  /** Full list of users received from UserService */
  users: User[] = [];

  /** Whether the lazy-loaded UserForm modal is visible */
  isModalOpen = false;

  /** Loading state while lazy-loading modal/chart */
  isChartLoading = true;

  /** Loading state for modal component */
  isModalLoading = false;

  /** Dynamically loaded UserFormComponent class (lazy-loaded) */
  userFormComponent: any = null;

  // ─────────────────────────────────────────────
  // Pagination (Bonus Feature)
  // ─────────────────────────────────────────────

  /** Current active page (1-indexed) */
  currentPage = 1;

  /** Number of users to display per page */
  pageSize = 5;

  /** Filtered/searched users before pagination */
  filteredUsers: User[] = [];

  /** Current search/filter query */
  searchQuery = '';

  /** Currently selected role filter */
  roleFilter: UserRole | 'All' = 'All';

  // ─────────────────────────────────────────────
  // Chart.js References
  // ─────────────────────────────────────────────

  /** Reference to the canvas element for Chart.js */
  @ViewChild('roleChart') roleChartRef!: ElementRef<HTMLCanvasElement>;

  /** Chart.js instance (lazy-loaded) */
  private chartInstance: any = null;

  /** Chart.js library reference (lazy-loaded via dynamic import) */
  private ChartJS: any = null;

  // ─────────────────────────────────────────────
  // RxJS Subscription
  // ─────────────────────────────────────────────

  /** Holds the users$ subscription — unsubscribed in ngOnDestroy */
  private usersSub!: Subscription;

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef // For triggering change detection after async operations
  ) {}

  // ─────────────────────────────────────────────
  // Lifecycle Hooks
  // ─────────────────────────────────────────────

  /**
   * ngOnInit
   * Subscribes to the users$ observable from UserService.
   * Every time a user is added, this callback fires and:
   *  1. Updates the local users array.
   *  2. Re-applies the filter.
   *  3. Updates the chart data.
   */
  ngOnInit(): void {
    this.usersSub = this.userService.users$.subscribe((users) => {
      this.users = users;
      this.applyFilter(); // Re-filter/paginate on every update
      this.updateChart(); // Re-render chart on every update
      this.cdr.detectChanges(); // Ensure UI reflects changes immediately
    });
  }

  /**
   * ngAfterViewInit
   * Called after Angular has initialized the component's view.
   * Safe to access @ViewChild references here.
   *
   * Lazily loads Chart.js and initializes the pie chart.
   * Dynamic import ensures Chart.js bundle is NOT included in the initial load.
   */
  async ngAfterViewInit(): Promise<void> {
    await this.loadChart();
  }

  /**
   * ngOnDestroy
   * Cleanup to prevent memory leaks:
   *  - Unsubscribe from users$ observable.
   *  - Destroy Chart.js instance.
   */
  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    if (this.usersSub) {
      this.usersSub.unsubscribe();
    }

    // Destroy Chart.js instance to free canvas memory
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
  }

  // ─────────────────────────────────────────────
  // Chart Methods
  // ─────────────────────────────────────────────

  /**
   * loadChart
   *
   * Dynamically imports Chart.js (lazy loading) and initializes the pie chart.
   * Dynamic import() is used to defer Chart.js loading until this component renders,
   * reducing the initial bundle size.
   */
  private async loadChart(): Promise<void> {
    try {
      this.isChartLoading = true;

      // ✅ LAZY LOAD: Chart.js loaded only when dashboard is first rendered
      const { Chart, ArcElement, Tooltip, Legend, PieController } = await import('chart.js');

      // Register only the components we need (tree-shaking)
      Chart.register(ArcElement, Tooltip, Legend, PieController);
      this.ChartJS = Chart;

      this.isChartLoading = false;
      this.cdr.detectChanges();

      // Initialize the chart after loading
      this.initializeChart();
    } catch (error) {
      console.error('Failed to load Chart.js:', error);
      this.isChartLoading = false;
    }
  }

  /**
   * initializeChart
   *
   * Creates the Chart.js pie chart instance on the canvas element.
   * Called once after Chart.js is loaded.
   */
  private initializeChart(): void {
    if (!this.roleChartRef || !this.ChartJS) return;

    const ctx = this.roleChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const distribution = this.userService.getRoleDistribution(this.users);

    // Create the Chart.js pie chart instance
    this.chartInstance = new this.ChartJS(ctx, {
      type: 'pie',
      data: {
        labels: ['Admin', 'Editor', 'Viewer'],
        datasets: [
          {
            data: [distribution.Admin, distribution.Editor, distribution.Viewer],
            backgroundColor: [
              '#1c4980', // Admin — Primary blue
              '#2d6db5', // Editor — Mid blue
              '#5a9ed6', // Viewer — Light blue
            ],
            borderColor: '#383838',
            borderWidth: 2,
            hoverOffset: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#e0e0e0',
              font: { size: 13, family: "'Sora', sans-serif" },
              padding: 16,
            },
          },
          tooltip: {
            callbacks: {
              // Show both count and percentage in tooltip
              label: (ctx: any) => {
                const total = ctx.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const value = ctx.raw as number;
                const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                return ` ${ctx.label}: ${value} (${pct}%)`;
              },
            },
          },
        },
      },
    });
  }

  /**
   * updateChart
   *
   * Updates the chart's dataset when users list changes.
   * Does NOT re-create the chart — only updates data and re-renders.
   * This is more performant than destroying/recreating the instance.
   */
  private updateChart(): void {
    if (!this.chartInstance) return; // Chart not yet loaded

    const distribution = this.userService.getRoleDistribution(this.users);

    // Update dataset values
    this.chartInstance.data.datasets[0].data = [
      distribution.Admin,
      distribution.Editor,
      distribution.Viewer,
    ];

    // Trigger Chart.js re-render with animation
    this.chartInstance.update('active');
  }

  // ─────────────────────────────────────────────
  // Modal Methods
  // ─────────────────────────────────────────────

  /**
   * openModal
   *
   * Lazily loads the UserFormComponent when the "Add User" button is clicked.
   * Dynamic import() ensures UserFormModule is NOT part of the initial bundle.
   *
   * Steps:
   *  1. Show loading state.
   *  2. Dynamically import the UserFormComponent.
   *  3. Store the component class for use in the template.
   *  4. Display the modal.
   */
  async openModal(): Promise<void> {
    this.isModalLoading = true;
    this.isModalOpen = true;

    try {
      // ✅ LAZY LOAD: UserFormComponent loaded only when modal is first opened
      const { UserFormComponent } = await import('../user-form/user-form.component');
      this.userFormComponent = UserFormComponent;
    } catch (error) {
      console.error('Failed to load UserFormComponent:', error);
    } finally {
      this.isModalLoading = false;
      this.cdr.detectChanges();
    }
  }

  /**
   * closeModal
   * Hides the modal overlay. The component class remains cached after first load.
   */
  closeModal(): void {
    this.isModalOpen = false;
  }

  /**
   * onUserAdded
   *
   * Callback triggered when UserFormComponent emits a new user.
   * Delegates to UserService.addUser() which updates the BehaviorSubject.
   * The users$ subscription in ngOnInit will automatically pick up the change.
   *
   * @param userData - New user data emitted from the form (without id)
   */
  onUserAdded(userData: Omit<User, 'id'>): void {
    this.userService.addUser(userData); // Update state via service
    this.closeModal();                  // Close the modal after submission
  }

  // ─────────────────────────────────────────────
  // Filter & Pagination Methods (Bonus)
  // ─────────────────────────────────────────────

  /**
   * applyFilter
   *
   * Filters the users array based on:
   *  - searchQuery: matches name or email (case-insensitive)
   *  - roleFilter: filters by selected role ('All' shows all)
   *
   * Resets to page 1 after filter to avoid empty pages.
   */
  applyFilter(): void {
    const query = this.searchQuery.toLowerCase().trim();

    this.filteredUsers = this.users.filter((user) => {
      // Check search query match (name or email)
      const matchesSearch =
        !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query);

      // Check role filter match
      const matchesRole = this.roleFilter === 'All' || user.role === this.roleFilter;

      return matchesSearch && matchesRole;
    });

    // Reset to first page after filter change
    this.currentPage = 1;
  }

  /**
   * onSearchChange
   * Triggered on input event of the search box.
   */
  onSearchChange(query: string): void {
    this.searchQuery = query;
    this.applyFilter();
  }

  /**
   * onRoleFilterChange
   * Triggered when the role dropdown filter changes.
   */
  onRoleFilterChange(role: UserRole | 'All'): void {
    this.roleFilter = role;
    this.applyFilter();
  }

  // ─────────────────────────────────────────────
  // Pagination Helpers
  // ─────────────────────────────────────────────

  /** Returns the slice of filteredUsers for the current page */
  get paginatedUsers(): User[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredUsers.slice(start, start + this.pageSize);
  }

  /** Total number of pages */
  get totalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.pageSize) || 1;
  }

  /** Go to the previous page */
  prevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  /** Go to the next page */
  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  /**
   * Returns an array of role options for the filter dropdown.
   * Includes 'All' as the first option.
   */
  get roleOptions(): (UserRole | 'All')[] {
    return ['All', 'Admin', 'Editor', 'Viewer'];
  }

  /**
   * trackByUserId
   * Angular trackBy function for *ngFor to optimize DOM updates.
   * Without this, Angular would re-render every row on any change.
   *
   * @param index - Index in the array
   * @param user - User object
   * @returns The user's unique id
   */
  trackByUserId(index: number, user: User): number {
    return user.id;
  }
}
