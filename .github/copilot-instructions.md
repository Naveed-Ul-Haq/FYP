# BDMS Codebase Instructions for AI Agents

## Project Overview
Blood Donation Management System (BDMS) is a **React Native/Expo** + **Node.js/Express/SQLite** full-stack application with role-based access control (RBAC) supporting three user types: admin, donor, and recipient (user).

## Critical Architecture Patterns

### 1. Context Provider Layering (Provider Hell Prevention)
**File**: [App.tsx](../App.tsx)  
Provider nesting order **matters**:
```
AlertProvider → AuthProvider → BloodRequestProvider → NavigationContainer → AppNavigator
```
- **AuthProvider must wrap NavigationContainer** so navigation can access auth state
- **BloodRequestProvider depends on AuthContext**, so must be nested inside AuthProvider
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
- Axios client points to `http://localhost:3000/api`
- Auth API includes: login, register, logout, forgotPassword, verifyOTP
- API methods return axios response objects directly (no error wrapping)

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

## When Modifying Features
- **Adding screens**: Create in role-specific subdirectory, add to appropriate Navigator
- **New API endpoint**: Add to `services/api/[domain]Api.ts`, call from service layer not components
- **Authentication changes**: Must update AuthContext, App.tsx provider order, and backend auth routes
- **Database schema**: Alter in `initializeDatabase()`, handle migrations for existing installations
