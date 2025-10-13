"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, CheckCircle, ArrowLeft } from "lucide-react";
import { Toast } from "@components/ui";
import { useAuth } from "@hooks/useAuth";

// Custom Toast Hook
const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type, duration = 4000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration };

    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const toast = {
    success: (message, duration) => showToast(message, "success", duration),
    error: (message, duration) => showToast(message, "error", duration),
    info: (message, duration) => showToast(message, "info", duration),
  };

  const ToastContainer = () => (
    <div className="fixed top-0 right-0 p-4 z-50 space-y-2">
      {toasts.map((toast) => (
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

// Separate component that uses useSearchParams
function VerifyEmailContent() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast, ToastContainer } = useToast();

  const {
    user,
    verify,
    resendCode,
    getProfile,
    loadingStates,
    error,
    successMessage,
    clearAuthError,
    clearAuthSuccess,
    isEmailVerified,
  } = useAuth();

  useEffect(() => {
    // First try to get email from URL params
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
      setIsEmailLoading(false);
    } else if (user?.email) {
      // If user is available, use their email
      setEmail(user.email);
      setIsEmailLoading(false);
    } else {
      // If no email in URL and no user, try to fetch from profile API
      fetchEmailFromProfile();
    }
  }, [searchParams, user]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      if (successMessage.includes("verified")) {
        setIsVerified(true);
        setTimeout(() => {
          router.push("/profile");
        }, 2000);
      }
      clearAuthSuccess();
    }
  }, [successMessage, clearAuthSuccess, toast, router]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearAuthError();
    }
  }, [error, clearAuthError, toast]);

  // Check if user is already verified
  useEffect(() => {
    if (isEmailVerified) {
      setIsVerified(true);
    }
  }, [isEmailVerified]);

  const fetchEmailFromProfile = async () => {
    try {
      const result = await getProfile();
      if (result.payload?.email) {
        setEmail(result.payload.email);
        toast.success("Email automatically loaded from your profile");
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    if (!/^\d{6}$/.test(pastedData)) return;

    const newOtp = pastedData.split("");
    setOtp(newOtp);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const otpString = otp.join("");
    if (otpString.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP");
      return;
    }

    if (!email) {
      toast.error("Email is required");
      return;
    }

    verify(email, otpString);
  };

  const handleResendOTP = async () => {
    if (!email) {
      toast.error("Email is required to resend OTP");
      return;
    }

    const result = await resendCode(email);
    if (result.meta.requestStatus === "fulfilled") {
      setOtp(["", "", "", "", "", ""]);
    }
  };

  if (isVerified) {
    return (
      <>
        <ToastContainer />
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
          <div className="max-w-md w-full space-y-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center">
              <CheckCircle className="w-16 h-16 text-[#8abcb9] mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-[#fafafa] mb-2">
                Email Verified!
              </h2>
              <p className="text-gray-400 mb-6">
                Your email has been successfully verified. You will be
                redirected to your profile shortly.
              </p>
              <Link
                href="/profile"
                className="inline-flex items-center px-6 py-3 bg-[#8abcb9] text-[#0a0a0a] rounded-xl font-semibold hover:bg-[#a4cbc8] transition-all duration-200"
              >
                Continue to Profile
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-[#8abcb9]/20 p-3 rounded-full">
                <Mail className="w-8 h-8 text-[#8abcb9]" />
              </div>
            </div>
            <h2 className="text-4xl font-bold text-[#fafafa] mb-2">
              Verify Your Email
            </h2>
            <p className="text-gray-400">
              We&apos;ve sent a 6-digit verification code to your email
            </p>
            {isEmailLoading && (
              <div className="flex items-center justify-center mt-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#8abcb9]"></div>
                <span className="ml-2 text-sm text-gray-400">
                  Loading email...
                </span>
              </div>
            )}
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={handleEmailChange}
                    disabled={isEmailLoading}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-[#fafafa] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8abcb9] focus:border-transparent disabled:opacity-60"
                    placeholder="Enter your email"
                  />
                </div>
                {email && (
                  <p className="text-sm text-gray-400 mt-1">
                    Code will be sent to:{" "}
                    <span className="text-[#8abcb9]">{email}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-4">
                  Enter Verification Code
                </label>
                <div className="flex space-x-3 justify-center">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className="w-12 h-12 text-center text-xl font-bold bg-white/10 border border-white/20 rounded-xl text-[#fafafa] focus:outline-none focus:ring-2 focus:ring-[#8abcb9] focus:border-transparent"
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={
                  loadingStates.verificationLoading ||
                  otp.join("").length !== 6
                }
                className="w-full bg-[#8abcb9] text-[#0a0a0a] py-3 rounded-xl font-semibold hover:bg-[#a4cbc8] focus:outline-none focus:ring-2 focus:ring-[#8abcb9] focus:ring-offset-2 focus:ring-offset-[#0a0a0a] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingStates.verificationLoading
                  ? "Verifying..."
                  : "Verify Email"}
              </button>
            </div>

            <div className="mt-6 text-center space-y-4">
              <p className="text-gray-400">
                Didn&apos;t receive the code?{" "}
                <button
                  onClick={handleResendOTP}
                  disabled={loadingStates.isLoading}
                  className="text-[#8abcb9] hover:text-[#a4cbc8] font-medium disabled:opacity-50 transition-colors"
                >
                  {loadingStates.isLoading ? "Sending..." : "Resend OTP"}
                </button>
              </p>

              <div className="pt-4 border-t border-white/10">
                <Link
                  href="/signup"
                  className="inline-flex items-center text-gray-400 hover:text-[#fafafa] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Signup
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Loading component for Suspense fallback
function VerifyEmailLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-[#8abcb9]/20 p-3 rounded-full">
              <Mail className="w-8 h-8 text-[#8abcb9]" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-[#fafafa] mb-2">
            Verify Your Email
          </h2>
          <div className="flex items-center justify-center mt-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#8abcb9]"></div>
            <span className="ml-2 text-gray-400">Loading...</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailLoading />}>
      <VerifyEmailContent />
    </Suspense>
  );
}