import { apiClient } from './apiClient';

export const profileApi = {
  /**
   * Get user profile
   * @param userId - User ID
   * @returns User profile data
   */
  getProfile: async (userId: string) => {
    return apiClient.get(`/profiles/${userId}`);
  },

  /**
   * Update user profile
   * @param userId - User ID
   * @param profileData - Profile data to update
   * @returns Updated profile
   */
  updateProfile: async (userId: string, profileData: any) => {
    return apiClient.put(`/profiles/${userId}`, profileData);
  },

  /**
   * Upload profile picture
   * @param userId - User ID
   * @param imageData - Image data (file or base64)
   * @returns Upload result
   */
  uploadProfilePicture: async (userId: string, imageData: any) => {
    const formData = new FormData();
    formData.append('file', imageData);
    return apiClient.post(`/profiles/${userId}/picture`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Get donor profile
   * @param donorId - Donor ID
   * @returns Donor profile data
   */
  getDonorProfile: async (donorId: string) => {
    return apiClient.get(`/profiles/donor/${donorId}`);
  },

  /**
   * Update donor profile
   * @param donorId - Donor ID
   * @param profileData - Profile data to update
   * @returns Updated donor profile
   */
  updateDonorProfile: async (donorId: string, profileData: any) => {
    return apiClient.put(`/profiles/donor/${donorId}`, profileData);
  },

  /**
   * Get recipient profile
   * @param recipientId - Recipient ID
   * @returns Recipient profile data
   */
  getRecipientProfile: async (recipientId: string) => {
    return apiClient.get(`/profiles/recipient/${recipientId}`);
  },

  /**
   * Update recipient profile
   * @param recipientId - Recipient ID
   * @param profileData - Profile data to update
   * @returns Updated recipient profile
   */
  updateRecipientProfile: async (recipientId: string, profileData: any) => {
    return apiClient.put(`/profiles/recipient/${recipientId}`, profileData);
  },
};
