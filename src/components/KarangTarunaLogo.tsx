import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const KarangTarunaLogo: React.FC<LogoProps> = ({ className = 'w-10 h-10', size = 40 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer Golden Circle Ring */}
      <circle cx="100" cy="100" r="96" fill="#1E3A8A" stroke="#F59E0B" strokeWidth="8" />
      <circle cx="100" cy="100" r="88" stroke="#FCD34D" strokeWidth="2" strokeDasharray="4 3" />

      {/* Inner Blue Background */}
      <circle cx="100" cy="100" r="84" fill="#0F172A" />

      {/* Top Star (Bintang Emas - Pancasila) */}
      <polygon
        points="100,24 105,38 120,38 108,47 112,61 100,52 88,61 92,47 80,38 95,38"
        fill="#F59E0B"
        stroke="#FEF3C7"
        strokeWidth="1"
      />

      {/* Bunga Teratai (Lotus Petals - Simbol Kesucian & Kemekar Pemuda) */}
      {/* Center Petal */}
      <path
        d="M100,62 C115,80 120,115 100,140 C80,115 85,80 100,62 Z"
        fill="#FFFFFF"
        stroke="#0284C7"
        strokeWidth="2"
      />
      {/* Left Petals */}
      <path
        d="M100,90 C75,85 55,100 50,125 C70,135 90,125 100,105 Z"
        fill="#F8FAFC"
        stroke="#0284C7"
        strokeWidth="2"
      />
      <path
        d="M100,100 C65,105 45,120 40,140 C65,148 85,138 100,118 Z"
        fill="#E2E8F0"
        stroke="#0284C7"
        strokeWidth="1.5"
      />
      {/* Right Petals */}
      <path
        d="M100,90 C125,85 145,100 150,125 C130,135 110,125 100,105 Z"
        fill="#F8FAFC"
        stroke="#0284C7"
        strokeWidth="2"
      />
      <path
        d="M100,100 C135,105 155,120 160,140 C135,148 115,138 100,118 Z"
        fill="#E2E8F0"
        stroke="#0284C7"
        strokeWidth="1.5"
      />

      {/* Red & White Ribbon Banner at Bottom */}
      <path d="M40,142 Q100,165 160,142 L165,160 Q100,185 35,160 Z" fill="#DC2626" stroke="#991B1B" strokeWidth="2" />
      <path d="M42,150 Q100,172 158,150 L160,158 Q100,180 40,158 Z" fill="#FFFFFF" />

      {/* Text "KARANG TARUNA" Curved along Top Arc */}
      <path id="textArc" d="M 30,100 A 70,70 0 1,1 170,100" fill="none" />
      <text fill="#FCD34D" fontSize="13" fontWeight="900" letterSpacing="2.5" textAnchor="middle">
        <textPath href="#textArc" startOffset="50%">
          KARANG TARUNA
        </textPath>
      </text>

      {/* Text "INDONESIA" at Bottom Ribbon */}
      <text x="100" y="162" fill="#FFFFFF" fontSize="10" fontWeight="900" letterSpacing="1.5" textAnchor="middle">
        INDONESIA
      </text>
    </svg>
  );
};
