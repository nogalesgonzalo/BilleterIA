"use client";

import React, { useState } from "react";
import { Transaccion } from "../lib/types";

interface MovimientosRecentProps {
  transacciones: Transaccion[];
  onAddTransaccion: (tx: Omit<Transaccion, "id" | "fecha">) => void;
  onDeleteTransaccion: (id: string) => void;
  onResetToBaseline: () => void;
  searchQuery?: string;
  onAddClick?: () => void;
}

export function MovimientosRecent({
  transacciones,
  onAddTransaccion,
  onDeleteTransaccion,
  onResetToBaseline,
  searchQuery = "",
  onAddClick
}: MovimientosRecentProps) {
  
  const [filter, setFilter] = useState<"Todos" | "Gastos" | "Ingresos">("Todos");

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR"
    }).format(val);
  };

  const getCategoryIcon = (categoria: string, tipo: string) => {
    const cat = categoria.toLowerCase();
    if (cat.includes("salario") || cat.includes("nomina") || cat.includes("sueldo") || cat.includes("freelance") || cat.includes("trabajo")) {
      return "work";
    }
    if (cat.includes("comida") || cat.includes("restaurante") || cat.includes("cafe") || cat.includes("starbucks") || cat.includes("supermercado") || cat.includes("alimentacion") || cat.includes("ocio")) {
      return "restaurant";
    }
    if (cat.includes("ocio") || cat.includes("electronica") || cat.includes("apple") || cat.includes("compra") || cat.includes("shopping") || cat.includes("tienda")) {
      return "shopping_cart";
    }
    if (cat.includes("servicio") || cat.includes("netflix") || cat.includes("suscripcion") || cat.includes("luz") || cat.includes("wifi") || cat.includes("internet") || cat.includes("agua")) {
      return "subscriptions";
    }
    if (cat.includes("hogar") || cat.includes("alquiler") || cat.includes("piso")) {
      return "home";
    }
    if (cat.includes("ahorro")) {
      return "savings";
    }
    if (cat.includes("inversión") || cat.includes("inversion") || cat.includes("etf") || cat.includes("msci") || cat.includes("acciones")) {
      return "account_balance";
    }
    return tipo === "ingreso" ? "arrow_upward" : "arrow_downward";
  };

  const getIconStyle = (iconName: string) => {
    switch (iconName) {
      case "work":
        return "bg-[#4cd7f6]/10 text-[#4cd7f6] border-[#4cd7f6]/10";
      case "restaurant":
        return "bg-[#d0bcff]/10 text-[#d0bcff] border-[#d0bcff]/10";
      case "shopping_cart":
      case "subscriptions":
      default:
        return "bg-[#4edea3]/10 text-[#4edea3] border-[#4edea3]/10";
    }
  };

  // Filtrado de transacciones
  const filteredTransactions = transacciones.filter((t) => {
    // 1. Tipo
    if (filter === "Gastos" && t.tipo !== "gasto fijo" && t.tipo !== "gasto variable") return false;
    if (filter === "Ingresos" && t.tipo !== "ingreso" && t.tipo !== "ahorro" && t.tipo !== "inversión") return false;
    
    // 2. Búsqueda
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchConcepto = t.concepto.toLowerCase().includes(q);
      const matchCategoria = t.categoria.toLowerCase().includes(q);
      return matchConcepto || matchCategoria;
    }
    
    return true;
  });

  return (
    <section className="xl:col-span-3 mb-stack-lg animate-fadeIn" id="movimientos-main-container">
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-headline-md text-headline-md text-white font-bold">Movimientos Recientes</h3>
          <p className="text-xs text-[#bbcabf]/60 mt-0.5">Historial dinámico y control del flujo de caja</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-1 bg-[#222a3d]/50 p-1 rounded-full">
            <button 
              onClick={() => setFilter("Todos")}
              className={`px-4 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border-none outline-none ${
                filter === "Todos" ? "bg-[#4edea3]/20 text-[#4edea3]" : "text-[#bbcabf] hover:text-[#4edea3]"
              }`}
            >
              Todos
            </button>
            <button 
              onClick={() => setFilter("Gastos")}
              className={`px-4 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border-none outline-none ${
                filter === "Gastos" ? "bg-[#4edea3]/20 text-[#4edea3]" : "text-[#bbcabf] hover:text-[#4edea3]"
              }`}
            >
              Gastos
            </button>
            <button 
              onClick={() => setFilter("Ingresos")}
              className={`px-4 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border-none outline-none ${
                filter === "Ingresos" ? "bg-[#4edea3]/20 text-[#4edea3]" : "text-[#bbcabf] hover:text-[#4edea3]"
              }`}
            >
              Ingresos
            </button>
          </div>
          
          <button 
            onClick={onAddClick}
            className="cta-gradient hidden md:flex items-center gap-2 px-6 py-2.5 rounded-full text-[#003824] font-bold text-sm transition-all active:scale-95 cursor-pointer border-none outline-none"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            Añadir Gasto
          </button>
        </div>
      </div>

      {/* Contenido / Listado */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
        {/* Mobile Only CTA */}
        <button 
          onClick={onAddClick}
          className="md:hidden w-full cta-gradient flex items-center justify-center gap-2 py-4 rounded-2xl text-[#003824] font-bold text-sm mb-4 cursor-pointer border-none outline-none"
        >
          <span className="material-symbols-outlined">add_circle</span>
          Añadir Gasto
        </button>

        {filteredTransactions.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl text-center text-[#bbcabf]/60 text-xs">
            No se encontraron movimientos registrados en este filtro.
          </div>
        ) : (
          filteredTransactions.map((t) => {
            const isGasto = t.monto < 0;
            const iconName = getCategoryIcon(t.categoria, t.tipo);
            const iconStyle = getIconStyle(iconName);

            return (
              <div 
                key={t.id} 
                className="glass-panel p-4 rounded-2xl flex items-center justify-between hover:translate-x-2 transition-transform cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${iconStyle}`}>
                    <span className="material-symbols-outlined">{iconName}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="text-white font-bold text-sm sm:text-md">{t.concepto}</h5>
                      <span className="text-[9px] bg-[#222a3d]/50 text-[#bbcabf] px-1.5 py-0.5 rounded font-mono">
                        {t.canal}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-[#bbcabf]/60 mt-0.5">
                      {t.fecha} • {t.categoria}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={`font-bold text-sm sm:text-md ${isGasto ? "text-white" : "text-[#4edea3]"}`}>
                      {isGasto ? "" : "+"}{formatCurrency(t.monto)}
                    </p>
                    <span className={`inline-block w-2 h-2 rounded-full ml-2 ${
                      isGasto ? "bg-[#ffb4ab]" : "bg-[#4edea3] shadow-[0_0_8px_#4edea3]"
                    }`}></span>
                  </div>

                  {/* Botón borrar */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm("¿Seguro que deseas eliminar este movimiento?")) {
                        onDeleteTransaccion(t.id);
                      }
                    }}
                    className="text-[#bbcabf]/40 hover:text-[#ffb4ab] p-1.5 rounded-lg hover:bg-white/5 transition-all opacity-0 group-hover:opacity-100 cursor-pointer bg-transparent border-none outline-none"
                    title="Eliminar transacción"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex justify-end mt-4">
        <button
          onClick={onResetToBaseline}
          className="text-[10px] font-mono text-[#bbcabf]/50 hover:text-white border border-[#222a3d] hover:bg-white/5 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer bg-transparent"
        >
          <span className="material-symbols-outlined text-xs">settings_backup_restore</span> Restaurar Datos Baseline
        </button>
      </div>
    </section>
  );
}
