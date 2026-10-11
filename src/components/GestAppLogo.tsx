import React from 'react';

interface GestAppLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const GestAppLogo: React.FC<GestAppLogoProps> = ({ size = 'md', showSubtitle = true }) => {
  const iconDimensions = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Exact Purple Circular Logo as provided in IMG_3127.png (Fixed, Non modifiable) */}
      <div
        className={`${iconDimensions[size]} rounded-full flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden`}
        style={{
          backgroundColor: '#4A0D5B', // Deep violet purple from user logo
          boxShadow: '0 1px 3px rgba(74, 13, 91, 0.4)',
        }}
        title="Gest'App - Logo officiel"
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle outer circle rim */}
          <circle cx="50" cy="50" r="48.5" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />

          {/* Letter 'G' in black fluid calligraphy */}
          <path
            d="M 35 24 C 29 14, 23 20, 23 35 C 23 55, 25 72, 33 72 C 40 72, 42 55, 42 42 L 30 47"
            stroke="#0a0a0a"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Text "Est" in white serif font at top of G */}
          <text
            x="36"
            y="25"
            fill="#ffffff"
            fontSize="12"
            fontFamily="'Courier New', Courier, serif"
            fontWeight="bold"
            letterSpacing="0.5"
          >
            Est
          </text>

          {/* Apostrophe in black between G and A */}
          <path
            d="M 46 46 Q 47 48 46 51"
            stroke="#0a0a0a"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Letter 'A' in black calligraphy with tall apex and crossbar */}
          {/* Left leg of A extending downwards */}
          <path
            d="M 62 15 L 47 88"
            stroke="#0a0a0a"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          {/* Right leg of A */}
          <path
            d="M 62 15 L 67 69"
            stroke="#0a0a0a"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          {/* Crossbar of A spanning across */}
          <path
            d="M 28 47 L 67 51"
            stroke="#0a0a0a"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Text "Pp" in white serif font at bottom of A */}
          <text
            x="68"
            y="70"
            fill="#ffffff"
            fontSize="12"
            fontFamily="'Courier New', Courier, serif"
            fontWeight="bold"
            letterSpacing="0.5"
          >
            Pp
          </text>
        </svg>
      </div>

      {/* Brand Name Typography */}
      <div className="flex flex-col leading-none">
        <div className={`font-bold tracking-tight text-slate-900 ${textSizes[size]} flex items-center`}>
          <span>Gest’App</span>
          <span className="ml-1.5 font-semibold text-purple-900">
            facture
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[10px] font-semibold text-slate-500 tracking-wider mt-0.5 uppercase">
            Devis · Bons de commande · Facturation
          </span>
        )}
      </div>
    </div>
  );
};
