import * as React from "react"

// Simple utility to combine class names
const cn = (...classes) => {
  return classes.filter(Boolean).join(" ");
};

// Simplified version of badgeVariants without class-variance-authority
const getVariantClasses = (variant) => {
  const variants = {
    default: "border-transparent bg-blue-600 text-white hover:bg-blue-700",
    secondary: "border-transparent bg-gray-200 text-gray-900 hover:bg-gray-300",
    destructive: "border-transparent bg-red-600 text-white hover:bg-red-700",
    outline: "text-gray-900 border-gray-300",
  };
  
  return variants[variant] || variants.default;
};

function Badge({
  className,
  variant = "default",
  ...props
}) {
  return (
    <div 
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        getVariantClasses(variant),
        className
      )} 
      {...props} 
    />
  )
}

export { Badge };