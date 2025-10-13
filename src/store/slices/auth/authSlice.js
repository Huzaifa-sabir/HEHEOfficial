// store/slices/authSlice.js
import { createSlice } from '@reduxjs/toolkit';
import {
  loginUser,
  signupUser,
  verifyEmail,
  resendOTP,
  fetchUserProfile,
  updateUserProfile,
  changePassword,
  deleteAccount,
  resetPassword,
  logoutUser
} from './authThunks';

const initialState = {
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('authToken') : null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
  
  // UI states
  loginLoading: false,
  signupLoading: false,
  verificationLoading: false,
  profileLoading: false,
  profileUpdateLoading: false,
  passwordChangeLoading: false,
  deleteAccountLoading: false,
  resetPasswordLoading: false,
  
  // Verification states
  isEmailVerified: false,
  otpSent: false,
  
  // Messages
  successMessage: null,
  
  // Form states
  showPassword: false,
  showConfirmPassword: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // UI actions
    togglePasswordVisibility: (state) => {
      state.showPassword = !state.showPassword;
    },
    toggleConfirmPasswordVisibility: (state) => {
      state.showConfirmPassword = !state.showConfirmPassword;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    
    // Auth actions
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
      state.isInitialized = true;
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isEmailVerified = false;
      state.error = null;
      state.successMessage = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
      }
    },
    
    // Initialize auth state from localStorage
    initializeAuth: (state) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      if (token) {
        state.token = token;
        state.isAuthenticated = true;
      }
      state.isInitialized = true;
    },
    
    // Set token
    setToken: (state, action) => {
      state.token = action.payload;
      if (typeof window !== 'undefined') {
        if (action.payload) {
          localStorage.setItem('authToken', action.payload);
        } else {
          localStorage.removeItem('authToken');
        }
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loginLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loginLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isEmailVerified = action.payload.user?.isVerified || false;
        state.successMessage = 'Login successful!';
        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', action.payload.token);
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loginLoading = false;
        state.error = action.payload;
      });

    // Signup
    builder
      .addCase(signupUser.pending, (state) => {
        state.signupLoading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.signupLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isEmailVerified = false;
        state.successMessage = 'Account created! Please verify your email.';
        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', action.payload.token);
        }
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.signupLoading = false;
        state.error = action.payload;
      });

    // Verify Email
    builder
      .addCase(verifyEmail.pending, (state) => {
        state.verificationLoading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.verificationLoading = false;
        state.isEmailVerified = true;
        state.successMessage = 'Email verified successfully!';
        if (state.user) {
          state.user.isVerified = true;
        }
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.verificationLoading = false;
        state.error = action.payload;
      });

    // Resend OTP
    builder
      .addCase(resendOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resendOTP.fulfilled, (state) => {
        state.isLoading = false;
        state.otpSent = true;
        state.successMessage = 'OTP sent to your email!';
      })
      .addCase(resendOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch User Profile
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.profileLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.user = action.payload;
        state.isEmailVerified = action.payload?.isVerified;
        state.isAuthenticated = true;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.profileLoading = false;
        if (action.payload === 'Unauthorized') {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
          if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
          }
        }
        state.error = action.payload;
      });

    // Update User Profile
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.profileUpdateLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.profileUpdateLoading = false;
        state.user = { ...state.user, ...action.payload };
        state.successMessage = 'Profile updated successfully!';
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.profileUpdateLoading = false;
        state.error = action.payload;
      });

    // Change Password
    builder
      .addCase(changePassword.pending, (state) => {
        state.passwordChangeLoading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.passwordChangeLoading = false;
        state.successMessage = 'Password changed successfully!';
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.passwordChangeLoading = false;
        state.error = action.payload;
      });

    // Delete Account
    builder
      .addCase(deleteAccount.pending, (state) => {
        state.deleteAccountLoading = true;
        state.error = null;
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        state.deleteAccountLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.successMessage = 'Account deleted successfully';
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
        }
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.deleteAccountLoading = false;
        state.error = action.payload;
      });

    // Reset Password
    builder
      .addCase(resetPassword.pending, (state) => {
        state.resetPasswordLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.resetPasswordLoading = false;
        state.successMessage = 'Password reset successfully!';
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.resetPasswordLoading = false;
        state.error = action.payload;
      });

    // Logout
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isEmailVerified = false;
        state.error = null;
        state.successMessage = null;
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
        }
      });
  },
});

export const {
  togglePasswordVisibility,
  toggleConfirmPasswordVisibility,
  clearError,
  clearSuccessMessage,
  clearMessages,
  setAuthenticated,
  clearAuth,
  initializeAuth,
  setToken,
} = authSlice.actions;

export default authSlice.reducer;
