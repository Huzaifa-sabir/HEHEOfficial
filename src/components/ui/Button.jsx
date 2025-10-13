import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  icon = null,
  iconPosition = 'right', // 'left' or 'right'
  fullWidth = false,
  onClick, 
  className = '',
  ...props 
}) => {
  const variants = {
    primary: `bg-[#8abcb9] hover:bg-[#a4cbc8] active:bg-[#7ba8a5] text-black font-semibold 
              transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] 
              hover:shadow-md hover:shadow-[#a4cbc8]/20 active:shadow-sm`,
    outline: `border-2 border-[#8abcb9] hover:border-[#a4cbc8] active:border-[#7ba8a5] 
              text-[#8abcb9] hover:text-[#a4cbc8] active:text-[#7ba8a5] hover:bg-[#8abcb9]/10 active:bg-[#8abcb9]/20 
              transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]`,
    ghost: `text-white/95 hover:bg-white/10 active:bg-white/20 hover:text-white 
            transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]`,
    danger: `bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-semibold 
             transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] 
             hover:shadow-md hover:shadow-red-500/20 active:shadow-sm`,
    success: `bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold 
              transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] 
              hover:shadow-md hover:shadow-green-500/20 active:shadow-sm`,
    warning: `bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-black font-semibold 
              transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] 
              hover:shadow-md hover:shadow-yellow-500/20 active:shadow-sm`,
    info: `bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold 
           transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] 
           hover:shadow-md hover:shadow-blue-500/20 active:shadow-sm`,
    secondary: `bg-white/10 hover:bg-white/20 active:bg-white/30 text-white/85 hover:text-white/95 font-medium 
                transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] 
                hover:shadow-md hover:shadow-white/10 active:shadow-sm`
  };
  
  // Mobile-first responsive sizing
  const sizes = {
    sm: 'px-3 py-2 text-sm sm:px-4 sm:py-2.5 sm:text-sm',
    md: 'px-4 py-2.5 text-base sm:px-6 sm:py-3 sm:text-base ',
    lg: 'px-6 py-3 text-base sm:px-8 sm:py-4 sm:text-lg '
  };

  // Icon spacing based on size
  const iconSpacing = {
    sm: 'gap-1.5 sm:gap-2',
    md: 'gap-2 sm:gap-2.5',
    lg: 'gap-2.5 sm:gap-3'
  };

  return (
    <button 
      onClick={onClick}
      className={`
        ${variants[variant]} 
        ${sizes[size]} 
        ${fullWidth ? 'w-full' : 'w-auto'}
        rounded-md
        flex flex-nowrap items-center justify-center
        ${icon ? iconSpacing[size] : ''}
        cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed 
        disabled:hover:scale-100 disabled:active:scale-100
        focus:outline-none focus:ring-2 focus:ring-[#8abcb9]/50 focus:ring-offset-2 focus:ring-offset-[#0a0a0a]
        touch-manipulation
        select-none
        ${className}
      `}
      {...props}
    >
      {icon && iconPosition === 'left' && (
        <span className="flex items-center justify-center flex-shrink-0">
          {icon}
        </span>
      )}
      
      <span className="text-center leading-none flex-shrink-0">
        {children}
      </span>
      
      {icon && iconPosition === 'right' && (
        <span className="flex items-center justify-center flex-shrink-0">
          {icon}
        </span>
      )}
    </button>
  );
};

export default Button;