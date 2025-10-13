// hooks/useAuth.js
import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect } from 'react';
import {
  selectAuth,
  selectUser,
  selectIsAuthenticated,
  selectIsEmailVerified,
  selectAuthStatus,
  selectLoadingStates,
  selectError,
  selectSuccessMessage,
} from '../store/slices/auth/authSelectors';
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
  logoutUser,
} from '../store/slices/auth/authThunks';
import {
  clearError,
  clearSuccessMessage,
  clearMessages,
  initializeAuth,
  togglePasswordVisibility,
  toggleConfirmPasswordVisibility,
} from '../store/slices/auth/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  
  // Selectors
  const auth = useSelector(selectAuth);
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isEmailVerified = useSelector(selectIsEmailVerified);
  const authStatus = useSelector(selectAuthStatus);
  const loadingStates = useSelector(selectLoadingStates);
  const error = useSelector(selectError);
  const successMessage = useSelector(selectSuccessMessage);

  // Initialize auth on mount
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  // Actions
  const login = useCallback((credentials) => {
    return dispatch(loginUser(credentials));
  }, [dispatch]);

  const signup = useCallback((userData) => {
    return dispatch(signupUser(userData));
  }, [dispatch]);

  const verify = useCallback((email, otp) => {
    return dispatch(verifyEmail({ email, otp }));
  }, [dispatch]);

  const resendCode = useCallback((email) => {
    return dispatch(resendOTP({ email }));
  }, [dispatch]);

  const getProfile = useCallback(() => {
    return dispatch(fetchUserProfile());
  }, [dispatch]);

  const updateProfile = useCallback((profileData) => {
    return dispatch(updateUserProfile(profileData));
  }, [dispatch]);

  const updatePassword = useCallback((currentPassword, newPassword) => {
    return dispatch(changePassword({ currentPassword, newPassword }));
  }, [dispatch]);

  const removeAccount = useCallback((password) => {
    return dispatch(deleteAccount({ password }));
  }, [dispatch]);

  const resetUserPassword = useCallback((email, otp, newPassword, confirmPassword) => {
    return dispatch(resetPassword({ email, otp, newPassword, confirmPassword }));
  }, [dispatch]);

  const logout = useCallback(() => {
    return dispatch(logoutUser());
  }, [dispatch]);

  // UI actions
  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const clearAuthSuccess = useCallback(() => {
    dispatch(clearSuccessMessage());
  }, [dispatch]);

  const clearAllMessages = useCallback(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  const togglePassword = useCallback(() => {
    dispatch(togglePasswordVisibility());
  }, [dispatch]);

  const toggleConfirmPassword = useCallback(() => {
    dispatch(toggleConfirmPasswordVisibility());
  }, [dispatch]);

  return {
    // State
    auth,
    user,
    isAuthenticated,
    isEmailVerified,
    authStatus,
    loadingStates,
    error,
    successMessage,
    
    // Actions
    login,
    signup,
    verify,
    resendCode,
    getProfile,
    updateProfile,
    updatePassword,
    removeAccount,
    resetUserPassword,
    logout,
    
    // UI actions
    clearAuthError,
    clearAuthSuccess,
    clearAllMessages,
    togglePassword,
    toggleConfirmPassword,
  };
};