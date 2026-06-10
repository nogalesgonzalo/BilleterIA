import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export function Logo({ className = "", size = 40, showText = false }: LogoProps) {
  // Colores extraídos del logo oficial
  const colorBlueDark = "#0d213a"; // Azul oscuro principal
  const colorGreenMint = "#4ade80"; // Verde menta brillante
  const colorGreenMintSoft = "#a7f3d0"; // Verde menta suave

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Arco exterior (Gris/Azul oscuro con efecto de marcas de escala) */}
        <path
          d="M 30 150 A 80 80 0 0 1 170 150"
          stroke={colorBlueDark}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray="4 20" // Crea las divisiones/marcas de escala del velocímetro
        />
        {/* Arco exterior continuo de soporte */}
        <path
          d="M 27 153 A 84 84 0 0 1 173 153"
          stroke={colorBlueDark}
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.3"
        />

        {/* Arco interior semicircular (Verde menta suave/brillante) */}
        <path
          d="M 50 145 A 60 60 0 0 1 150 145"
          stroke={colorGreenMint}
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* La Aguja (Flecha) apuntando a ~45 grados (cuadrante superior derecho) */}
        <g transform="rotate(40 100 135)">
          {/* Sombra de la aguja */}
          <path
            d="M 97 135 L 90 65 L 100 45 L 110 65 L 103 135 Z"
            fill="black"
            opacity="0.15"
            transform="translate(2, 4)"
          />
          {/* Cuerpo de la aguja con gradiente o color sólido esmeralda */}
          <path
            d="M 97 135 L 90 65 L 100 45 L 110 65 L 103 135 Z"
            fill={colorGreenMint}
          />
          {/* Detalle interno de la aguja (brillo/división) */}
          <path
            d="M 100 45 L 100 135 L 103 135 L 110 65 Z"
            fill={colorGreenMintSoft}
            opacity="0.5"
          />
        </g>

        {/* Círculo central en la base (Botón +) */}
        <circle cx="100" cy="135" r="24" fill={colorBlueDark} stroke="#1e3a5f" strokeWidth="2" />
        
        {/* El símbolo "+" dentro del círculo */}
        <path
          d="M 100 125 L 100 145 M 90 135 L 110 135"
          stroke={colorGreenMint}
          strokeWidth="6"
          strokeLinecap="round"
        />
      </svg>

      {showText && (
        <span className="font-sans font-bold tracking-tight text-white flex items-center select-none" style={{ fontSize: `${size * 0.48}px` }}>
          Billeter
          <span style={{ color: colorGreenMint }}>IA</span>
        </span>
      )}
    </div>
  );
}
