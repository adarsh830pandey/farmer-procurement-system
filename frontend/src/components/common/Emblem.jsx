import React from 'react';

/**
 * Official Indian Government Emblem Placeholder
 * Clean, respectful, non-commercial vector presentation
 */
export const Emblem = ({ className = 'w-10 h-12 text-gov-navy' }) => {
  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 100 120"
        fill="currentColor"
        className="w-full h-full"
        aria-label="National Emblem Placeholder"
      >
        {/* Ashoka Pillar capital geometric placeholder */}
        <path d="M50 8 C40 8 32 15 32 25 C32 32 36 38 42 41 L40 70 L60 70 L58 41 C64 38 68 32 68 25 C68 15 60 8 50 8 Z" />
        {/* Central Wheel / Chakra motif */}
        <circle cx="50" cy="80" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
        <line x1="50" y1="70" x2="50" y2="90" stroke="currentColor" strokeWidth="2" />
        <line x1="40" y1="80" x2="60" y2="80" stroke="currentColor" strokeWidth="2" />
        <line x1="43" y1="73" x2="57" y2="87" stroke="currentColor" strokeWidth="1.5" />
        <line x1="43" y1="87" x2="57" y2="73" stroke="currentColor" strokeWidth="1.5" />
        {/* Base Pedestal */}
        <rect x="25" y="93" width="50" height="8" rx="2" />
        <rect x="20" y="103" width="60" height="5" rx="1" />
        {/* Motto banner text indicator */}
        <path d="M22 110 Q50 114 78 110" stroke="currentColor" strokeWidth="2" fill="none" />
      </svg>
      <span className="text-[7px] font-serif font-bold tracking-widest text-slate-700 uppercase mt-0.5">
        सत्यमेव जयते
      </span>
    </div>
  );
};

export default Emblem;
