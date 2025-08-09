import * as React from 'react';
import { cn } from '@/lib/utils';

// Base Card with new standard styling
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => <div ref={ref} className={cn('rounded-lg border border-gray-200 bg-white text-gray-900 shadow-sm', className)} {...props} />);
Card.displayName = 'Card';

// Standardized CardHeader
const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />);
CardHeader.displayName = 'CardHeader';

// Standardized CardTitle
const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => <h3 ref={ref} className={cn('text-lg font-semibold leading-none tracking-tight text-gray-800', className)} {...props} />);
CardTitle.displayName = 'CardTitle';

// Standardized CardDescription
const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => <p ref={ref} className={cn('text-sm text-gray-500', className)} {...props} />);
CardDescription.displayName = 'CardDescription';

// Standardized CardContent
const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => <div ref={ref} className={cn('p-6', className)} {...props} />);
CardContent.displayName = 'CardContent';

// Standardized CardFooter with a distinct background
const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => <div ref={ref} className={cn('flex items-center p-4 bg-gray-50 border-t border-gray-200', className)} {...props} />);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
