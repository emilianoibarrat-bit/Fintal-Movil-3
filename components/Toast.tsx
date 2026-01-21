
import React from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
}

const Toast: React.FC<ToastProps> = ({ message, type }) => {
  const bgClass = {
    success: 'bg-primary text-slate-900',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white',
  }[type];

  const icon = {
    success: 'check_circle',
    error: 'error',
    info: 'info',
  }[type];

  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-3 rounded-2xl shadow-2xl animate-in slide-in-from-top-4 duration-300 ${bgClass}`}>
      <span className="material-symbols-outlined fill-1 !text-[20px]">{icon}</span>
      <span className="font-bold text-sm tracking-tight">{message}</span>
    </div>
  );
};

export default Toast;
