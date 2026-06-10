import React from "react";

interface GaugesPanelProps {
  dineroLiquido: number;
  totalAhorros: number;
  totalInversiones: number;
  totalIngresos: number;
  patrimonioTotal: number;
}

export function GaugesPanel({
  dineroLiquido,
  totalAhorros,
  totalInversiones,
  totalIngresos,
  patrimonioTotal
}: GaugesPanelProps) {
  
  // Límites máximos arbitrarios para la escala visual del gauge (0% a 100%)
  const maxLiquidez = 5000;
  const maxAhorros = 15000;
  const maxInversiones = 30000;

  const getPercentage = (value: number, max: number) => {
    const clamped = Math.max(0, Math.min(value, max));
    return Math.round((clamped / max) * 100);
  };

  const getDashOffset = (value: number, max: number) => {
    const percent = getPercentage(value, max);
    // stroke-dasharray para radio 45 es 283
    return Math.max(0, Math.min(283, 283 - (percent / 100) * 283));
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(val);
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn" id="gauges-dashboard-panel">
      {/* Tarjeta de Patrimonio Total */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden group">
        {/* Glow de fondo */}
        <div className="absolute -top-10 -right-10 w-96 h-96 bg-[#4edea3]/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#4edea3] via-[#d0bcff] to-transparent"></div>
        
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] uppercase tracking-widest text-[#bbcabf] font-mono font-semibold">
            Patrimonio Total Consolidado
          </span>
          <div className="flex items-baseline gap-2.5">
            <h1 className="text-3xl sm:text-4xl font-headline-lg font-bold text-white tracking-tight leading-none">
              {formatCurrency(patrimonioTotal)}
            </h1>
            <span className="text-[10px] text-[#4edea3] font-mono font-bold bg-[#4edea3]/10 px-2 py-0.5 rounded border border-[#4edea3]/20 uppercase">
              Neto Real
            </span>
          </div>
          <p className="text-xs text-[#bbcabf]/70 max-w-lg mt-1">
            Consolidación en tiempo real del dinero en cuentas, hucha de emergencias y cartera de inversión, restando los gastos devengados.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 shrink-0 font-mono text-xs">
          <div className="bg-[#060e20]/50 border border-white/5 rounded-2xl px-4 py-3 flex flex-col gap-0.5">
            <span className="text-[9px] text-[#bbcabf]/50 uppercase font-semibold">Ingresos</span>
            <span className="text-white font-bold text-sm">{formatCurrency(totalIngresos)}</span>
          </div>
          <div className="bg-[#060e20]/50 border border-white/5 rounded-2xl px-4 py-3 flex flex-col gap-0.5">
            <span className="text-[9px] text-[#bbcabf]/50 uppercase font-semibold">Hucha Ahorro</span>
            <span className="text-[#d0bcff] font-bold text-sm">{formatCurrency(totalAhorros)}</span>
          </div>
          <div className="bg-[#060e20]/50 border border-white/5 rounded-2xl px-4 py-3 flex flex-col gap-0.5">
            <span className="text-[9px] text-[#bbcabf]/50 uppercase font-semibold">Inversiones</span>
            <span className="text-[#4cd7f6] font-bold text-sm">{formatCurrency(totalInversiones)}</span>
          </div>
        </div>
      </div>

      {/* Grid de 3 Gauges Circulares */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {/* Liquid Cash */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#4edea3] to-transparent"></div>
          <h4 className="font-bold text-xs uppercase tracking-widest text-[#bbcabf] mb-6">Liquid Cash</h4>
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="gauge-svg w-full h-full" viewBox="0 0 100 100">
              <circle cx="50" cy="50" fill="none" r="45" stroke="rgba(255,255,255,0.03)" strokeLinecap="round" strokeWidth="8"></circle>
              <circle 
                className="gauge-path" 
                cx="50" 
                cy="50" 
                fill="none" 
                r="45" 
                stroke="url(#emeraldGradient)" 
                strokeLinecap="round" 
                strokeWidth="8" 
                style={{ strokeDashoffset: getDashOffset(dineroLiquido, maxLiquidez) }}
              ></circle>
              <defs>
                <linearGradient id="emeraldGradient" x1="0%" x2="100%" y1="0%" y2="0%">
                  <stop offset="0%" stopColor="#4edea3"></stop>
                  <stop offset="100%" stopColor="#10b981"></stop>
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-bold text-xl sm:text-2xl text-[#4edea3]">
                {formatCurrency(dineroLiquido)}
              </span>
              <span className="text-[9px] text-[#bbcabf]/60 font-bold uppercase tracking-tighter mt-0.5">
                {getPercentage(dineroLiquido, maxLiquidez)}% OF TARGET
              </span>
            </div>
          </div>
          <div className="mt-4 flex gap-1.5 items-center">
            <span className="material-symbols-outlined text-[#4edea3] text-sm">trending_up</span>
            <span className="font-bold text-xs text-[#4edea3]">+2.4%</span>
          </div>
        </div>

        {/* Savings */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#d0bcff] to-transparent"></div>
          <h4 className="font-bold text-xs uppercase tracking-widest text-[#bbcabf] mb-6">Savings</h4>
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="gauge-svg w-full h-full" viewBox="0 0 100 100">
              <circle cx="50" cy="50" fill="none" r="45" stroke="rgba(255,255,255,0.03)" strokeLinecap="round" strokeWidth="8"></circle>
              <circle 
                className="gauge-path" 
                cx="50" 
                cy="50" 
                fill="none" 
                r="45" 
                stroke="url(#violetGradient)" 
                strokeLinecap="round" 
                strokeWidth="8" 
                style={{ strokeDashoffset: getDashOffset(totalAhorros, maxAhorros) }}
              ></circle>
              <defs>
                <linearGradient id="violetGradient" x1="0%" x2="100%" y1="0%" y2="0%">
                  <stop offset="0%" stopColor="#d0bcff"></stop>
                  <stop offset="100%" stopColor="#571bc1"></stop>
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-bold text-xl sm:text-2xl text-[#d0bcff]">
                {formatCurrency(totalAhorros)}
              </span>
              <span className="text-[9px] text-[#bbcabf]/60 font-bold uppercase tracking-tighter mt-0.5">
                {getPercentage(totalAhorros, maxAhorros)}% OF TARGET
              </span>
            </div>
          </div>
          <div className="mt-4 flex gap-1.5 items-center">
            <span className="material-symbols-outlined text-[#d0bcff] text-sm">auto_awesome</span>
            <span className="font-bold text-xs text-[#d0bcff]">ESTABLE</span>
          </div>
        </div>

        {/* Investments */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#4cd7f6] to-transparent"></div>
          <h4 className="font-bold text-xs uppercase tracking-widest text-[#bbcabf] mb-6">Investments</h4>
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="gauge-svg w-full h-full" viewBox="0 0 100 100">
              <circle cx="50" cy="50" fill="none" r="45" stroke="rgba(255,255,255,0.03)" strokeLinecap="round" strokeWidth="8"></circle>
              <circle 
                className="gauge-path" 
                cx="50" 
                cy="50" 
                fill="none" 
                r="45" 
                stroke="url(#tertiaryGradient)" 
                strokeLinecap="round" 
                strokeWidth="8" 
                style={{ strokeDashoffset: getDashOffset(totalInversiones, maxInversiones) }}
              ></circle>
              <defs>
                <linearGradient id="tertiaryGradient" x1="0%" x2="100%" y1="0%" y2="0%">
                  <stop offset="0%" stopColor="#4cd7f6"></stop>
                  <stop offset="100%" stopColor="#00b2d0"></stop>
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-bold text-xl sm:text-2xl text-[#4cd7f6]">
                {formatCurrency(totalInversiones)}
              </span>
              <span className="text-[9px] text-[#bbcabf]/60 font-bold uppercase tracking-tighter mt-0.5">
                {getPercentage(totalInversiones, maxInversiones)}% OF TARGET
              </span>
            </div>
          </div>
          <div className="mt-4 flex gap-1.5 items-center">
            <span className="material-symbols-outlined text-[#4cd7f6] text-sm">bolt</span>
            <span className="font-bold text-xs text-[#4cd7f6]">+12.8%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
