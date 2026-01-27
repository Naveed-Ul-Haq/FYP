export type RootStackParamList = {
  // Authentication Screens (No role required)
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  
  // Role-Based Home Screens (RBAC enforced)
  AdminDashboard: undefined;      // Only accessible to admin
  ProfileApprovals: undefined;    // Admin profile approval screen
  ManageUsers: undefined;         // Admin user management screen
  UserProfileDetail: { userId: string };  // Admin view/manage user profile
  AppealsList: undefined;         // Admin view/respond to appeals
  ViewRequests: undefined;        // Admin blood requests monitoring screen
  AdminAuditLogs: undefined;      // Admin audit logs screen
  AdminProfile: undefined;        // Admin profile management screen
  Notifications: undefined;       // Notifications screen
  DonorStack: undefined;          // Donor navigation stack
  RecipientStack: undefined;      // Recipient navigation stack
  
  // Nested Navigator Screens (accessed via parent stacks)
  // Donor screens (via DonorStack)
  DonorHome: undefined;
  DonorProfileForm: undefined;
  AvailableRequests: undefined;
  
  // Recipient screens (via RecipientStack)
  UserHome: undefined;
  RecipientProfileForm: undefined;
  CreateBloodRequest: undefined;
  RequestStatus: { requestId: string };
  
  // Shared screens
  LiveTracking: { requestId: string; donorId: string };
  RatingScreen: { requestId: string; donorId: string; donorName: string; recipientName: string };
};

export type DonorStackParamList = {
  DonorHome: undefined;
  DonorProfileForm: undefined;
  AvailableRequests: undefined;
  RequestHistory: undefined;
  LiveTracking: { requestId: string; donorId: string };
};

export type RecipientStackParamList = {
  UserHome: undefined;
  RecipientProfileForm: undefined;
  RecipientProfile: undefined;
  CreateBloodRequest: undefined;
  RequestStatus: { requestId: string };
  RequestHistory: undefined;
  RecipientNotifications: undefined;
  LiveTracking: { requestId: string; donorId: string };
};

export type UserRole = 'admin' | 'donor' | 'user' | null;

