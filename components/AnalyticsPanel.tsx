"use client";

import React, { useState } from "react";
import { Transaccion } from "../lib/types";
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowRight, 
  Percent, 
  Calendar, 
  Sparkles, 
  ArrowLeftRight, 
  Calculator, 
  Activity,
  ChevronRight
} from "lucide-react";

interface AnalyticsPanelProps {
  transacciones: Transaccion[];
  totalAhorros: number;
  totalInversiones: number;
}

export function AnalyticsPanel({ transacciones, totalAhorros, totalInversiones }: AnalyticsPanelProps) {
  const [activeTab, setActiveTab] = useState<"comparativa" | "calculadora">("comparativa");
  
  // 1. Estados para el simulador de interés compuesto
  const [tasaRetorno, setTasaRetorno] = useState<number>(7);
  const [ahorroMensual, setAhorroMensual] = useState<number>(300);

  // 2. Agrupación y cálculo mensual para la comparativa
  // Obtener meses únicos presentes en las transacciones
  const getMonthsList = () => {
    const monthsSet = new Set<string>();
    transacciones.forEach((t) => {
      if (t.fecha) {
        // Formato fecha: YYYY-MM-DD -> extraemos YYYY-MM
        const month = t.fecha.substring(0, 7);
        monthsSet.add(month);
      }
    });
    // Ordenar cronológicamente descendente (más recientes primero)
    return Array.from(monthsSet).sort((a, b) => b.localeCompare(a));
  };

  const mesesDisponibles = getMonthsList();
  
  // Meses por defecto: Mes A = más reciente, Mes B = anterior
  const [mesA, setMesA] = useState<string>(mesesDisponibles[0] || "2026-06");
  const [mesB, setMesB] = useState<string>(mesesDisponibles[1] || (mesesDisponibles[0] ? "" : "2026-05"));

  // Formatear mes de YYYY-MM a "NombreMes Año"
  const formatMonthName = (monthStr: string) => {
    if (!monthStr) return "N/A";
    const [year, month] = monthStr.split("-");
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  };

  // Calcular métricas para un mes determinado
  const getMonthlyMetrics = (monthStr: string) => {
    const txsMes = transacciones.filter((t) => t.fecha && t.fecha.startsWith(monthStr));
    
    const ingresos = txsMes
      .filter((t) => t.tipo === "ingreso")
      .reduce((sum, t) => sum + t.monto, 0);

    const fijos = txsMes
      .filter((t) => t.tipo === "gasto fijo")
      .reduce((sum, t) => sum + t.monto, 0);

    const variables = txsMes
      .filter((t) => t.tipo === "gasto variable")
      .reduce((sum, t) => sum + t.monto, 0);

    const ahorros = txsMes
      .filter((t) => t.tipo === "ahorro")
      .reduce((sum, t) => sum + t.monto, 0);

    const inversiones = txsMes
      .filter((t) => t.tipo === "inversión")
      .reduce((sum, t) => sum + t.monto, 0);

    // Superávit Neto / Ahorro Neto Líquido = Ingresos + (Fijos + Variables) - (Ahorros + Inversiones)
    const neto = ingresos + (fijos + variables) - (ahorros + inversiones);

    return {
      ingresos,
      fijos: Math.abs(fijos),
      variables: Math.abs(variables),
      ahorros,
      inversiones,
      neto
    };
  };

  const metricsA = getMonthlyMetrics(mesA);
  const metricsB = mesB ? getMonthlyMetrics(mesB) : { ingresos: 0, fijos: 0, variables: 0, ahorros: 0, inversiones: 0, neto: 0 };

  // Calcular diferencia porcentual: ((A - B) / B) * 100
  const getDeltaPct = (valA: number, valB: number) => {
    if (valB === 0) return valA > 0 ? 100 : 0;
    return ((valA - valB) / valB) * 100;
  };

  // Renderizar la medalla de variación porcentual
  const renderDeltaBadge = (pct: number, inverse = false) => {
    // inverse = true -> menor valor es mejor (ej. en gastos)
    const isGood = inverse ? pct < 0 : pct > 0;
    const isNeutral = pct === 0;

    if (isNeutral) {
      return (
        <span className="text-[10px] bg-white/5 border border-white/10 text-[#bbcabf] font-mono font-bold px-2 py-0.5 rounded-full select-none">
          0%
        </span>
      );
    }

    return (
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono inline-flex items-center gap-0.5 ${
        isGood 
          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
          : "bg-red-500/10 text-red-400 border border-red-500/20"
      }`}>
        {isGood ? "+" : ""}{pct.toFixed(0)}%
        {isGood ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
      </span>
    );
  };

  // Cálculos para la Calculadora de Interés
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

  const formatCurrencyValue = (val: number) => {
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
      <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-[#4edea3]/5 blur-[100px] rounded-full pointer-events-none"></div>

      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#4edea3]/10 border border-[#4edea3]/20 flex items-center justify-center text-[#4edea3]">
            <span className="material-symbols-outlined text-md">leaderboard</span>
          </div>
          <div>
            <h4 className="font-headline-md text-headline-md text-white font-bold">
              Analytics y Proyecciones
            </h4>
            <p className="text-xs text-[#bbcabf]/60 mt-0.5">
              Comparativas entre periodos financieros y simulador de crecimiento patrimonial
            </p>
          </div>
        </div>

        {/* Pestanas */}
        <div className="flex bg-[#060e20]/60 p-1.5 rounded-xl border border-white/5 self-start sm:self-center">
          <button
            onClick={() => setActiveTab("comparativa")}
            className={`text-xs px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer border-none outline-none ${
              activeTab === "comparativa"
                ? "bg-[#4edea3] text-[#003824] font-bold"
                : "text-[#bbcabf] hover:text-white"
            }`}
          >
            Comparativa Mensual
          </button>
          <button
            onClick={() => setActiveTab("calculadora")}
            className={`text-xs px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer border-none outline-none ${
              activeTab === "calculadora"
                ? "bg-[#4edea3] text-[#003824] font-bold"
                : "text-[#bbcabf] hover:text-white"
            }`}
          >
            Interés Compuesto
          </button>
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="min-h-[220px]">
        
        {/* TABA 1: COMPARATIVA MENSUAL */}
        {activeTab === "comparativa" && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            
            {/* Cabecera de selectores */}
            <div className="flex flex-wrap items-center gap-4 bg-[#060e20]/40 p-4 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2 text-xs text-[#bbcabf]">
                <Calendar className="w-4 h-4 text-[#4edea3]" />
                <span className="font-mono uppercase tracking-wider font-semibold">Comparar mes:</span>
              </div>
              
              <div className="flex items-center gap-3">
                <select
                  value={mesA}
                  onChange={(e) => setMesA(e.target.value)}
                  className="bg-[#131b2e] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none cursor-pointer focus:border-[#4edea3]"
                >
                  {mesesDisponibles.map((m) => (
                    <option key={m} value={m}>{formatMonthName(m)}</option>
                  ))}
                </select>

                <span className="text-[#bbcabf]/50 font-mono text-xs">con</span>

                <select
                  value={mesB}
                  onChange={(e) => setMesB(e.target.value)}
                  disabled={mesesDisponibles.length < 2}
                  className="bg-[#131b2e] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none cursor-pointer focus:border-[#4edea3] disabled:opacity-50"
                >
                  {mesesDisponibles.length < 2 && (
                    <option value="">(Sin otros meses)</option>
                  )}
                  {mesesDisponibles.map((m) => (
                    <option key={m} value={m} disabled={m === mesA}>{formatMonthName(m)}</option>
                  ))}
                </select>
              </div>

              {mesesDisponibles.length < 2 && (
                <p className="text-[10px] text-yellow-400 font-mono flex items-center gap-1.5 ml-auto">
                  * Registra movimientos en fechas pasadas para comparar meses reales.
                </p>
              )}
            </div>

            {/* Grid de comparación */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Tabla Comparativa (Izquierda) */}
              <div className="lg:col-span-8 border border-white/5 rounded-2xl overflow-hidden bg-slate-950/20 text-xs">
                
                {/* Header Tabla */}
                <div className="grid grid-cols-4 bg-white/5 p-3.5 font-mono font-bold text-[#bbcabf] border-b border-white/10 uppercase tracking-wider text-[10px]">
                  <div>Métrica</div>
                  <div className="text-right truncate">{formatMonthName(mesA)}</div>
                  <div className="text-right truncate">{mesB ? formatMonthName(mesB) : "Anterior"}</div>
                  <div className="text-center">Variación</div>
                </div>

                {/* Ingresos */}
                <div className="grid grid-cols-4 p-3.5 border-b border-white/5 items-center hover:bg-white/5 transition-colors">
                  <div className="font-semibold text-white">Ingresos Totales</div>
                  <div className="text-right font-mono font-bold text-white">{formatCurrencyValue(metricsA.ingresos)}</div>
                  <div className="text-right font-mono text-[#bbcabf]/75">{formatCurrencyValue(metricsB.ingresos)}</div>
                  <div className="text-center">
                    {mesB ? renderDeltaBadge(getDeltaPct(metricsA.ingresos, metricsB.ingresos)) : "—"}
                  </div>
                </div>

                {/* Gastos Fijos */}
                <div className="grid grid-cols-4 p-3.5 border-b border-white/5 items-center hover:bg-white/5 transition-colors">
                  <div className="font-semibold text-white">Gastos Fijos</div>
                  <div className="text-right font-mono font-bold text-white">{formatCurrencyValue(metricsA.fijos)}</div>
                  <div className="text-right font-mono text-[#bbcabf]/75">{formatCurrencyValue(metricsB.fijos)}</div>
                  <div className="text-center">
                    {mesB ? renderDeltaBadge(getDeltaPct(metricsA.fijos, metricsB.fijos), true) : "—"}
                  </div>
                </div>

                {/* Gastos Variables */}
                <div className="grid grid-cols-4 p-3.5 border-b border-white/5 items-center hover:bg-white/5 transition-colors">
                  <div className="font-semibold text-white">Gastos Variables</div>
                  <div className="text-right font-mono font-bold text-white">{formatCurrencyValue(metricsA.variables)}</div>
                  <div className="text-right font-mono text-[#bbcabf]/75">{formatCurrencyValue(metricsB.variables)}</div>
                  <div className="text-center">
                    {mesB ? renderDeltaBadge(getDeltaPct(metricsA.variables, metricsB.variables), true) : "—"}
                  </div>
                </div>

                {/* Ahorros */}
                <div className="grid grid-cols-4 p-3.5 border-b border-white/5 items-center hover:bg-white/5 transition-colors">
                  <div className="font-semibold text-white">Hucha Ahorros</div>
                  <div className="text-right font-mono font-bold text-white">{formatCurrencyValue(metricsA.ahorros)}</div>
                  <div className="text-right font-mono text-[#bbcabf]/75">{formatCurrencyValue(metricsB.ahorros)}</div>
                  <div className="text-center">
                    {mesB ? renderDeltaBadge(getDeltaPct(metricsA.ahorros, metricsB.ahorros)) : "—"}
                  </div>
                </div>

                {/* Inversiones */}
                <div className="grid grid-cols-4 p-3.5 border-b border-white/5 items-center hover:bg-white/5 transition-colors">
                  <div className="font-semibold text-white">Inversión Cartera</div>
                  <div className="text-right font-mono font-bold text-white">{formatCurrencyValue(metricsA.inversiones)}</div>
                  <div className="text-right font-mono text-[#bbcabf]/75">{formatCurrencyValue(metricsB.inversiones)}</div>
                  <div className="text-center">
                    {mesB ? renderDeltaBadge(getDeltaPct(metricsA.inversiones, metricsB.inversiones)) : "—"}
                  </div>
                </div>

                {/* Superávit Líquido */}
                <div className="grid grid-cols-4 p-3.5 items-center bg-[#131b2e]/30 font-bold">
                  <div className="text-white flex items-center gap-1">
                    Superávit Líquido
                  </div>
                  <div className={`text-right font-mono ${metricsA.neto >= 0 ? "text-[#4edea3]" : "text-[#ffb4ab]"}`}>
                    {formatCurrencyValue(metricsA.neto)}
                  </div>
                  <div className="text-right font-mono text-[#bbcabf]/60">{formatCurrencyValue(metricsB.neto)}</div>
                  <div className="text-center">
                    {mesB ? renderDeltaBadge(getDeltaPct(metricsA.neto, metricsB.neto)) : "—"}
                  </div>
                </div>

              </div>

              {/* Diagnóstico Comparativo (Derecha) */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                <div className="glass-panel border-l-4 border-[#4edea3] rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden bg-slate-950/40">
                  <div className="flex gap-2">
                    <span className="material-symbols-outlined text-[#4edea3] shrink-0 mt-0.5">insights</span>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-sans font-bold text-white uppercase tracking-wider">Análisis de Progreso</span>
                      <h5 className="text-xs font-bold text-white mt-1">Comparando periodos mensuales</h5>
                    </div>
                  </div>

                  <div className="text-[11px] text-[#bbcabf]/80 leading-relaxed space-y-2.5 mt-1 border-t border-white/5 pt-3">
                    {mesB ? (
                      <>
                        {metricsA.variables < metricsB.variables ? (
                          <p className="flex items-start gap-1.5">
                            <span className="text-emerald-400 font-bold">✓</span>
                            <span>¡Buen trabajo! Redujiste tus **gastos variables** un **{Math.abs(getDeltaPct(metricsA.variables, metricsB.variables)).toFixed(0)}%** frente al mes anterior.</span>
                          </p>
                        ) : metricsA.variables > metricsB.variables ? (
                          <p className="flex items-start gap-1.5">
                            <span className="text-yellow-400 font-bold">⚠</span>
                            <span>Tus **gastos variables** aumentaron un **{getDeltaPct(metricsA.variables, metricsB.variables).toFixed(0)}%**. Revisa si hay cargos recurrentes innecesarios.</span>
                          </p>
                        ) : null}

                        {metricsA.inversiones + metricsA.ahorros > metricsB.inversiones + metricsB.ahorros ? (
                          <p className="flex items-start gap-1.5">
                            <span className="text-emerald-400 font-bold">✓</span>
                            <span>Tu esfuerzo de ahorro e inversión creció un **{getDeltaPct(metricsA.inversiones + metricsA.ahorros, metricsB.inversiones + metricsB.ahorros).toFixed(0)}%** este mes. ¡Sigue así!</span>
                          </p>
                        ) : null}

                        {metricsA.neto < 0 && (
                          <p className="flex items-start gap-1.5 text-[#ffb4ab]">
                            <span className="font-bold">❌</span>
                            <span>Cuidado: Tu saldo neto es negativo en {formatMonthName(mesA)}. Estás consumiendo capital líquido.</span>
                          </p>
                        )}
                        
                        {metricsA.variables <= metricsB.variables && metricsA.inversiones + metricsA.ahorros >= metricsB.inversiones + metricsB.ahorros && (
                          <p className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl p-2 font-mono text-center font-bold">
                            ✨ ¡Mes Financieramente Excelente!
                          </p>
                        )}
                      </>
                    ) : (
                      <p>Registra transacciones en el mes anterior para ver una auditoría automática de tu tasa de ahorro e inflación de estilo de vida.</p>
                    )}
                  </div>
                </div>

                {/* Explicación métricas */}
                <div className="bg-[#060e20]/20 border border-white/5 rounded-2xl p-4 text-[10px] text-[#bbcabf]/60 leading-normal flex flex-col gap-2">
                  <span className="font-bold text-white uppercase font-mono tracking-wide">Fórmula del Superávit:</span>
                  <p>
                    Corresponde a la liquidez adicional que has generado. 
                    Calculado como: **Ingresos - Gastos Fijos - Gastos Variables - (Ahorros + Inversiones)**.
                  </p>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TABA 2: SIMULADOR DE INTERÉS COMPUESTO */}
        {activeTab === "calculadora" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fadeIn">
            
            {/* Sliders de Entrada */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="flex flex-col gap-2 bg-[#060e20]/40 p-4 rounded-2xl border border-white/5">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-[#bbcabf]">Ahorro Mensual Nuevo:</span>
                  <span className="text-[#4edea3] font-bold">{formatCurrencyValue(ahorroMensual)}/mes</span>
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
                  <span className="text-white font-bold text-sm">{formatCurrencyValue(proyecciones["5"])}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-[#bbcabf]/60 uppercase font-semibold">En 10 Años</span>
                  <span className="text-[#4edea3] font-bold text-sm">{formatCurrencyValue(proyecciones["10"])}</span>
                </div>
                <div className="flex items-center justify-between pb-1">
                  <span className="text-[#d0bcff] uppercase font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm animate-pulse">bolt</span> En 20 Años
                  </span>
                  <span className="text-[#d0bcff] font-bold text-md sm:text-lg">{formatCurrencyValue(proyecciones["20"])}</span>
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
        )}

      </div>
    </div>
  );
}
