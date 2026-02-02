# BDMS Codebase Instructions for AI Agents

## Project Overview
Blood Donation Management System (BDMS) is a **React Native/Expo** + **Node.js/Express/SQLite** full-stack application with role-based access control (RBAC) supporting three user types: admin, donor, and recipient (user).

## Critical Architecture Patterns

### 1. Context Provider Layering (Provider Hell Prevention)
**File**: [App.tsx](../App.tsx)  
Provider nesting order **matters**:
```
AlertProvider → AuthProvider → BloodRequestProvider → NavigationContainer → NotificationProvider → AppNavigator
```
- **AuthProvider must wrap NavigationContainer** so navigation can access auth state
- **BloodRequestProvider depends on AuthContext**, so must be nested inside AuthProvider
- **NotificationProvider is inside NavigationContainer** (notification UI needs navigator context)
- AuthContext uses AsyncStorage for persistence, not HTTP tokens

### 2. Role-Based Navigation Structure
**Files**: [AppNavigator.tsx](../src/navigation/AppNavigator.tsx), [types.ts](../src/navigation/types.ts)  
Navigation is determined by `userRole` from AuthContext:
- `null` role → auth screens (Login, Register, ForgotPassword)
- `'admin'` → AdminDashboard stack
- `'donor'` → DonorNavigator stack
- `'user'` → RecipientNavigator stack

Each role has isolated navigation stack in separate files (DonorNavigator.tsx, RecipientNavigator.tsx).

### 3. Authentication Flow (Local Session, No HTTP Bearer Tokens)
**File**: [AuthContext.tsx](../src/context/AuthContext.tsx)  
**Key pattern**: Uses AsyncStorage for session persistence, not JWT/bearer tokens:
- Stores user data in `@bdms_user_data` AsyncStorage key
- Creates local token format: `'local_session_' + userData.id`
- Session restored on app launch via `restoreSession()`
- No Authorization header in API requests (unusual pattern)

### 4. API Client Setup
**Files**: [apiClient.ts](../src/services/api/apiClient.ts), [authApi.ts](../src/services/api/authApi.ts)  
- API client uses **fetch** (see `src/services/api/apiClient.ts`) and exposes `get/post/put/delete` helpers. Base URL used in code: `http://10.29.64.21:3000/api` (development).
- There is also a central configuration in `src/constants/config.ts` (`config.api.baseUrl` points to `http://10.29.64.21:3000/api/v1` in dev); prefer using it when you unify endpoints.
- Auth API includes: login, register, logout, forgotPassword, verifyOTP and returns backend JSON objects (typically `{ success: boolean, ... }`).
- `apiClient.handleError` logs and rethrows errors — calling code is expected to handle errors thrown by the client.

### 5. Backend Database Schema
**File**: [backend/server.js](../backend/server.js)  
SQLite tables include users, blood_requests, blood_inventory, notifications with:
- `account_status` field (active/deactivated)
- `deactivation_reason`, `deactivated_at`, `deactivated_by` audit fields
- Timestamps as UNIX seconds via `strftime('%s', 'now')`

## Developer Workflows

### Running the Application
```bash
# Frontend (Expo React Native)
npm start          # Start Metro bundler
npm run android    # Run on Android emulator
npm run ios        # Run on iOS simulator
npm run web        # Run in web browser

# Backend (Node.js)
cd backend
npm install
node server.js     # Starts on port 3000
```

### Database Access
- SQLite database file: `backend/bdms.db`
- Tables auto-created on first `initializeDatabase()` call
- Use SQL migrations via `db.run()` in server.js

## Project-Specific Conventions

### File Locations by Function
- **Screens**: `src/screens/[role]/[ScreenName].tsx`
- **Navigation**: `src/navigation/[RoleNavigator].tsx`
- **API**: `src/services/api/[domainApi].ts`
- **Hooks**: `src/hooks/use[Feature].ts`
- **Contexts**: `src/context/[Feature]Context.tsx`

### Code Documentation
- Inline JSDoc comments for API methods (see authApi.ts pattern)
- Provider components document their provider nesting requirements in comments
- No TypeScript strict null checks enforced (user role can be null)

### Form Pattern (Not Yet Visible in Minimal Structure)
Profiles have separate Form components (DonorProfileForm.tsx, RecipientProfileForm.tsx) suggesting forms are reusable components separate from display screens.

## Critical Integration Points to Remember

1. **AuthContext is central**: Navigation, providers, and API calls all depend on user auth state
2. **Expo plugins**: Uses expo-secure-store, expo-location, expo-image-picker (manifest in app.json)
3. **Cross-device support**: App.json indicates iOS, Android, and Web platform support
4. **Location feature**: Android location permissions in app.json suggest donor/request location tracking
5. **No request serialization layer**: API responses used directly without DTO/mapper layer

---

## Security & operational notes ⚠️
- **Secrets in repo**: `backend/server.js` contains hard-coded Gmail credentials. Move to environment variables (`process.env`) and add a `.env` (and `.env.example`) to the repo, and add `.env` to `.gitignore` before committing.
- **Vulnerabilities**: `npm audit` has flagged `tar` via transitive dependencies (node-gyp / sqlite3). Address by carefully upgrading `sqlite3`/`node-gyp` or follow advisory steps rather than using force fixes.
- **Dev-only behaviors**: Some endpoints return `devCode` or log verification codes for development; remove or gate those before production.

## When Modifying Features
- **Adding screens**: Create screen in role-specific folder (e.g., `src/screens/donor`), add to the corresponding Navigator (`DonorNavigator.tsx`), and ensure route is only added when `userRole` matches in `AppNavigator.tsx`.
- **New API endpoint (backend)**: Add route handler to `backend/server.js`. Follow conventions: validate inputs, use `db.get/db.run/db.all`, log via `createAuditLog` for auditable actions, and create notifications via `createNotification` when user-facing events occur.
- **Service layer (frontend)**: Add a wrapper in `src/services/api/` (e.g., `profileApi.ts`), call the backend endpoint, and handle the `{ success: boolean }` response shape consistently in components/hooks.
- **Authentication changes**: Update `AuthContext.tsx` (session storage keys `@bdms_user_data`, `@bdms_auth_token`), `App.tsx` provider order, and `AppNavigator.tsx` navigation guards.
- **Database schema changes**: Make schema changes inside `initializeDatabase()` in `server.js`. Add defensive `ALTER TABLE` statements and maintain backward compatibility (the server already tolerates duplicate-column errors). When adding critical migrations, include a small script or document migration steps.
- **Dev and maintenance scripts**: Use `backend/reset-database.js` to wipe non-admin data and `backend/reset-admin.js` to restore admin credentials. Use `npm run dev` in `backend` for live reload with `nodemon`.

If anything above is unclear or you want a concise step-by-step checklist for a specific change (for example: "add donor profile field" or "add a new backend endpoint"), tell me which task and I will add a short checklist.

