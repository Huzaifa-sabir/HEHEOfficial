"use client";

import { useEffect } from "react";
import { Check, X } from "lucide-react";

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === "success" 
    ? "border-green-600/30 text-white bg-green-600/20" 
    : "border-red-600/30 text-white bg-red-600/20";
  const icon = type === "success" ? <Check /> : <X />;

  return (
    <>
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
      
      <div
        className={`fixed top-4 right-4 ${bgColor} border px-6 py-3 rounded-xl backdrop-blur-sm shadow-lg z-50 flex items-center gap-3 animate-slide-in`}
      >
        <span className="text-lg font-bold">{icon}</span>
        <span>{message}</span>
        <button
          onClick={onClose}
          className="ml-2 text-white hover:text-gray-200 font-bold text-xl"
        >
          ×
        </button>
      </div>
    </>
  );
};

export default Toast;