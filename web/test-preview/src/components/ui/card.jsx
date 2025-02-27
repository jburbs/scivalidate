import React from 'react';
import { cn } from '../../lib/utils';

export const Card = ({ className, children, ...props }) => {
  return (
    <div 
      className={cn("rounded-lg border border-gray-200 bg-white shadow-sm", className)} 
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ className, children, ...props }) => {
  return (
    <div 
      className={cn("flex flex-col space-y-1.5 p-6 border-b border-gray-100", className)} 
      {...props}
    >
      {children}
    </div>
  );
};

export const CardContent = ({ className, children, ...props }) => {
  return (
    <div 
      className={cn("p-6", className)} 
      {...props}
    >
      {children}
    </div>
  );
};

export const CardTitle = ({ className, children, ...props }) => {
  return (
    <h3 
      className={cn("text-xl font-bold tracking-tight", className)} 
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardDescription = ({ className, children, ...props }) => {
  return (
    <p 
      className={cn("text-sm text-gray-500", className)} 
      {...props}
    >
      {children}
    </p>
  );
};

export const CardFooter = ({ className, children, ...props }) => {
  return (
    <div 
      className={cn("flex items-center p-6 pt-0", className)} 
      {...props}
    >
      {children}
    </div>
  );
};