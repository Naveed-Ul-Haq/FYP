/**
 * Email Service
 * 
 * Handles email-related operations such as sending verification codes
 */

// Store verification codes in memory (in production, would be backend)
const verificationCodes: Record<string, { code: string; createdAt: number }> = {};

/**
 * Send a verification code to the user's email
 * @param email - User's email address
 * @param purpose - Purpose of verification (registration, password-reset, etc)
 * @returns Promise with status and message
 */
export const sendVerificationCode = async (
  email: string,
  purpose: 'registration' | 'password-reset' | 'email-change'
): Promise<{ success: boolean; message: string }> => {
  try {
    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store the code with timestamp (valid for 10 minutes)
    verificationCodes[email] = {
      code,
      createdAt: Date.now(),
    };

    // In a real app, this would call an email service API (SendGrid, AWS SES, etc.)
    console.log(`Verification code for ${email}: ${code}`);

    return {
      success: true,
      message: `Verification code sent to ${email}`,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to send verification code',
    };
  }
};

/**
 * Verify the code provided by the user
 * @param email - User's email address
 * @param code - Verification code entered by user
 * @returns Promise with verification status
 */
export const verifyCode = async (
  email: string,
  code: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const stored = verificationCodes[email];

    if (!stored) {
      return {
        success: false,
        message: 'No verification code found. Please request a new one.',
      };
    }

    // Check if code is expired (10 minutes)
    const isExpired = Date.now() - stored.createdAt > 10 * 60 * 1000;
    if (isExpired) {
      delete verificationCodes[email];
      return {
        success: false,
        message: 'Verification code has expired. Please request a new one.',
      };
    }

    // Check if code matches
    if (stored.code !== code) {
      return {
        success: false,
        message: 'Invalid verification code',
      };
    }

    // Code is valid, remove it
    delete verificationCodes[email];

    return {
      success: true,
      message: 'Email verified successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Verification failed',
    };
  }
};

/**
 * Resend verification code
 * @param email - User's email address
 * @param purpose - Purpose of verification
 * @returns Promise with status
 */
export const resendVerificationCode = async (
  email: string,
  purpose: 'registration' | 'password-reset' | 'email-change'
): Promise<{ success: boolean; message: string }> => {
  return sendVerificationCode(email, purpose);
};
