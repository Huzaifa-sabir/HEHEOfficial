// store/slices/auth/authSelectors.js
import { createSelector } from '@reduxjs/toolkit';

// Basic selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsInitialized = (state) => state.auth.isInitialized;
export const selectError = (state) => state.auth.error;
export const selectSuccessMessage = (state) => state.auth.successMessage;

// Loading state selectors
export const selectLoginLoading = (state) => state.auth.loginLoading;
export const selectSignupLoading = (state) => state.auth.signupLoading;
export const selectVerificationLoading = (state) => state.auth.verificationLoading;
export const selectProfileLoading = (state) => state.auth.profileLoading;
export const selectProfileUpdateLoading = (state) => state.auth.profileUpdateLoading;
export const selectPasswordChangeLoading = (state) => state.auth.passwordChangeLoading;
export const selectDeleteAccountLoading = (state) => state.auth.deleteAccountLoading;
export const selectResetPasswordLoading = (state) => state.auth.resetPasswordLoading;
export const selectAllLoading = (state) => state.auth.isLoading || false;

// UI state selectors
export const selectShowPassword = (state) => state.auth.showPassword;
export const selectShowConfirmPassword = (state) => state.auth.showConfirmPassword;

// User information selectors - Fixed to use the correct property
export const selectIsEmailVerified = (state) => state.auth.isEmailVerified;
export const selectUserEmail = (state) => state.auth.user?.email;
export const selectUserFullName = (state) => state.auth.user?.fullName;
export const selectUserContactNumber = (state) => state.auth.user?.contactNumber;
export const selectIsAdmin = (state) => state.auth.user?.isAdmin || false;




// Complex selectors using createSelector for memoization
export const selectAuthStatus = createSelector(
  [selectIsAuthenticated, selectIsEmailVerified, selectUser, selectIsInitialized],
  (isAuthenticated, isEmailVerified, user, isInitialized) => ({
    isAuthenticated,
    isEmailVerified,
    needsEmailVerification: isAuthenticated && !isEmailVerified,
    userExists: !!user,
    isInitialized,
  })
);

export const selectLoadingStates = createSelector(
  [
    selectLoginLoading,
    selectSignupLoading,
    selectVerificationLoading,
    selectProfileLoading,
    selectProfileUpdateLoading,
    selectPasswordChangeLoading,
    selectDeleteAccountLoading,
    selectResetPasswordLoading,
    selectAllLoading,
  ],
  (
    loginLoading,
    signupLoading,
    verificationLoading,
    profileLoading,
    profileUpdateLoading,
    passwordChangeLoading,
    deleteAccountLoading,
    resetPasswordLoading,
    isLoading,
  ) => ({
    loginLoading,
    signupLoading,
    verificationLoading,
    profileLoading,
    profileUpdateLoading,
    passwordChangeLoading,
    deleteAccountLoading,
    resetPasswordLoading,
    isLoading,
    anyLoading: 
      loginLoading || 
      signupLoading || 
      verificationLoading || 
      profileLoading || 
      profileUpdateLoading || 
      passwordChangeLoading || 
      deleteAccountLoading || 
      resetPasswordLoading ||
      isLoading,
  })
);

export const selectUserProfile = createSelector(
  [selectUser],
  (user) => {
    if (!user) return null;
    
    return {
      fullName: user.fullName,
      email: user.email,
      contactNumber: user.contactNumber,
      isVerified: user.isVerified,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
);

export const selectCanPerformActions = createSelector(
  [selectIsAuthenticated, selectIsEmailVerified],
  (isAuthenticated, isEmailVerified) => ({
    canLogin: true,
    canSignup: true,
    canVerifyEmail: isAuthenticated && !isEmailVerified,
    canAccessProfile: isAuthenticated && isEmailVerified,
    canUpdateProfile: isAuthenticated && isEmailVerified,
    canChangePassword: isAuthenticated && isEmailVerified,
    canDeleteAccount: isAuthenticated && isEmailVerified,
  })
);