"use client";

import React, { useState } from "react";

interface CollapsibleTopesProps {
  topeFijo: number;
  setTopeFijo: (val: number) => void;
  topeVariable: number;
  setTopeVariable: (val: number) => void;
  totalGastosFijos: number;
  totalGastosVariables: number;
}

export function CollapsibleTopes({
  topeFijo,
  setTopeFijo,
  topeVariable,
  setTopeVariable,
  totalGastosFijos,
  totalGastosVariables
}: CollapsibleTopesProps) {
  
  const [fijoOpen, setFijoOpen] = useState(true);
  const [variableOpen, setVariableOpen] = useState(true);

  const getPercentage = (spent: number, limit: number) => {
    if (limit <= 0) return 0;
    return Math.min(100, Math.round((spent / limit) * 100));
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0
    }).format(val);
  };

  // Divisiones internas coherentes
  const rentaSpent = Math.round(Math.abs(totalGastosFijos) * 0.75);
  const rentaLimit = Math.round(topeFijo * 0.75);
  const rentaPercent = getPercentage(rentaSpent, rentaLimit);

  const segurosSpent = Math.round(Math.abs(totalGastosFijos) * 0.25);
  const segurosLimit = Math.round(topeFijo * 0.25);
  const segurosPercent = getPercentage(segurosSpent, segurosLimit);

  const variableSpent = Math.abs(totalGastosVariables);
  const variablePercent = getPercentage(variableSpent, topeVariable);

  return (
    <div className="space-y-6 w-full animate-fadeIn" id="collapsible-topes-container">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-headline-md text-headline-md text-white font-bold">Presupuestos</h3>
      </div>

      {/* Tope Fijo */}
      <div className="glass-panel rounded-3xl p-6">
        <button 
          onClick={() => setFijoOpen(!fijoOpen)}
          className="w-full flex justify-between items-center bg-transparent border-none outline-none cursor-pointer group text-left"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#4edea3]">lock</span>
            <span className="font-bold text-label-md text-white">Tope Fijo</span>
          </div>
          <span className={`material-symbols-outlined text-[#bbcabf] transition-transform duration-300 ${fijoOpen ? "rotate-180" : ""}`}>
            expand_more
          </span>
        </button>

        {fijoOpen && (
          <div className="mt-6 space-y-6 animate-fadeIn">
            {/* Renta & Servicios */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-[#bbcabf]/70 uppercase tracking-wide">Renta & Servicios</span>
                <span className="text-[#4edea3]">{rentaPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#4edea3] neon-glow-emerald transition-all duration-700" 
                  style={{ width: `${rentaPercent}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-2 font-medium text-[10px] text-[#bbcabf]/50">
                <span>{formatCurrency(rentaSpent)} / {formatCurrency(rentaLimit)}</span>
              </div>
            </div>

            {/* Seguros */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-[#bbcabf]/70 uppercase tracking-wide">Seguros</span>
                <span className="text-[#4edea3]">{segurosPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#4edea3] neon-glow-emerald transition-all duration-700" 
                  style={{ width: `${segurosPercent}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-2 font-medium text-[10px] text-[#bbcabf]/50">
                <span>{formatCurrency(segurosSpent)} / {formatCurrency(segurosLimit)}</span>
              </div>
            </div>

            {/* Configuración global del tope fijo */}
            <div className="bg-[#060e20]/40 p-3 rounded-2xl border border-white/5 flex flex-col gap-2">
              <div className="flex justify-between items-center text-[10px] font-mono text-[#bbcabf]/55">
                <span>Ajustar Tope Fijo Total:</span>
                <span className="text-white font-bold">{formatCurrency(topeFijo)}</span>
              </div>
              <input
                type="range"
                min="200"
                max="3000"
                step="50"
                value={topeFijo}
                onChange={(e) => setTopeFijo(Number(e.target.value))}
                className="w-full accent-[#4edea3] cursor-pointer h-1.5 bg-[#171f33] rounded-lg appearance-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Tope Variable */}
      <div className="glass-panel rounded-3xl p-6">
        <button 
          onClick={() => setVariableOpen(!variableOpen)}
          className="w-full flex justify-between items-center bg-transparent border-none outline-none cursor-pointer group text-left"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#d0bcff]">shutter_speed</span>
            <span className="font-bold text-label-md text-white">Tope Variable</span>
          </div>
          <span className={`material-symbols-outlined text-[#bbcabf] transition-transform duration-300 ${variableOpen ? "rotate-180" : ""}`}>
            expand_more
          </span>
        </button>

        {variableOpen && (
          <div className="mt-6 space-y-6 animate-fadeIn">
            {/* Entretenimiento */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-[#bbcabf]/70 uppercase tracking-wide">Entretenimiento</span>
                <span className={variablePercent >= 90 ? "text-[#ffb4ab]" : "text-[#d0bcff]"}>
                  {variablePercent}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-700 ${
                    variablePercent >= 90 
                      ? "bg-[#ffb4ab] neon-glow-violet animate-pulse" 
                      : "bg-[#d0bcff] neon-glow-violet"
                  }`} 
                  style={{ width: `${variablePercent}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-2 font-bold text-[10px]">
                {variablePercent >= 90 ? (
                  <span className="text-[#ffb4ab]">ALERTA: Límite cercano</span>
                ) : (
                  <span className="text-[#bbcabf]/50 font-normal">
                    {formatCurrency(variableSpent)} / {formatCurrency(topeVariable)}
                  </span>
                )}
              </div>
            </div>

            {/* Configuración global del tope variable */}
            <div className="bg-[#060e20]/40 p-3 rounded-2xl border border-white/5 flex flex-col gap-2">
              <div className="flex justify-between items-center text-[10px] font-mono text-[#bbcabf]/55">
                <span>Ajustar Tope Variable:</span>
                <span className="text-white font-bold">{formatCurrency(topeVariable)}</span>
              </div>
              <input
                type="range"
                min="100"
                max="2000"
                step="50"
                value={topeVariable}
                onChange={(e) => setTopeVariable(Number(e.target.value))}
                className="w-full accent-[#d0bcff] cursor-pointer h-1.5 bg-[#171f33] rounded-lg appearance-none"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
