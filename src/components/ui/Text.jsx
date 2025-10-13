import React from "react";

/**
 * Text Component - Fully customizable typography component optimized for mobile
 *
 * @param {string} size - Typography size (xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl)
 * @param {string} weight - Font weight (normal, medium, semibold, bold, extrabold)
 * @param {string} color - Text color variant
 * @param {string} as - HTML element to render (h1, h2, h3, h4, h5, h6, p, span, div)
 * @param {string} align - Text alignment (left, center, right, justify)
 * @param {string} className - Additional custom classes
 * @param {ReactNode} children - Content to display
 * @param {object} props - Additional props
 */

const Text = ({
  children,
  size = "base",
  weight,
  color = "default",
  as = "p",
  align = "left",
  className = "",
  responsive = true,
  gradient = false,
  uppercase = false,
  italic = false,
  underline = false,
  lineHeight = "normal",
  letterSpacing = "normal",
  ...props
}) => {
  // Mobile-first responsive typography sizes
  const sizes = {
    xs: responsive ? "text-xs sm:text-sm" : "text-xs",
    sm: responsive ? "text-sm sm:text-base" : "text-sm",
    base: responsive ? "text-base sm:text-lg" : "text-base",
    lg: responsive ? "text-lg sm:text-xl md:text-2xl" : "text-lg",
    xl: responsive ? "text-xl sm:text-2xl md:text-3xl" : "text-xl",
    "2xl": responsive ? "text-2xl sm:text-3xl md:text-4xl" : "text-2xl",
    "3xl": responsive ? "text-3xl sm:text-4xl md:text-5xl " : "text-3xl",
    "4xl": responsive ? "text-4xl sm:text-5xl md:text-6xl " : "text-4xl",
    "5xl": responsive ? "text-5xl sm:text-6xl md:text-7xl " : "text-5xl",
    "6xl": responsive ? "text-6xl sm:text-7xl md:text-8xl " : "text-6xl",
  };

  // Font weights
  const weights = {
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
    extrabold: "font-extrabold",
  };

  // Color variants based on your color scheme
  const colors = {
    // Primary text colors
    default: "text-white/95",
    secondary: "text-white/85",
    muted: "text-white/70",

    // Brand colors
    accent: "text-[#8abcb9]",
    primary: "text-[#8abcb9]",

    // Status colors
    success: "text-green-400",
    warning: "text-yellow-400",
    error: "text-red-400",
    info: "text-blue-400",

    // Additional colors
    purple: "text-purple-400",
    pink: "text-pink-400",
    indigo: "text-indigo-400",
    emerald: "text-emerald-400",
    orange: "text-orange-400",

    // High contrast
    white: "text-white",
    black: "text-black",

    // Gradient variants (requires gradient=true)
    gradientAccent:
      "bg-gradient-to-r from-[#8abcb9] to-[#a4cbc8] bg-clip-text text-transparent",
    gradientSleek:
      "bg-gradient-to-r from-white/80 from-white/90 to-white/60 bg-clip-text text-transparent",
    gradientPrimary:
      "bg-gradient-to-r from-[#8abcb9] via-[#a4cbc8] via-[#8abcb9] to-[#a4cbc8] bg-[length:200%_100%] animate-[gradient_3s_ease-in-out_infinite] bg-clip-text text-transparent",
    gradientSecondary:
      "bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent",
    gradientSuccess:
      "bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent",
    gradientWarning:
      "bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent",
    gradientRainbow:
      "bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent",
  };

  // Responsive text alignment
  const alignments = {
    left: "text-left",
    center: "text-center sm:text-center",
    right: "text-left sm:text-right", // Mobile first: left align, then right on larger screens
    justify: "text-left sm:text-justify", // Mobile first: left align, then justify on larger screens
  };

  // Line height options with mobile optimization
  const lineHeights = {
    tight: "leading-tight sm:leading-tight",
    normal: "leading-normal sm:leading-relaxed",
    relaxed: "leading-relaxed sm:leading-relaxed",
    loose: "leading-loose sm:leading-loose",
  };

  // Letter spacing options
  const letterSpacings = {
    tight: "tracking-tight",
    normal: "tracking-normal",
    wide: "tracking-wide",
    wider: "tracking-wider",
    widest: "tracking-widest",
  };

  // Build className string
  const buildClassName = () => {
    let classes = [];

    // Size
    classes.push(sizes[size] || sizes.base);

    // Weight
    classes.push(weights[weight] || weights.normal);

    // Color (handle gradient vs regular colors)
    if (gradient && colors[color]?.includes("gradient")) {
      classes.push(colors[color]);
    } else {
      classes.push(colors[color] || colors.default);
    }

    // Alignment
    classes.push(alignments[align] || alignments.left);

    // Line height
    classes.push(lineHeights[lineHeight] || lineHeights.normal);

    // Letter spacing
    classes.push(letterSpacings[letterSpacing] || letterSpacings.normal);

    // Additional styling options
    if (uppercase) classes.push("uppercase");
    if (italic) classes.push("italic");
    if (underline) classes.push("underline");

    // Mobile-specific improvements
    classes.push("break-words"); // Prevent text overflow
    classes.push("hyphens-auto"); // Better word breaking on mobile

    // Custom classes
    if (className) classes.push(className);

    return classes.join(" ");
  };

  // Determine HTML element
  const Component = as;

  return (
    <Component className={buildClassName()} {...props}>
      {children}
    </Component>
  );
};

export default Text;
