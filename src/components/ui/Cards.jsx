import * as React from "react";

const Card = React.forwardRef(({ 
  className = '', 
  variant = 'elevated', // 'default', 'elevated', 'outlined', 'glass'
  size = 'md', // 'sm', 'md', 'lg'
  hover = false,
  image = null,
  imageAlt = '',
  imagePosition = 'top', // 'top', 'left', 'right', 'background'
  ...props 
}, ref) => {
  
  const variants = {
    default: 'bg-white/5 border border-white/10 backdrop-blur-sm',
    elevated: 'bg-white/5 border border-white/10 shadow-xl shadow-black/20 backdrop-blur-sm',
    outlined: 'bg-transparent border-2 border-white/20 backdrop-blur-sm',
    glass: 'bg-white/10 border border-white/20 backdrop-blur-md shadow-lg shadow-black/10'
  };

  const sizes = {
    xs: 'rounded-xl text-xs min-w-[240px] max-w-xs',
    sm: 'rounded-xl text-sm min-w-[280px] max-w-sm',
    md: 'rounded-xl text-base min-w-[320px] max-w-md',
    lg: 'rounded-xl text-lg min-w-[400px] max-w-lg',
    xl: 'rounded-xl text-xl min-w-[500px] max-w-xl'
  };

  const hoverEffects = hover ? 
    'transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/30 hover:border-white/20 cursor-pointer' : 
    'transition-all duration-200';

  const cardClasses = `
    ${variants[variant]}
    ${sizes[size]}
    ${hoverEffects}
    text-white/95
    overflow-hidden
    w-full
    ${className}
  `;

  if (image && imagePosition === 'background') {
    return (
      <div
        ref={ref}
        className={`${cardClasses} relative`}
        {...props}
      >
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${image})` }}
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />
        <div className="relative z-10">
          {props.children}
        </div>
      </div>
    );
  }

  if (image && (imagePosition === 'left' || imagePosition === 'right')) {
    return (
      <div
        ref={ref}
        className={`${cardClasses} ${imagePosition === 'left' ? 'flex-row' : 'flex-row-reverse'} flex flex-col sm:flex-row`}
        {...props}
      >
        <div className="w-full sm:w-1/3 md:w-2/5 flex-shrink-0">
          <img 
            src={image} 
            alt={imageAlt}
            className="w-full h-48 sm:h-full object-cover"
          />
        </div>
        <div className="flex-1 flex flex-col">
          {props.children}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cardClasses}
      {...props}
    >
      {image && imagePosition === 'top' && (
        <div className="w-full">
          <img 
            src={image} 
            alt={imageAlt}
            className="w-full h-48 sm:h-56 md:h-64 object-cover"
          />
        </div>
      )}
      {props.children}
    </div>
  );
});
Card.displayName = "Card";

const CardHeader = React.forwardRef(({ 
  className = '', 
  spacing = 'normal', // 'tight', 'normal', 'loose'
  ...props 
}, ref) => {
  
  const spacingOptions = {
    tight: 'space-y-1 p-4 sm:p-5',
    normal: 'space-y-1.5 p-4 sm:p-6',
    loose: 'space-y-2 p-5 sm:p-7 md:p-8'
  };

  return (
    <div 
      ref={ref} 
      className={`flex flex-col ${spacingOptions[spacing]} ${className}`} 
      {...props} 
    />
  );
});
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(({ 
  className = '', 
  size = 'default', // 'sm', 'default', 'lg'
  color = 'default', // 'default', 'accent', 'secondary'
  as = 'h3',
  ...props 
}, ref) => {
  
  const sizes = {
    sm: 'text-lg sm:text-xl font-medium',
    default: 'text-xl sm:text-2xl font-semibold',
    lg: 'text-2xl sm:text-3xl md:text-4xl font-bold'
  };

  const colors = {
    default: 'text-white/95',
    accent: 'text-[#8abcb9]',
    secondary: 'text-white/85'
  };

  const Component = as;

  return (
    <Component
      ref={ref}
      className={`
        ${sizes[size]}
        ${colors[color]}
        leading-tight tracking-tight
        ${className}
      `}
      {...props}
    />
  );
});
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef(({ 
  className = '', 
  color = 'secondary',
  ...props 
}, ref) => {
  
  const colors = {
    default: 'text-white/95',
    secondary: 'text-white/85',
    muted: 'text-white/70'
  };

  return (
    <p
      ref={ref}
      className={`
        text-sm sm:text-base
        ${colors[color]}
        leading-relaxed
        ${className}
      `}
      {...props}
    />
  );
});
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef(({ 
  className = '', 
  spacing = 'normal', // 'tight', 'normal', 'loose'
  ...props 
}, ref) => {
  
  const spacingOptions = {
    tight: 'p-4 sm:p-5 pt-0',
    normal: 'p-4 sm:p-6 pt-0',
    loose: 'p-5 sm:p-7 md:p-8 pt-0'
  };

  return (
    <div 
      ref={ref} 
      className={`${spacingOptions[spacing]} ${className}`} 
      {...props} 
    />
  );
});
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef(({ 
  className = '', 
  justify = 'between', // 'start', 'center', 'end', 'between', 'around'
  spacing = 'normal',
  ...props 
}, ref) => {
  
  const justifyOptions = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around'
  };

  const spacingOptions = {
    tight: 'p-4 sm:p-5 pt-0',
    normal: 'p-4 sm:p-6 pt-0',
    loose: 'p-5 sm:p-7 md:p-8 pt-0'
  };

  return (
    <div
      ref={ref}
      className={`
        flex items-center gap-3 sm:gap-4
        ${justifyOptions[justify]}
        ${spacingOptions[spacing]}
        ${className}
      `}
      {...props}
    />
  );
});
CardFooter.displayName = "CardFooter";

const CardImage = React.forwardRef(({ 
  src,
  alt = '',
  className = '',
  aspectRatio = 'auto', // 'auto', 'square', 'video', 'wide'
  objectFit = 'cover', // 'cover', 'contain', 'fill'
  ...props 
}, ref) => {
  
  const aspectRatios = {
    auto: 'aspect-auto',
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[21/9]'
  };

  const objectFits = {
    cover: 'object-cover',
    contain: 'object-contain',
    fill: 'object-fill'
  };

  return (
    <div className={`w-full overflow-hidden ${aspectRatios[aspectRatio]}`}>
      <img
        ref={ref}
        src={src}
        alt={alt}
        className={`
          w-full h-full
          ${objectFits[objectFit]}
          transition-transform duration-300
          ${className}
        `}
        {...props}
      />
    </div>
  );
});
CardImage.displayName = "CardImage";

export { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter, 
  CardImage 
};