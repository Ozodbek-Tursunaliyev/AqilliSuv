import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'md', showSubtitle = false }) => {
  const iconDimensions =
    size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-9 h-9';
  const titleSize =
    size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <div className="flex items-center gap-3 select-none">
      <div
        className={`${iconDimensions} relative rounded-xl bg-gradient-to-br from-emerald-500/20 via-cyan-500/15 to-slate-900 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-inner`}
      >
        {/* Custom Water-Drop + Leaf SVG Logo */}
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-3/4 h-3/4"
        >
          {/* Outer Water Drop */}
          <path
            d="M18 4C18 4 8 15.2 8 22.2C8 27.7228 12.4772 32 18 32C23.5228 32 28 27.7228 28 22.2C28 15.2 18 4 18 4Z"
            stroke="url(#dropGrad)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="rgba(6, 182, 212, 0.12)"
          />
          {/* Inner Sprouting Leaf */}
          <path
            d="M18 28V17M18 22C18 18.5 21.5 15.5 24.5 15.5C24.5 19 22 22 18 22ZM18 24C18 21 15 18.5 12 18.5C12 21.5 14.5 24 18 24Z"
            stroke="#10B981"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="dropGrad" x1="8" y1="4" x2="28" y2="32" gradientUnits="userSpaceOnUse">
              <stop stopColor="#22D3EE" />
              <stop offset="1" stopColor="#10B981" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className={`${titleSize} font-bold tracking-tight text-white`}>
            Aqlli<span className="text-emerald-400">Suv</span>
          </span>
        </div>
        {showSubtitle && (
          <p className="text-xs text-slate-400 leading-snug mt-0.5">
            Har tomchi suv — hisobda. Har bir ekin — nazoratda.
          </p>
        )}
      </div>
    </div>
  );
};
