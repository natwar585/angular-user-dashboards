# 📊 Angular User Dashboard

A production-ready Angular application featuring a dynamic user dashboard with lazy loading, Chart.js pie chart, and RxJS state management.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
ng serve

# 3. Open in browser
# Navigate to http://localhost:4200
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── user-dashboard/
│   │   │   ├── user-dashboard.component.ts     ← Main dashboard logic
│   │   │   ├── user-dashboard.component.html   ← Dashboard template
│   │   │   └── user-dashboard.component.scss   ← Dashboard styles
│   │   └── user-form/
│   │       ├── user-form.component.ts          ← Modal form (lazy-loaded)
│   │       ├── user-form.component.html        ← Form template
│   │       └── user-form.component.scss        ← Form styles
│   ├── models/
│   │   └── user.model.ts                       ← User & UserRole types
│   ├── pipes/
│   │   └── role-count.pipe.ts                  ← Pure pipe for role counting
│   ├── services/
│   │   └── user.service.ts                     ← RxJS BehaviorSubject state
│   ├── app.component.ts                        ← Root shell (router-outlet)
│   ├── app.module.ts                           ← Root module (minimal)
│   ├── app-routing.module.ts                   ← Lazy route: /dashboard
│   ├── user-dashboard.module.ts                ← Feature module
│   └── user-dashboard-routing.module.ts        ← Child routes
├── styles.scss                                 ← Global styles + Google Fonts
├── index.html
└── main.ts
```

---

## ✅ Features Implemented

### Core Requirements
| Feature | Implementation |
|---|---|
| User Table (Name, Email, Role) | `user-dashboard.component.html` |
| Chart.js Pie Chart | Lazy-loaded in `ngAfterViewInit` via `import('chart.js')` |
| Add User Button + Modal | Opens lazy-loaded `UserFormComponent` |
| Form Validation | Reactive forms with Validators (required, email, pattern, minLength) |
| RxJS BehaviorSubject | `UserService.usersSubject` → `users$` observable |
| Real-time Table + Chart Update | Dashboard subscribes to `users$`, chart uses `chartInstance.update()` |
| Lazy Loading (Form) | Dynamic `import('../user-form/user-form.component')` on button click |
| Lazy Loading (Chart.js) | Dynamic `import('chart.js')` in `ngAfterViewInit` |
| Lazy Loading (Module) | `loadChildren()` in `app-routing.module.ts` |

### Bonus Features
| Feature | Implementation |
|---|---|
| Pagination | `paginatedUsers` getter, `prevPage()`, `nextPage()`, `totalPages` |
| Search/Filter | `searchQuery` + `applyFilter()` — real-time name/email search |
| Role Filter Dropdown | `roleFilter` state, filters by Admin/Editor/Viewer/All |
| Stats Bar | Shows total users + per-role counts (Admin/Editor/Viewer) |
| Loading Indicators | Spinner for chart loading, animated dots on modal button |
| Row Fade-in Animation | CSS `@keyframes fadeIn` on `tbody tr` |
| Avatar Initials | Generated from first letter of user name |
| Tooltips on Chart | Shows count + percentage on hover |

---

## 🧠 Architecture Decisions

### 1. RxJS BehaviorSubject Pattern
```typescript
// UserService — single source of truth
private usersSubject = new BehaviorSubject<User[]>(initialUsers);
public users$ = this.usersSubject.asObservable(); // expose as Observable only

addUser(userData: Omit<User, 'id'>): void {
  const current = this.usersSubject.getValue();
  this.usersSubject.next([...current, newUser]); // immutable update
}
```
- BehaviorSubject chosen over Subject because new subscribers immediately get the current value
- Exposed as `Observable` (not BehaviorSubject) to prevent external `.next()` calls

### 2. Two-Level Lazy Loading
```
Level 1 — Module Lazy Loading (router):
  /dashboard → loadChildren() → UserDashboardModule chunk

Level 2 — Component Lazy Loading (runtime):
  "Add User" click → import('../user-form') → UserFormComponent chunk

Level 3 — Library Lazy Loading (runtime):
  ngAfterViewInit → import('chart.js') → Chart.js chunk
```

### 3. Chart Updates (No Re-create)
```typescript
// ✅ Correct — only update data, don't destroy+recreate
this.chartInstance.data.datasets[0].data = [admin, editor, viewer];
this.chartInstance.update('active'); // smooth animation
```

### 4. trackBy for Table Performance
```typescript
trackByUserId(index: number, user: User): number {
  return user.id; // Angular only re-renders changed rows
}
```

### 5. Pure Pipe for Role Counts
```typescript
@Pipe({ name: 'roleCount', pure: true })
// Memoized — recomputes only when users array reference changes
// Avoids calling methods in template (which run every change detection cycle)
```

---

## 🎨 Design Tokens

| Variable | Value | Usage |
|---|---|---|
| `--color-primary` | `#1c4980` | Buttons, accents, chart Admin color |
| `--color-border` | `#383838` | All borders, separators |
| `--color-bg` | `#1a1a1a` | Page background |
| `--color-surface` | `#242424` | Cards, modal background |
| `--input-h` | `48px` | All buttons and inputs (per spec) |

---

## 📦 Dependencies

| Package | Version | Purpose |
|---|---|---|
| `@angular/core` | ^17.0.0 | Framework |
| `chart.js` | ^4.4.0 | Pie chart (lazy-loaded) |
| `rxjs` | ^7.8.0 | BehaviorSubject state management |

---

## 🔧 No Errors Checklist

- ✅ `ngOnDestroy` unsubscribes from `users$` → no memory leaks
- ✅ `chartInstance.destroy()` in `ngOnDestroy` → no canvas reuse errors
- ✅ `trackBy` on `*ngFor` → no ExpressionChangedAfterChecked errors
- ✅ `ChangeDetectorRef.detectChanges()` after async operations → no stale view
- ✅ `formControlName` inside `[formGroup]` → no AbstractControl errors
- ✅ `Chart.register(...)` with only needed modules → no "not a registered controller" errors
