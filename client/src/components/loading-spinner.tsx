import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'accent';
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  variant = 'primary',
  text,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const variantClasses = {
    primary: 'border-primary border-t-transparent',
    secondary: 'border-secondary border-t-transparent',
    accent: 'border-accent border-t-transparent'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      {/* Spinner Container */}
      <div className="relative">
        {/* Main Spinner */}
        <div 
          className={`
            ${sizeClasses[size]} 
            border-4 ${variantClasses[variant]} 
            rounded-full animate-spin
          `}
        />
        
        {/* Inner Pulse Effect */}
        <div 
          className={`
            absolute inset-2 
            bg-gradient-to-r from-${variant}/20 to-transparent 
            rounded-full animate-pulse
          `}
        />
        
        {/* Outer Ring */}
        <div 
          className={`
            absolute -inset-2 
            border border-${variant}/30 
            rounded-full animate-ping
          `}
        />
      </div>

      {/* Loading Text */}
      {text && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground font-medium">
            {text}
          </p>
          <div className="loading-dots justify-center mt-2">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      )}
    </div>
  );
};

// Skeleton Loading Component
export const SkeletonLoader: React.FC<{ className?: string; count?: number }> = ({ 
  className = '', 
  count = 1 
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="flex space-x-4">
            <div className="rounded-full bg-primary/20 h-12 w-12"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-primary/20 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-primary/20 rounded"></div>
                <div className="h-3 bg-primary/20 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Code Block Loading
export const CodeBlockLoader: React.FC<{ lines?: number }> = ({ lines = 8 }) => {
  return (
    <div className="code-block">
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div key={index} className="animate-pulse flex space-x-2">
            <div className="text-xs text-muted-foreground w-8 text-right">
              {index + 1}
            </div>
            <div className="flex-1">
              <div 
                className="h-4 bg-primary/20 rounded"
                style={{ 
                  width: `${Math.random() * 60 + 20}%`,
                  animationDelay: `${index * 100}ms`
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Full Page Loading
export const FullPageLoader: React.FC<{ message?: string }> = ({ 
  message = "Loading your amazing experience..." 
}) => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="glass-strong p-12 rounded-3xl text-center max-w-md">
        <LoadingSpinner size="xl" text={message} />
      </div>
    </div>
  );
};

export default LoadingSpinner;