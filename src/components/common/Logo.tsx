import React from 'react';

interface LogoProps {
  variant?: 'full' | 'compact' | 'icon' | 'letterhead';
  theme?: 'dark' | 'light';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  theme = 'light',
  className = '',
  size = 'md'
}) => {
  const isDark = theme === 'dark';
  
  // Size dimensions
  const iconSize = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }[size];

  const titleSize = {
    sm: 'text-sm',
    md: 'text-base font-bold',
    lg: 'text-xl font-bold',
    xl: 'text-2xl font-extrabold'
  }[size];

  const subSize = {
    sm: 'text-[9px]',
    md: 'text-[11px]',
    lg: 'text-xs',
    xl: 'text-sm'
  }[size];

  const primaryFill = isDark ? '#ffffff' : '#1a2a4a';
  const goldFill = '#c9a227';
  const shieldBg = isDark ? '#111e38' : '#1a2a4a';
  const textColor = isDark ? 'text-white' : 'text-[#1a2a4a]';
  const subtitleColor = isDark ? 'text-[#c9a227]' : 'text-[#8c6d17]';

  const ShieldIcon = (
    <svg
      viewBox="0 0 120 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${iconSize} flex-shrink-0 drop-shadow-sm`}
    >
      {/* Outer Shield Outline */}
      <path
        d="M60 4L14 20V62C14 94 60 124 60 124C60 124 106 94 106 62V20L60 4Z"
        fill={shieldBg}
        stroke={goldFill}
        strokeWidth="3.5"
      />
      {/* Inner Decorative Border */}
      <path
        d="M60 12L22 26V60C22 86 60 112 60 112C60 112 98 86 98 60V26L60 12Z"
        stroke={goldFill}
        strokeWidth="1.2"
        strokeDasharray="2 2"
        fill="none"
      />
      {/* Stylized Balanced Scales of Justice / Pillar */}
      {/* Central Pillar */}
      <rect x="58.5" y="34" width="3" height="48" fill={goldFill} rx="1.5" />
      {/* Cross Beam */}
      <path d="M34 46L60 42L86 46" stroke={goldFill} strokeWidth="2.5" strokeLinecap="round" />
      {/* Left Pan */}
      <path d="M34 46L30 64H44L40 46" stroke={goldFill} strokeWidth="1.2" />
      <path d="M28 64C28 69 46 69 46 64H28Z" fill={goldFill} />
      {/* Right Pan */}
      <path d="M86 46L82 64H96L92 46" stroke={goldFill} strokeWidth="1.2" />
      <path d="M80 64C80 69 98 69 98 64H80Z" fill={goldFill} />
      {/* Base Pedestal */}
      <path d="M48 82H72L75 87H45L48 82Z" fill={goldFill} />
      {/* Subtle Eagle Motif / Crest at Top */}
      <path d="M60 22L54 28H66L60 22Z" fill={goldFill} />
      {/* Star of Excellence */}
      <circle cx="60" cy="34" r="2.5" fill={goldFill} />
    </svg>
  );

  if (variant === 'icon') {
    return <div className={`inline-flex items-center ${className}`}>{ShieldIcon}</div>;
  }

  if (variant === 'letterhead') {
    return (
      <div className={`flex flex-col items-center text-center p-3 border-b-2 border-[#c9a227] ${className}`}>
        <div className="mb-2">{ShieldIcon}</div>
        <div className="font-serif tracking-wider font-extrabold text-2xl text-[#1a2a4a]">
          B. B. BALE & CO
        </div>
        <div className="text-xs font-semibold tracking-widest text-[#c9a227] uppercase mt-0.5">
          CHAMBERS · BARRISTERS, SOLICITORS & ARBITRATORS
        </div>
        <div className="text-[11px] text-[#5a5a5a] max-w-lg mt-1 italic">
          Notary Public · Property Managers · Legal Consultants
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {ShieldIcon}
      <div className="flex flex-col leading-tight">
        <span className={`font-serif tracking-wide ${titleSize} ${textColor}`}>
          B. B. BALE & CO
        </span>
        {variant !== 'compact' && (
          <span className={`font-medium tracking-widest uppercase ${subSize} ${subtitleColor}`}>
            CHAMBERS
          </span>
        )}
      </div>
    </div>
  );
};
