'use client';
import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, RefreshCw } from 'lucide-react';
import { Toast } from "@components/ui";
import { useAuth } from '@hooks/useAuth';

// Custom Toast Hook
const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type) => {
    const id = Date.now();
    const newToast = { id, message, type };
    
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const toast = {
    success: (message) => showToast(message, 'success'),
    error: (message) => showToast(message, 'error'),
    info: (message) => showToast(message, 'info')
  };

  const ToastContainer = () => (
    <div className="fixed top-0 right-0 p-4 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );

  return { toast, ToastContainer };
};

// Custom color classes to match your theme
const colors = {
  text: '#fafafa',
  background: '#0a0a0a',
  accent: '#8abcb9',
  accentHover: '#a4cbc8',
  warning: '#ca8a04', // yellow-600
  danger: '#dc2626'   // red-600
};

const ForgotPasswordPage = ({ onNavigateToReset }) => {
  const [email, setEmail] = useState('');
  const { toast, ToastContainer } = useToast();
  
  const {
    resendCode,
    loadingStates,
    error,
    successMessage,
    clearAuthError,
    clearAuthSuccess
  } = useAuth();

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      if (successMessage.includes('OTP sent')) {
        setTimeout(() => {
          onNavigateToReset(email);
        }, 2000);
      }
      clearAuthSuccess();
    }
  }, [successMessage, clearAuthSuccess, toast, email, onNavigateToReset]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearAuthError();
    }
  }, [error, clearAuthError, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    resendCode(email);
  };

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: colors.background }}>
        <div className="w-full max-w-md">
          <div className="bg-neutral-900 rounded-2xl shadow-2xl p-8 border border-neutral-800">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2" style={{ color: colors.text }}>
                Forgot Password?
              </h1>
              <p className="text-neutral-400">
                Enter your email address and we&apos;ll send you an OTP to reset your password.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 text-white placeholder-neutral-400 focus:ring-[#8abcb9]"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loadingStates.anyLoading}
                className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                style={{ 
                  backgroundColor: colors.accent,
                  color: colors.background
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = colors.accentHover}
                onMouseLeave={(e) => e.target.style.backgroundColor = colors.accent}
              >
                {loadingStates.anyLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <span>Send OTP</span>
                )}
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-neutral-400">
                Remember your password?{' '}
                <a href="/login" className="font-medium hover:underline" style={{ color: colors.accent }}>
                  Sign in
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const ResetPasswordPage = ({ initialEmail, onNavigateBack }) => {
  const [email, setEmail] = useState(initialEmail || '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const { toast, ToastContainer } = useToast();
  
  const {
    resetUserPassword,
    resendCode,
    loadingStates,
    error,
    successMessage,
    auth,
    clearAuthError,
    clearAuthSuccess,
    togglePassword,
    toggleConfirmPassword
  } = useAuth();

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      if (successMessage.includes('reset successfully')) {
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else if (successMessage.includes('OTP sent')) {
        clearAuthSuccess();
        setResendCooldown(60); // 60 second cooldown
      }
      clearAuthSuccess();
    }
  }, [successMessage, clearAuthSuccess, toast]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearAuthError();
    }
  }, [error, clearAuthError, toast]);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendOtp = async () => {
    if (!email || resendCooldown > 0) return;
    
    const result = await resendCode(email);
    if (result.meta?.requestStatus === 'fulfilled') {
      setResendCooldown(0); // Set cooldown immediately after successful request
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !otp || !newPassword || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    resetUserPassword(email, otp, newPassword, confirmPassword);
  };

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: colors.background }}>
        <div className="w-full max-w-md">
          <div className="bg-neutral-900 rounded-2xl shadow-2xl p-8 border border-neutral-800">
            <div className="text-center mb-8">
              <button
                onClick={onNavigateBack}
                className="inline-flex items-center space-x-2 text-neutral-400 hover:text-neutral-300 mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              
              <h1 className="text-3xl font-bold mb-2" style={{ color: colors.text }}>
                Reset Password
              </h1>
              <p className="text-neutral-400">
                Enter the OTP sent to your email and create a new password.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 text-white placeholder-neutral-400 focus:ring-[#8abcb9]"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="otp" className="block text-sm font-medium" style={{ color: colors.text }}>
                    OTP Code
                  </label>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loadingStates.anyLoading || resendCooldown > 0}
                    className="text-sm font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                    style={{ color: colors.accent }}
                  >
                    {loadingStates.anyLoading ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : resendCooldown > 0 ? (
                      <span>Resend in {resendCooldown}s</span>
                    ) : (
                      <span>Resend OTP</span>
                    )}
                  </button>
                </div>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 text-white placeholder-neutral-400 text-center text-lg tracking-widest focus:ring-[#8abcb9]"
                  placeholder="000000"
                  maxLength="6"
                  required
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                  <input
                    id="newPassword"
                    type={auth.showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 text-white placeholder-neutral-400 focus:ring-[#8abcb9]"
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePassword}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-300"
                  >
                    {auth.showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                  <input
                    id="confirmPassword"
                    type={auth.showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 text-white placeholder-neutral-400 focus:ring-[#8abcb9]"
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPassword}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-300"
                  >
                    {auth.showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loadingStates.resetPasswordLoading}
                className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                style={{ 
                  backgroundColor: colors.accent,
                  color: colors.background
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = colors.accentHover}
                onMouseLeave={(e) => e.target.style.backgroundColor = colors.accent}
              >
                {loadingStates.resetPasswordLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  <span>Reset Password</span>
                )}
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-neutral-400">
                Remember your password?{' '}
                <a href="/login" className="font-medium hover:underline" style={{ color: colors.accent }}>
                  Sign in
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const PasswordResetApp = () => {
  const [currentPage, setCurrentPage] = useState('forgot'); // 'forgot' or 'reset'
  const [userEmail, setUserEmail] = useState('');

  const navigateToReset = (email) => {
    setUserEmail(email);
    setCurrentPage('reset');
  };

  const navigateBack = () => {
    setCurrentPage('forgot');
  };

  if (currentPage === 'reset') {
    return <ResetPasswordPage initialEmail={userEmail} onNavigateBack={navigateBack} />;
  }

  return <ForgotPasswordPage onNavigateToReset={navigateToReset} />;
};

export default PasswordResetApp;