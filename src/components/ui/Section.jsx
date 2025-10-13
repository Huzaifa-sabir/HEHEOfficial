import React from 'react';

const Section = ({ 
  children, 
  className = '', 
  padding = 'tight', // 'tight', 'normal', 'loose'
  maxWidth = '7xl', // 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', 'full'
  centered = true 
}) => {
  
  // Mobile-first responsive padding options
  const paddingOptions = {
    tight: 'py-8 sm:py-12 md:py-16',
    normal: 'py-12 sm:py-16 md:py-20 lg:py-24',
    loose: 'py-16 sm:py-20 md:py-24 lg:py-32'
  };

  // Responsive container max-widths
  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full'
  };

  // Mobile-first responsive horizontal padding
  const horizontalPadding = 'px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10';

  return (
    <section className={`
      ${paddingOptions[padding] || paddingOptions.normal}
      bg-[#0a0a0a]
      w-full
      ${className}
    `}>
      <div className={`
        ${maxWidths[maxWidth] || maxWidths['7xl']}
        ${centered ? 'mx-auto' : ''}
        ${horizontalPadding}
        w-full
      `}>
        {children}
      </div>
    </section>
  );
};

export default Section;