"use client";

import React, { useState } from "react";

interface CalculadoraInteresProps {
  totalAhorros: number;
  totalInversiones: number;
}

export function CalculadoraInteres({ totalAhorros, totalInversiones }: CalculadoraInteresProps) {
  const [tasaRetorno, setTasaRetorno] = useState<number>(7);
  const [ahorroMensual, setAhorroMensual] = useState<number>(300);

  const capitalInicial = totalAhorros + totalInversiones;

  const calcularFuturo = (anos: number) => {
    const P = capitalInicial;
    const PMT = ahorroMensual * 12;
    const r = tasaRetorno / 100;
    const t = anos;

    if (r === 0) {
      return P + PMT * t;
    }

    const parteInicial = P * Math.pow(1 + r, t);
    const parteAportes = PMT * ((Math.pow(1 + r, t) - 1) / r);

    return Math.round(parteInicial + parteAportes);
  };

  const proyecciones = {
    "5": calcularFuturo(5),
    "10": calcularFuturo(10),
    "20": calcularFuturo(20)
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0
    }).format(val);
  };

  const generateCurvePoints = () => {
    const puntos = [];
    const maxVal = Math.max(1, proyecciones["20"]);
    for (let t = 0; t <= 20; t++) {
      const val = calcularFuturo(t);
      const x = Math.round((t / 20) * 280) + 10;
      const y = Math.round(110 - (val / maxVal) * 90);
      puntos.push(`${x},${y}`);
    }
    return puntos.join(" ");
  };

  return (
    <div className="glass-panel rounded-3xl p-6 flex flex-col gap-6 relative overflow-hidden group w-full animate-fadeIn" id="interes-calculadora-panel">
      {/* Glow de fondo */}
      <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-[#d0bcff]/5 blur-[100px] rounded-full pointer-events-none"></div>

      {/* Cabecera */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#d0bcff]/10 border border-[#d0bcff]/20 flex items-center justify-center text-[#d0bcff]">
            <span className="material-symbols-outlined text-md">calculate</span>
          </div>
          <div>
            <h4 className="font-headline-md text-headline-md text-white font-bold">
              Simulador de Interés Compuesto
            </h4>
            <p className="text-xs text-[#bbcabf]/60 mt-0.5">
              Proyección a futuro de tu patrimonio acumulado ({formatCurrency(capitalInicial)})
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Sliders de Entrada */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex flex-col gap-2 bg-[#060e20]/40 p-4 rounded-2xl border border-white/5">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-[#bbcabf]">Ahorro Mensual Nuevo:</span>
              <span className="text-[#4edea3] font-bold">{formatCurrency(ahorroMensual)}/mes</span>
            </div>
            <input
              type="range"
              min="0"
              max="2000"
              step="50"
              value={ahorroMensual}
              onChange={(e) => setAhorroMensual(Number(e.target.value))}
              className="w-full accent-[#4edea3] cursor-pointer h-1.5 bg-[#171f33] rounded-lg appearance-none"
            />
            <span className="text-[10px] text-[#bbcabf]/50 leading-normal">
              Capital mensual derivado a inversión o ahorro líquido.
            </span>
          </div>

          <div className="flex flex-col gap-2 bg-[#060e20]/40 p-4 rounded-2xl border border-white/5">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-[#bbcabf]">Interés Anual Estimado:</span>
              <span className="text-[#d0bcff] font-bold">{tasaRetorno}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              step="0.5"
              value={tasaRetorno}
              onChange={(e) => setTasaRetorno(Number(e.target.value))}
              className="w-full accent-[#d0bcff] cursor-pointer h-1.5 bg-[#171f33] rounded-lg appearance-none"
            />
            <span className="text-[10px] text-[#bbcabf]/50 leading-normal">
              Rendimiento neto anualizado esperado (MSCI World histórico: ~7-8%).
            </span>
          </div>
        </div>

        {/* Gráfico y Resultados */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
          
          {/* Proyecciones */}
          <div className="sm:col-span-5 flex flex-col gap-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-[#bbcabf]/60 uppercase font-semibold">En 5 Años</span>
              <span className="text-white font-bold text-sm">{formatCurrency(proyecciones["5"])}</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-[#bbcabf]/60 uppercase font-semibold">En 10 Años</span>
              <span className="text-[#4edea3] font-bold text-sm">{formatCurrency(proyecciones["10"])}</span>
            </div>
            <div className="flex items-center justify-between pb-1">
              <span className="text-[#d0bcff] uppercase font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm animate-pulse">bolt</span> En 20 Años
              </span>
              <span className="text-[#d0bcff] font-bold text-md sm:text-lg">{formatCurrency(proyecciones["20"])}</span>
            </div>
            
            <div className="bg-[#060e20]/50 border border-white/5 rounded-2xl p-3 text-[10px] text-[#bbcabf]/70 leading-relaxed mt-1">
              🚀 <strong className="text-white font-semibold">Efecto Compuesto:</strong> Tus reinversiones recurrentes generarán un crecimiento patrimonial exponencial.
            </div>
          </div>

          {/* Gráfico SVG */}
          <div className="sm:col-span-7 flex flex-col gap-2 bg-[#060e20]/20 border border-white/5 rounded-2xl p-3 items-center">
            <div className="w-full h-24 relative">
              <svg viewBox="0 0 300 120" className="w-full h-full">
                {/* Rejillas */}
                <line x1="10" y1="20" x2="290" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" strokeDasharray="3" />
                <line x1="10" y1="50" x2="290" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" strokeDasharray="3" />
                <line x1="10" y1="80" x2="290" y2="80" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" strokeDasharray="3" />
                <line x1="10" y1="110" x2="290" y2="110" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

                {/* Sombra de la curva */}
                <path
                  d={`M 10,110 L ${generateCurvePoints()} L 290,110 Z`}
                  fill="url(#violetChartGradient)"
                  opacity="0.15"
                />

                {/* Línea de la curva */}
                <polyline
                  fill="none"
                  stroke="#d0bcff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={generateCurvePoints()}
                />

                {/* Marcador final */}
                <circle cx="290" cy="20" r="3" fill="#d0bcff" className="shadow-[0_0_8px_#d0bcff]" />
                
                {/* Definiciones */}
                <defs>
                  <linearGradient id="violetChartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#d0bcff" />
                    <stop offset="100%" stopColor="#d0bcff" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            
            <div className="flex justify-between w-full font-mono text-[9px] text-[#bbcabf]/40 px-1 border-t border-white/5 pt-1.5">
              <span>Hoy</span>
              <span>10a</span>
              <span>20 años</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
