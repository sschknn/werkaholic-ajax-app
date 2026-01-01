import React from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'filled' | 'outline';
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  variant = 'default',
  error,
  className,
  ...props
}) => {
  const baseClasses = 'w-full px-4 py-3 text-base transition-all duration-200 focus:outline-none focus:ring-2 placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    default: 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:border-blue-500 focus:ring-blue-500/20 text-slate-900 dark:text-white',
    filled: 'bg-slate-100 dark:bg-slate-700 border-0 rounded-xl focus:bg-white dark:focus:bg-slate-600 focus:ring-blue-500/20 text-slate-900 dark:text-white',
    outline: 'bg-transparent border-2 border-slate-300 dark:border-slate-600 rounded-xl focus:border-blue-500 focus:ring-blue-500/20 text-slate-900 dark:text-white'
  };

  return (
    <div className="space-y-1">
      <input
        className={cn(
          baseClasses,
          variants[variant],
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'filled' | 'outline';
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  variant = 'default',
  error,
  className,
  ...props
}) => {
  const baseClasses = 'w-full px-4 py-3 text-base transition-all duration-200 focus:outline-none focus:ring-2 placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed resize-none';

  const variants = {
    default: 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:border-blue-500 focus:ring-blue-500/20 text-slate-900 dark:text-white',
    filled: 'bg-slate-100 dark:bg-slate-700 border-0 rounded-xl focus:bg-white dark:focus:bg-slate-600 focus:ring-blue-500/20 text-slate-900 dark:text-white',
    outline: 'bg-transparent border-2 border-slate-300 dark:border-slate-600 rounded-xl focus:border-blue-500 focus:ring-blue-500/20 text-slate-900 dark:text-white'
  };

  return (
    <div className="space-y-1">
      <textarea
        className={cn(
          baseClasses,
          variants[variant],
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};