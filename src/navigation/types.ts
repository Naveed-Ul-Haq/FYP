export type RootStackParamList = {

  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  
  
  AdminDashboard: undefined;      
  ProfileApprovals: undefined;   
  ManageUsers: undefined;         
  UserProfileDetail: { userId: string };  
  AppealsList: undefined;         
  ViewRequests: undefined;       
  AdminAuditLogs: undefined;      
  AdminProfile: undefined;        
  Notifications: undefined;       
  DonorStack: undefined;         
  RecipientStack: undefined;      
  

  DonorHome: undefined;
  DonorProfileForm: undefined;
  AvailableRequests: undefined;
  

  UserHome: undefined;
  RecipientProfileForm: undefined;
  CreateBloodRequest: undefined;
  RequestStatus: { requestId: string };
  

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
  CreateBloodRequest: undefined;
  RequestStatus: { requestId: string };
  RequestHistory: undefined;
  LiveTracking: { requestId: string; donorId: string };
};

export type UserRole = 'admin' | 'donor' | 'user' | null;

