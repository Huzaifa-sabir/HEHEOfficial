'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, User, Mail, Lock, Phone } from 'lucide-react';
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
    warning: (message) => showToast(message, 'warning')
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

export default function SignupPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    contactNumber: '',
    password: '',
    confirmPassword: ''
  });
  
  const router = useRouter();
  const { toast, ToastContainer } = useToast();
  
  const {
    signup,
    loadingStates,
    error,
    successMessage,
    auth,
    clearAuthError,
    clearAuthSuccess,
    togglePassword,
    toggleConfirmPassword
  } = useAuth();

  // Handle success/error messages
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      clearAuthSuccess();
      router.push('/verifyemailpage');
    }
  }, [successMessage, clearAuthSuccess, toast, router]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearAuthError();
    }
  }, [error, clearAuthError, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (formData.fullName.trim().length < 2) {
      toast.error('Full name must be at least 2 characters');
      return;
    }

    if (formData.contactNumber.length < 10) {
      toast.error('Contact number must be at least 10 digits');
      return;
    }

    const userData = {
      fullName: formData.fullName,
      email: formData.email,
      contactNumber: formData.contactNumber,
      password: formData.password
    };

    signup(userData);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-[#fafafa] mb-2">HEHE</h2>
          <p className="text-gray-400">Create your account</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#fafafa] mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-[#fafafa] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8abcb9] focus:border-transparent"
                  placeholder="Enter full name"
                  minLength="2"
                  maxLength="50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#fafafa] mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-[#fafafa] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8abcb9] focus:border-transparent"
                  placeholder="Enter email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#fafafa] mb-2">
                Contact Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  name="contactNumber"
                  required
                  value={formData.contactNumber}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-[#fafafa] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8abcb9] focus:border-transparent"
                  placeholder="Enter contact number"
                  minLength="10"
                  maxLength="15"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#fafafa] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={auth.showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-[#fafafa] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8abcb9] focus:border-transparent"
                  placeholder="Enter password"
                  minLength="6"
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#fafafa]"
                >
                  {auth.showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#fafafa] mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={auth.showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-[#fafafa] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8abcb9] focus:border-transparent"
                  placeholder="Confirm password"
                  minLength="6"
                />
                <button
                  type="button"
                  onClick={toggleConfirmPassword}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#fafafa]"
                >
                  {auth.showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingStates.signupLoading}
              className="w-full bg-[#8abcb9] text-[#0a0a0a] py-3 rounded-xl font-semibold hover:bg-[#a4cbc8] focus:outline-none focus:ring-2 focus:ring-[#8abcb9] focus:ring-offset-2 focus:ring-offset-[#0a0a0a] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingStates.signupLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="text-[#8abcb9] hover:text-[#a4cbc8] font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}