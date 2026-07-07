import React from 'react';

interface RuppLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function RuppLogo({ className = '', size = 'md' }: RuppLogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const selectedSize = sizeClasses[size];

  return (
    <div className={`inline-flex items-center justify-center shrink-0 ${selectedSize} ${className}`}>
      <svg 
        viewBox="0 0 200 200" 
        fill="none" 
        className="w-full h-full drop-shadow-lg"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Definition of text path for curved text at the bottom */}
        <defs>
          <path id="rupp-text-path" d="M 36,146 Q 100,185 164,146" />
          <filter id="glow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Main Background - Vibrant red circle representing energy & determination */}
        <circle cx="100" cy="100" r="96" fill="#DA251D" stroke="#E2A626" strokeWidth="3" />
        
        {/* Double inner gold decorative borders */}
        <circle cx="100" cy="100" r="90" stroke="#E2A626" strokeWidth="1" strokeDasharray="3 2" opacity="0.8" />
        <circle cx="100" cy="100" r="87" stroke="#E2A626" strokeWidth="1.5" />

        {/* 2. Left side - Golden Industrial Cogwheel / Gear teeth segment (from 115° to 245°) */}
        <path 
          d="M 52,175 C 24,148 24,102 52,75" 
          stroke="#E2A626" 
          strokeWidth="7" 
          strokeLinecap="square"
          strokeDasharray="4 6"
        />
        {/* Outer backing circle segment for the gear to make it clean */}
        <path 
          d="M 50,177 C 20,147 20,103 50,73" 
          stroke="#E2A626" 
          strokeWidth="2" 
          fill="none"
        />

        {/* 3. Right side - Golden Ears of Paddy Rice (agricultural abundance, culture & growth) */}
        {/* Main stalk line */}
        <path 
          d="M 148,175 C 176,148 176,102 148,75" 
          stroke="#E2A626" 
          strokeWidth="3" 
          strokeLinecap="round"
          fill="none"
        />
        {/* Rice grains along the stalk */}
        <g fill="#E2A626">
          {/* Stalk 1 (Top) */}
          <ellipse cx="146" cy="74" rx="4" ry="2.5" transform="rotate(-30 146 74)" />
          <ellipse cx="152" cy="79" rx="4" ry="2.5" transform="rotate(-15 152 79)" />
          {/* Stalks along the curve */}
          <ellipse cx="157" cy="86" rx="4.5" ry="2.8" transform="rotate(5 157 86)" />
          <ellipse cx="162" cy="94" rx="4.5" ry="2.8" transform="rotate(20 162 94)" />
          <ellipse cx="165" cy="103" rx="4.5" ry="2.8" transform="rotate(35 165 103)" />
          <ellipse cx="166" cy="112" rx="4.5" ry="2.8" transform="rotate(50 166 112)" />
          <ellipse cx="165" cy="121" rx="4.5" ry="2.8" transform="rotate(65 165 121)" />
          <ellipse cx="162" cy="130" rx="4.5" ry="2.8" transform="rotate(80 162 130)" />
          <ellipse cx="157" cy="138" rx="4.5" ry="2.8" transform="rotate(95 157 138)" />
          <ellipse cx="152" cy="146" rx="4.5" ry="2.8" transform="rotate(110 152 146)" />
          <ellipse cx="146" cy="153" rx="4.5" ry="2.8" transform="rotate(125 146 153)" />
          <ellipse cx="139" cy="160" rx="4.5" ry="2.8" transform="rotate(140 139 160)" />
          
          {/* Internal parallel layer of grains */}
          <ellipse cx="143" cy="84" rx="3.5" ry="2.2" transform="rotate(-10 143 84)" />
          <ellipse cx="148" cy="92" rx="3.5" ry="2.2" transform="rotate(5 148 92)" />
          <ellipse cx="152" cy="101" rx="3.5" ry="2.2" transform="rotate(20 152 101)" />
          <ellipse cx="153" cy="110" rx="3.5" ry="2.2" transform="rotate(35 153 110)" />
          <ellipse cx="152" cy="119" rx="3.5" ry="2.2" transform="rotate(50 152 119)" />
          <ellipse cx="149" cy="128" rx="3.5" ry="2.2" transform="rotate(65 149 128)" />
          <ellipse cx="144" cy="136" rx="3.5" ry="2.2" transform="rotate(80 144 136)" />
          <ellipse cx="139" cy="143" rx="3.5" ry="2.2" transform="rotate(95 139 143)" />
          <ellipse cx="133" cy="149" rx="3.5" ry="2.2" transform="rotate(110 133 149)" />
        </g>

        {/* 4. Left background: Golden Drawing Compass (representing engineering & architecture) */}
        <g stroke="#E2A626" strokeWidth="2.5" strokeLinecap="round" fill="none">
          {/* Compass Top joint hinge */}
          <circle cx="52" cy="90" r="2.5" fill="#DA251D" />
          {/* Left leg */}
          <line x1="52" y1="90" x2="43" y2="114" />
          {/* Right leg */}
          <line x1="52" y1="90" x2="57" y2="114" />
          {/* Cross adjustment bar */}
          <path d="M 45,104 Q 52,106 55,104" strokeWidth="1.5" />
        </g>

        {/* 5. Right background: Golden Atomic Orbits (representing physics, science & modern research) */}
        <g stroke="#E2A626" strokeWidth="1.5" fill="none" opacity="0.95">
          {/* Central Nucleus */}
          <circle cx="144" cy="102" r="2.5" fill="#E2A626" />
          {/* 3 Intersecting Orbit Ellipses */}
          <ellipse cx="144" cy="102" rx="14" ry="5" transform="rotate(-30 144 102)" />
          <ellipse cx="144" cy="102" rx="14" ry="5" transform="rotate(30 144 102)" />
          <ellipse cx="144" cy="102" rx="14" ry="5" transform="rotate(90 144 102)" />
        </g>

        {/* 6. Central Column: Golden Torch of Intellect and Wisdom */}
        {/* Torch Stem / Pillar base */}
        <g fill="#E2A626">
          {/* Pedestal feet */}
          <path d="M 90,165 H 110 L 105,155 H 95 Z" />
          {/* Ornate Rings along column */}
          <rect x="94" y="146" width="12" height="3" rx="0.5" />
          <rect x="96" y="128" width="8" height="15" />
          <rect x="94" y="122" width="12" height="3" rx="0.5" />
          {/* Upper chalice holder stem */}
          <rect x="97" y="76" width="6" height="43" />
          {/* Crossed wooden batons/scrolls in the center */}
          <path d="M 76,104 L 124,84 L 122,80 L 74,100 Z" opacity="0.95" />
          <path d="M 74,84 L 124,104 L 122,108 L 72,88 Z" opacity="0.95" />
          
          {/* Ornate chalice cup base holding the flame */}
          <path d="M 85,74 Q 100,74 115,74 L 110,62 Q 100,64 90,62 Z" />
          {/* Concentric rings on chalice cup */}
          <rect x="89" y="58" width="22" height="4" rx="1" />
        </g>

        {/* 7. Bright Sacred Red Flame representing education enlightenment */}
        <g filter="url(#glow)">
          {/* Back flame layer (Darker red/orange) */}
          <path d="M 100,16 C 108,28 116,36 112,48 C 110,54 104,58 100,58 C 96,58 90,54 88,48 C 84,36 92,28 100,16 Z" fill="#E04006" />
          {/* Mid flame layer (Vibrant red) */}
          <path d="M 100,22 C 105,30 112,37 109,47 C 107,52 102,56 100,56 C 98,56 93,52 91,47 C 88,37 95,30 100,22 Z" fill="#F03200" />
          {/* Front inner core (Golden Yellow) */}
          <path d="M 100,32 C 103,37 107,41 106,47 C 105,51 102,54 100,54 C 98,54 95,51 94,47 C 93,41 97,37 100,32 Z" fill="#E2A626" />
        </g>

        {/* 8. Bottom Blue Banner ribbon for University Name */}
        {/* Curving blue ribbon path */}
        <path 
          d="M 32,142 Q 100,183 168,142 L 158,154 Q 100,188 42,154 Z" 
          fill="#1C75BC" 
          stroke="#E2A626" 
          strokeWidth="1.5"
        />
        {/* Little decorative side ribbons */}
        <path d="M 32,142 L 18,138 L 22,148 L 36,146 Z" fill="#1C75BC" stroke="#E2A626" strokeWidth="1" />
        <path d="M 168,142 L 182,138 L 178,148 L 164,146 Z" fill="#1C75BC" stroke="#E2A626" strokeWidth="1" />

        {/* Curved Khmer Text inside blue banner */}
        <text 
          fill="#FFFFFF" 
          fontSize="10" 
          fontWeight="bold" 
          letterSpacing="0.2"
          fontFamily="'Khmer OS Battambang', 'Noto Sans Khmer', 'Khmer OS', sans-serif"
          textAnchor="middle"
        >
          <textPath href="#rupp-text-path" startOffset="50%">
            សាកលវិទ្យាល័យភូមិន្ទភ្នំពេញ
          </textPath>
        </text>

        {/* 9. Bottom Golden Khmer Flower Ornament (Kbach design element at very base) */}
        <g fill="#E2A626" stroke="#DA251D" strokeWidth="0.5">
          {/* Central floral rosette/bud */}
          <circle cx="100" cy="184" r="5" />
          {/* Flanking petals */}
          <path d="M 100,184 C 94,188 84,188 80,184 C 84,180 94,180 100,184 Z" />
          <path d="M 100,184 C 106,188 116,188 120,184 C 116,180 106,180 100,184 Z" />
          <path d="M 100,184 C 104,178 104,168 100,165 C 96,168 96,178 100,184 Z" opacity="0.8" />
          {/* Small leaves scrollwork */}
          <path d="M 88,183 C 94,182 98,184 100,184 C 98,184 94,186 88,183 Z" />
          <path d="M 112,183 C 106,182 102,184 100,184 C 102,184 106,186 112,183 Z" />
        </g>
      </svg>
    </div>
  );
}
