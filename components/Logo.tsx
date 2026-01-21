
import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

const Logo: React.FC<LogoProps> = ({ className = "", size = 40 }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`} style={{ height: size }}>
      <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg transition-transform hover:scale-105">
        <rect width="200" height="200" rx="40" fill="#121212"/>
        <path d="M50 160V100L75 90L100 100V160H50Z" fill="white" fillOpacity="0.2"/>
        <rect x="130" y="85" width="25" height="75" rx="4" fill="white"/>
        <rect x="95" y="115" width="25" height="45" rx="4" fill="white" fillOpacity="0.6"/>
        <path d="M40 140L40 60L100 45L160 30V60L100 75L70 85L40 140Z" fill="url(#paint0_linear)"/>
        <path d="M40 85C40 85 70 85 100 70C130 55 145 70 145 70L110 90C110 90 90 95 70 95C50 95 40 85 40 85Z" fill="url(#paint1_linear)"/>
        <defs>
          <linearGradient id="paint0_linear" x1="40" y1="140" x2="160" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="#11d432"/>
            <stop offset="1" stopColor="#0c9e24"/>
          </linearGradient>
          <linearGradient id="paint1_linear" x1="40" y1="85" x2="145" y2="95" gradientUnits="userSpaceOnUse">
            <stop stopColor="#11d432" stopOpacity="0.8"/>
            <stop offset="1" stopColor="#11d432"/>
          </linearGradient>
        </defs>
      </svg>
      <div className="flex font-black tracking-tighter text-2xl" style={{ fontSize: size * 0.65 }}>
        <span className="text-primary">FIN</span>
        <span className="text-black dark:text-white">TAL</span>
      </div>
    </div>
  );
};

export default Logo;
