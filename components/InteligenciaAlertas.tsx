"use client";

import React, { useMemo } from "react";
import { Transaccion, AlertaIA } from "../lib/types";

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0
  }).format(val);
};

interface InteligenciaAlertasProps {
  topeVariable: number;
  setTopeVariable: (val: number) => void;
  dineroLiquido: number;
  totalGastosVariables: number;
  transacciones: Transaccion[];
  onAddTransaccion: (tx: Omit<Transaccion, "id" | "fecha">) => void;
}

export function InteligenciaAlertas({
  topeVariable,
  setTopeVariable,
  dineroLiquido,
  totalGastosVariables,
  transacciones,
  onAddTransaccion
}: InteligenciaAlertasProps) {
  
  // Analizar datos para disparar alertas de IA dinámicas
  const alertasDinamicas = useMemo(() => {
    const list: AlertaIA[] = [];

    // 1. Regla del 15% activa
    const ultimosIngresos = transacciones.filter(t => t.tipo === "ingreso");
    if (ultimosIngresos.length > 0) {
      const ultimoIngreso = ultimosIngresos[0];
      const sugeridoInversion = Math.round(ultimoIngreso.monto * 0.15);
      
      const yaInvertido = transacciones.some(
        t => t.tipo === "inversión" && t.concepto.includes(`Regla del 15% sobre ${ultimoIngreso.concepto}`)
      );

      if (!yaInvertido && sugeridoInversion > 0) {
        list.push({
          id: `regla-15-${ultimoIngreso.id}`,
          tipo: "regla15",
          titulo: "REGLA 15% SUGERIDA",
          descripcion: `Recibiste un ingreso de ${formatCurrency(ultimoIngreso.monto)} por "${ultimoIngreso.concepto}". Te sugerimos apartar el 15% (${formatCurrency(sugeridoInversion)}) para inversión.`,
          btnLabel: `Apartar ${formatCurrency(sugeridoInversion)}`
        });
      }
    }

    // 2. Alerta de Liquidez crítica
    if (dineroLiquido < 300 && dineroLiquido > 0) {
      list.push({
        id: "alerta-liquidez-baja",
        tipo: "liquidez",
        titulo: "PRESIÓN EN LIQUIDEZ INMEDIATA",
        descripcion: "Tu saldo de dinero líquido disponible está por debajo de 300 €. Recomendamos restringir gastos discrecionales.",
      });
    } else if (dineroLiquido <= 0 && transacciones.length > 0) {
      list.push({
        id: "alerta-liquidez-negativa",
        tipo: "liquidez",
        titulo: "LIQUIDEZ AGOTADA O NEGATIVA",
        descripcion: "Tu balance de dinero líquido está en descubierto. Has cubierto tus gastos corrientes usando capital de tus ahorros.",
      });
    }

    // 3. Alerta de velocidad de gasto discrecional
    const totalGastoVarAbs = Math.abs(totalGastosVariables);
    if (totalGastoVarAbs > topeVariable * 0.85) {
      list.push({
        id: "alerta-gasto-variable-limite",
        tipo: "presupuesto",
        titulo: "TOPE VARIABLE CRÍTICO",
        descripcion: `Has consumido el ${Math.round((totalGastoVarAbs / (topeVariable || 1)) * 100)}% de tus gastos variables discrecionales de este mes.`,
        btnLabel: "Ampliar límite +150€"
      });
    }

    return list;
  }, [transacciones, dineroLiquido, totalGastosVariables, topeVariable]);

  const handleAction = (alerta: AlertaIA) => {
    if (alerta.tipo === "regla15") {
      const matches = alerta.descripcion.match(/apartar el 15% \((\d+)/);
      const monto = matches ? Number(matches[1]) : 100;

      const matchesConcepto = alerta.descripcion.match(/"([^"]+)"/);
      const conceptoBase = matchesConcepto ? matchesConcepto[1] : "Ingreso";

      onAddTransaccion({
        monto: monto,
        concepto: `Regla del 15% sobre ${conceptoBase}`,
        tipo: "inversión",
        categoria: "Inversión",
        canal: "Sistema"
      });

      alert(`¡Movimiento de inversión registrado con éxito! Se han apartado ${formatCurrency(monto)}.`);
    } else if (alerta.tipo === "presupuesto") {
      setTopeVariable(topeVariable + 150);
      alert("Límite de gastos variables ampliado en +150 €.");
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-8 relative overflow-hidden group w-full" id="inteligencia-alertas-panel">
      {/* Glow de fondo */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#4edea3]/10 blur-[100px] rounded-full pointer-events-none"></div>
      
      {/* Cabecera */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-[#4edea3]/10 border border-[#4edea3]/20 flex items-center justify-center text-[#4edea3]">
          <span className="material-symbols-outlined text-md">notifications_active</span>
        </div>
        <div>
          <h3 className="font-headline-md text-headline-md text-white font-bold">Inteligencia de Alertas</h3>
          <p className="text-[#bbcabf]/80 font-medium text-xs">Sistemas de monitoreo financiero en tiempo real</p>
        </div>
      </div>

      {/* Lista de Alertas */}
      <div className="space-y-4">
        {/* Alertas dinámicas calculadas */}
        {alertasDinamicas.map((alerta) => {
          const borderStyle = alerta.tipo === "liquidez" || alerta.tipo === "presupuesto"
            ? "border-[#ffb4ab] bg-[#ffb4ab]/5" 
            : "border-[#4edea3] bg-[#4edea3]/5";
          const textStyle = alerta.tipo === "liquidez" || alerta.tipo === "presupuesto"
            ? "text-[#ffb4ab]"
            : "text-[#4edea3]";

          return (
            <div 
              key={alerta.id} 
              className={`p-4 rounded-2xl border-l-4 ${borderStyle} flex flex-col sm:flex-row justify-between sm:items-center gap-3 transition-all`}
            >
              <div>
                <p className={`text-xs font-bold ${textStyle} mb-1 tracking-wider`}>
                  {alerta.titulo}
                </p>
                <p className="text-[#dae2fd] text-sm font-medium">
                  {alerta.descripcion}
                </p>
              </div>

              {alerta.btnLabel && (
                <button
                  type="button"
                  onClick={() => handleAction(alerta)}
                  className="cta-gradient text-[#003824] text-xs font-bold py-2 px-4 rounded-full transition-all active:scale-95 cursor-pointer border-none outline-none self-start sm:self-center shrink-0"
                >
                  {alerta.btnLabel}
                </button>
              )}
            </div>
          );
        })}

        {/* Alerta Estática 1 (Diseño de Stich) */}
        <div className="bg-[#222a3d]/45 p-4 rounded-2xl border-l-4 border-[#4edea3]">
          <p className="text-xs font-bold text-[#4edea3] mb-1 tracking-wider">SUSCRIPCIÓN DETECTADA</p>
          <p className="text-[#dae2fd] text-sm font-medium">Se detectó un incremento del 15% en tu factura de Netflix. ¿Deseas revisar los planes?</p>
        </div>

        {/* Alerta Estática 2 (Diseño de Stich) */}
        <div className="bg-[#222a3d]/45 p-4 rounded-2xl border-l-4 border-[#4cd7f6]">
          <p className="text-xs font-bold text-[#4cd7f6] mb-1 tracking-wider">DIVISAS EN ALTA</p>
          <p className="text-[#dae2fd] text-sm font-medium">El par USD/EUR ha alcanzado un punto óptimo para tu portafolio de inversión.</p>
        </div>
      </div>
    </div>
  );
}
