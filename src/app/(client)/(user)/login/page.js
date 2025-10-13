// Updated Login Page using Redux
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Toast } from '@components/ui';
import { useAuth } from '@hooks/useAuth';

export default function LoginPageRedux() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const router = useRouter();
  const {
    login,
    loadingStates,
    error,
    successMessage,
    authStatus,
    auth,
    clearAllMessages,
    togglePassword
  } = useAuth();

  // Handle successful login
  useEffect(() => {
    if (authStatus.isAuthenticated && successMessage) {
      setTimeout(() => {
        if (authStatus.needsEmailVerification) {
          router.push('/verifyemailpage');
        } else {
          router.push('/');
        }
      }, 1500);
    }
  }, [authStatus, successMessage, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearAllMessages();
    
    try {
      await login(formData).unwrap();
    } catch (err) {
      // Error is handled by Redux
      console.error('Login failed:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-[95vh] bg-[#0a0a0a] flex items-center justify-center">
      <div className="max-w-md w-full space-y-4">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-[#fafafa] mb-2">HEHE</h2>
          <p className="text-gray-400">Welcome back</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
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

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">
                  Remember me
                </label>
              </div>

              <Link href="/forgot-password" className="text-sm text-[#8abcb9] hover:text-[#a4cbc8]">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loadingStates.loginLoading}
              className="w-full bg-[#8abcb9] text-[#0a0a0a] py-3 rounded-xl font-semibold hover:bg-[#a4cbc8] focus:outline-none focus:ring-2 focus:ring-[#8abcb9] focus:ring-offset-2 focus:ring-offset-[#0a0a0a] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingStates.loginLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-[#8abcb9] hover:text-[#a4cbc8] font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      {error && (
        <Toast message={error} type="error" onClose={clearAllMessages} />
      )}
      {successMessage && (
        <Toast message={successMessage} type="success" onClose={clearAllMessages} />
      )}
    </div>
  );
}