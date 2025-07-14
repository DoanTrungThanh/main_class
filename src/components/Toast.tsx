import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, type, duration = 4000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - (100 / (duration / 50));
        return newProgress <= 0 ? 0 : newProgress;
      });
    }, 50);

    // Auto close timer
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [duration, onClose, isPaused]);

  const getIcon = () => {
    const iconProps = { size: 18, className: "flex-shrink-0" };
    
    switch (type) {
      case 'success':
        return <CheckCircle {...iconProps} className="text-green-600 flex-shrink-0" />;
      case 'error':
        return <AlertCircle {...iconProps} className="text-red-600 flex-shrink-0" />;
      case 'warning':
        return <AlertTriangle {...iconProps} className="text-amber-600 flex-shrink-0" />;
      case 'info':
        return <Info {...iconProps} className="text-blue-600 flex-shrink-0" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-white border border-green-200 shadow-xl',
          icon: 'bg-green-50',
          progress: 'bg-green-500',
          text: 'text-gray-800',
          border: 'border-l-4 border-l-green-500'
        };
      case 'error':
        return {
          container: 'bg-white border border-red-200 shadow-xl',
          icon: 'bg-red-50',
          progress: 'bg-red-500',
          text: 'text-gray-800',
          border: 'border-l-4 border-l-red-500'
        };
      case 'warning':
        return {
          container: 'bg-white border border-amber-200 shadow-xl',
          icon: 'bg-amber-50',
          progress: 'bg-amber-500',
          text: 'text-gray-800',
          border: 'border-l-4 border-l-amber-500'
        };
      case 'info':
        return {
          container: 'bg-white border border-blue-200 shadow-xl',
          icon: 'bg-blue-50',
          progress: 'bg-blue-500',
          text: 'text-gray-800',
          border: 'border-l-4 border-l-blue-500'
        };
    }
  };

  const styles = getStyles();

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`transition-all duration-300 transform ${
        isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'
      }`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className={`relative overflow-hidden rounded-lg ${styles.container} ${styles.border} min-w-[320px] max-w-[400px]`}>
        {/* Progress bar */}
        <div className="absolute top-0 left-0 h-1 bg-gray-100 w-full">
          <div 
            className={`h-full transition-all duration-75 ease-linear ${styles.progress}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Content */}
        <div className="flex items-start gap-3 p-4 pt-5">
          {/* Icon */}
          <div className={`p-2 rounded-lg ${styles.icon} flex-shrink-0`}>
            {getIcon()}
          </div>

          {/* Message */}
          <div className="flex-1 min-w-0 pr-2">
            <p className={`text-sm font-medium leading-relaxed ${styles.text} break-words`}>
              {message}
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="flex-shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200 ml-2"
            aria-label="Đóng thông báo"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}