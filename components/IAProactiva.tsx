"use client";

import React, { useState, useEffect, useRef } from "react";
import { Transaccion } from "../lib/types";
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  HelpCircle, 
  Send, 
  Loader2, 
  Check, 
  ShieldAlert, 
  Coins, 
  Activity, 
  PieChart 
} from "lucide-react";

interface IAProactivaProps {
  transacciones: Transaccion[];
  dineroLiquido: number;
  totalAhorros: number;
  totalInversiones: number;
  totalGastosFijos: number;
  totalGastosVariables: number;
  topeFijo: number;
  topeVariable: number;
}

interface Message {
  sender: "user" | "bot";
  text: string;
}

export function IAProactiva({
  transacciones,
  dineroLiquido,
  totalAhorros,
  totalInversiones,
  totalGastosFijos,
  totalGastosVariables,
  topeFijo,
  topeVariable
}: IAProactivaProps) {
  const [activeTab, setActiveTab] = useState<"diagnostico" | "planes" | "chat">("diagnostico");
  
  // Chat States
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "👋 ¡Hola, Álvaro! Soy tu asistente de BilleterIA. He analizado tus movimientos patrimoniales. ¿En qué puedo ayudarte hoy? Puedes preguntarme cosas como:\n\n- *¿Mi fondo de ahorro es suficiente?*\n- *¿Cómo voy de presupuesto de gastos fijos y variables?*\n- *¿Cómo puedo optimizar mi cartera de inversiones?*"
    }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isChatLoading]);

  // Cálculos financieros en base a las transacciones
  const totalIngresos = transacciones
    .filter((t) => t.tipo === "ingreso")
    .reduce((sum, t) => sum + t.monto, 0);

  const totalGastosFijosAbs = Math.abs(totalGastosFijos);
  const totalGastosVariablesAbs = Math.abs(totalGastosVariables);
  const patrimonioTotal = dineroLiquido + totalAhorros + totalInversiones;

  // 1. Tasa de Ahorro e Inversión
  const tasaAhorroInversion = totalIngresos > 0 
    ? (((totalAhorros + totalInversiones) / totalIngresos) * 100) 
    : 0;

  // 2. Cobertura de la Hucha de Emergencias (meses cubiertos de gastos fijos)
  const mesesCobertura = totalGastosFijosAbs > 0 
    ? (totalAhorros / totalGastosFijosAbs) 
    : 0;

  // 3. Consumo de presupuestos
  const pctGastosVariables = topeVariable > 0 ? (totalGastosVariablesAbs / topeVariable) * 100 : 0;
  const pctGastosFijos = topeFijo > 0 ? (totalGastosFijosAbs / topeFijo) * 100 : 0;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage = chatInput.trim();
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setChatInput("");
    setIsChatLoading(true);

    try {
      const response = await fetch("/api/financial-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pregunta: userMessage,
          transacciones,
          dineroLiquido,
          totalAhorros,
          totalInversiones,
          totalGastosFijos,
          totalGastosVariables,
          topeFijo,
          topeVariable
        })
      });

      if (!response.ok) throw new Error("Error en la respuesta del servidor");

      const data = await response.json();
      setMessages((prev) => [...prev, { sender: "bot", text: data.advice }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "⚠️ Vaya, ha ocurrido un error al procesar tu solicitud. Por favor, vuelve a intentarlo en unos instantes."
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR"
    }).format(val);
  };

  return (
    <div className="glass-panel rounded-3xl p-6 flex flex-col gap-6 relative overflow-hidden group animate-fadeIn w-full" id="ia-proactiva-panel">
      {/* Glow de fondo */}
      <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-[#d0bcff]/5 blur-[100px] rounded-full pointer-events-none"></div>
      
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#d0bcff]/10 border border-[#d0bcff]/20 rounded-2xl flex items-center justify-center text-[#d0bcff]">
            <Brain className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="font-headline-md text-headline-md text-white font-bold flex items-center gap-2">
              Asesoría Financiera IA Proactiva
              <span className="text-[9px] bg-[#d0bcff]/10 text-[#d0bcff] border border-[#d0bcff]/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono">
                Pro
              </span>
            </h3>
            <p className="text-xs text-[#bbcabf]/70 mt-0.5">Diagnósticos patrimoniales automáticos y consejos económicos personalizados</p>
          </div>
        </div>

        {/* Pestañas */}
        <div className="flex bg-[#060e20]/60 p-1.5 rounded-xl border border-white/5 self-start sm:self-center">
          <button
            onClick={() => setActiveTab("diagnostico")}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer border-none outline-none ${
              activeTab === "diagnostico"
                ? "bg-[#d0bcff] text-[#23005c] font-bold"
                : "text-[#bbcabf] hover:text-white"
            }`}
          >
            Diagnóstico
          </button>
          <button
            onClick={() => setActiveTab("planes")}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer border-none outline-none ${
              activeTab === "planes"
                ? "bg-[#d0bcff] text-[#23005c] font-bold"
                : "text-[#bbcabf] hover:text-white"
            }`}
          >
            Reglas y Optimización
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer border-none outline-none ${
              activeTab === "chat"
                ? "bg-[#d0bcff] text-[#23005c] font-bold"
                : "text-[#bbcabf] hover:text-white"
            }`}
          >
            Consultor Chat IA
          </button>
        </div>
      </div>

      {/* Contenido según pestaña */}
      <div className="min-h-[280px]">
        
        {/* TABA 1: DIAGNÓSTICO */}
        {activeTab === "diagnostico" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
            
            {/* Hucha de Emergencias */}
            <div className="bg-[#060e20]/40 border border-white/5 rounded-2xl p-5 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#bbcabf]/70">Fondo de Emergencia</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  mesesCobertura < 3 ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                }`}>
                  {mesesCobertura < 3 ? "Aumento Requerido" : "Nivel Seguro"}
                </span>
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-extrabold text-white">{formatCurrency(totalAhorros)}</span>
              </div>
              <p className="text-xs text-[#bbcabf]/75 leading-relaxed flex-1">
                Equivale a **{mesesCobertura.toFixed(1)} meses** de tus gastos fijos mensuales ({formatCurrency(totalGastosFijosAbs)}). Un fondo saludable debe cubrir de 3 a 6 meses.
              </p>
              {mesesCobertura < 3 && (
                <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-2.5 flex items-start gap-2 text-[10px] text-red-400">
                  <ShieldAlert className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                  <span>Te sugerimos desviar temporalmente el 10% de tus ingresos a la Hucha de Ahorros para cubrir imprevistos.</span>
                </div>
              )}
            </div>

            {/* Tasa de Inversión */}
            <div className="bg-[#060e20]/40 border border-white/5 rounded-2xl p-5 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#bbcabf]/70">Tasa de Ahorro / Inversión</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  tasaAhorroInversion < 15 ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                }`}>
                  {tasaAhorroInversion < 15 ? "Meta Incompleta" : "Excelente"}
                </span>
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-extrabold text-white">{tasaAhorroInversion.toFixed(1)}%</span>
                <span className="text-xs text-[#bbcabf]/50">de ingresos</span>
              </div>
              <p className="text-xs text-[#bbcabf]/75 leading-relaxed flex-1">
                Actualmente estás ahorrando o invirtiendo **{formatCurrency(totalAhorros + totalInversiones)}** de tus ingresos totales ({formatCurrency(totalIngresos)}). 
              </p>
              {tasaAhorroInversion < 15 ? (
                <div className="bg-yellow-950/20 border border-yellow-900/30 rounded-xl p-2.5 flex items-start gap-2 text-[10px] text-yellow-400">
                  <AlertTriangle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                  <span>Tu tasa de ahorro está por debajo del 15% aconsejado. Revisa si hay fugas en tus gastos variables.</span>
                </div>
              ) : (
                <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-2.5 flex items-start gap-2 text-[10px] text-[#4edea3]">
                  <Check className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                  <span>¡Excelente hábito! Cumples con holgura la regla del 15% de control patrimonial.</span>
                </div>
              )}
            </div>

            {/* Estado de Límites y Presupuesto */}
            <div className="bg-[#060e20]/40 border border-white/5 rounded-2xl p-5 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#bbcabf]/70">Límites de Presupuestos</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  pctGastosVariables > 80 ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                }`}>
                  {pctGastosVariables > 80 ? "Alerta de Fuga" : "Presupuesto OK"}
                </span>
              </div>
              
              <div className="flex flex-col gap-2 mt-1 flex-1">
                <div>
                  <div className="flex justify-between text-[10px] text-[#bbcabf] font-mono mb-1">
                    <span>Variables ({totalGastosVariablesAbs.toFixed(0)}€)</span>
                    <span>{pctGastosVariables.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${pctGastosVariables > 80 ? "bg-red-500" : "bg-[#4edea3]"}`} style={{ width: `${Math.min(pctGastosVariables, 100)}%` }} />
                  </div>
                </div>

                <div className="mt-2">
                  <div className="flex justify-between text-[10px] text-[#bbcabf] font-mono mb-1">
                    <span>Fijos ({totalGastosFijosAbs.toFixed(0)}€)</span>
                    <span>{pctGastosFijos.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: `${Math.min(pctGastosFijos, 100)}%` }} />
                  </div>
                </div>
              </div>

              {pctGastosVariables > 80 && (
                <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-2.5 text-[10px] text-red-400 flex items-start gap-2">
                  <ShieldAlert className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                  <span>Has agotado casi todo tu presupuesto de ocio y gastos variables. Evita salidas y compras discrecionales.</span>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TABA 2: REGLAS Y OPTIMIZACIÓN */}
        {activeTab === "planes" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn text-xs">
            
            {/* Lógica 50/30/20 */}
            <div className="bg-[#060e20]/40 border border-white/5 rounded-2xl p-5 flex flex-col gap-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-2">
                <PieChart className="w-4 h-4 text-purple-400" /> Distribución Patrimonial Sugerida (Regla 50/30/20)
              </h4>
              <p className="text-[#bbcabf] leading-normal">
                Para tu nivel de ingresos mensuales, la teoría financiera clásica recomienda dividir tu capital en tres partes:
              </p>
              
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-16 text-right font-mono font-bold text-white">50% fijos</span>
                  <div className="flex-1 bg-slate-900 h-3.5 rounded-lg overflow-hidden flex items-center justify-between px-2 text-[9px] text-[#bbcabf] relative">
                    <div className="absolute left-0 top-0 bottom-0 bg-purple-500/20" style={{ width: "50%" }} />
                    <span className="z-10 font-bold">Límite Ideal: {formatCurrency(totalIngresos * 0.5)}</span>
                    <span className="z-10 text-white font-bold">Real: {formatCurrency(totalGastosFijosAbs)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="w-16 text-right font-mono font-bold text-white">30% variables</span>
                  <div className="flex-1 bg-slate-900 h-3.5 rounded-lg overflow-hidden flex items-center justify-between px-2 text-[9px] text-[#bbcabf] relative">
                    <div className="absolute left-0 top-0 bottom-0 bg-yellow-500/20" style={{ width: "30%" }} />
                    <span className="z-10 font-bold">Límite Ideal: {formatCurrency(totalIngresos * 0.3)}</span>
                    <span className="z-10 text-white font-bold">Real: {formatCurrency(totalGastosVariablesAbs)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="w-16 text-right font-mono font-bold text-white">20% ahorro</span>
                  <div className="flex-1 bg-slate-900 h-3.5 rounded-lg overflow-hidden flex items-center justify-between px-2 text-[9px] text-[#bbcabf] relative">
                    <div className="absolute left-0 top-0 bottom-0 bg-[#4edea3]/20" style={{ width: "20%" }} />
                    <span className="z-10 font-bold">Meta Ideal: {formatCurrency(totalIngresos * 0.2)}</span>
                    <span className="z-10 text-white font-bold">Real: {formatCurrency(totalAhorros + totalInversiones)}</span>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-[#bbcabf]/70 italic mt-1 leading-relaxed">
                * Las proporciones ideales se calculan automáticamente sobre tus ingresos mensuales totales. Ajustar tus límites en la barra de "Budgets" te ayudará a cumplir estas métricas.
              </p>
            </div>

            {/* Consejos Activos de Ahorro */}
            <div className="bg-[#060e20]/40 border border-white/5 rounded-2xl p-5 flex flex-col gap-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-2">
                <Coins className="w-4 h-4 text-[#4edea3]" /> Auditoría de Gastos Recurrentes y Suscripciones
              </h4>
              <p className="text-[#bbcabf] leading-normal mb-1">
                La IA ha analizado tus conceptos e identificó oportunidades de optimización patrimonial inmediata:
              </p>
              
              <div className="flex flex-col gap-3.5 flex-1">
                
                <div className="bg-[#131b2e]/60 border border-white/5 rounded-xl p-3 flex gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-[#4edea3] flex items-center justify-center shrink-0">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white">Adopta aportaciones automáticas</span>
                    <p className="text-[11px] text-[#bbcabf]/75 mt-0.5 leading-relaxed">
                      Si transfieres el 15% de tu sueldo (aprox. **375,00€**) de forma automatizada a principios de mes, evitarás la tentación de gastarlo.
                    </p>
                  </div>
                </div>

                <div className="bg-[#131b2e]/60 border border-white/5 rounded-xl p-3 flex gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white">Revisa tu gasto en Restauración</span>
                    <p className="text-[11px] text-[#bbcabf]/75 mt-0.5 leading-relaxed">
                      El ocio discrecional representa un porcentaje elevado de tus variables. Cocinar más en casa y evitar Uber/Taxis innecesarios te ahorraría hasta un 25% mensual.
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* TABA 3: CONSULTOR CHAT IA */}
        {activeTab === "chat" && (
          <div className="flex flex-col gap-4 h-[350px] animate-fadeIn">
            
            {/* Historial de Mensajes */}
            <div className="flex-1 overflow-y-auto bg-[#060e20]/30 border border-white/5 rounded-2xl p-4 flex flex-col gap-3.5 custom-scrollbar scroll-smooth">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col max-w-[85%] ${
                    msg.sender === "user" ? "self-end items-end" : "self-start items-start"
                  }`}
                >
                  <span className="text-[9px] text-[#bbcabf]/40 font-mono mb-1">
                    {msg.sender === "user" ? "TÚ" : "BILLETERIA IA"}
                  </span>
                  <div
                    className={`rounded-2xl px-4 py-3 text-xs leading-relaxed whitespace-pre-line ${
                      msg.sender === "user"
                        ? "bg-[#d0bcff] text-[#23005c] font-medium rounded-tr-none"
                        : "bg-[#131b2e] border border-white/5 text-[#dae2fd] rounded-tl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {isChatLoading && (
                <div className="self-start flex items-center gap-2 bg-[#131b2e] border border-white/5 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-[#bbcabf]">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#d0bcff]" />
                  <span>Analizando tus transacciones y redactando respuesta...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input y Botón de Envío */}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Pregúntame sobre tu hucha de emergencias, tus presupuestos, etc."
                disabled={isChatLoading}
                className="flex-1 bg-[#060e20]/60 border border-white/10 focus:border-[#d0bcff] focus:ring-1 focus:ring-[#d0bcff] rounded-xl py-3 px-4 text-xs text-[#dae2fd] placeholder:text-slate-600 outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={isChatLoading || !chatInput.trim()}
                className="bg-[#d0bcff] hover:bg-[#c0a6ff] text-[#23005c] p-3 rounded-xl transition-all cursor-pointer flex items-center justify-center border-none outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        )}

      </div>
    </div>
  );
}
