import React, { useEffect } from 'react';
import { Icons } from './Icon';

interface ToastProps {
  message: string;
  type?: 'info' | 'error' | 'success';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    info: 'bg-indigo-600 text-white border-indigo-500',
    error: 'bg-red-500 text-white border-red-400',
    success: 'bg-emerald-500 text-white border-emerald-400'
  };
  
  const icon = type === 'error' ? <Icons.AlertCircle size={20} /> : <Icons.Info size={20} />;

  return (
    <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[90] flex items-center gap-3 px-6 py-3.5 rounded-full shadow-2xl border ${styles[type]} animate-in slide-in-from-top-4 fade-in duration-300`}>
      <div className="shrink-0">{icon}</div>
      <span className="font-medium text-sm text-center shadow-sm whitespace-nowrap">{message}</span>
    </div>
  );
};