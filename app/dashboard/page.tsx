"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Brain, Compass, User, RefreshCw, Layers, Database } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { GaugesPanel } from "@/components/GaugesPanel";
import { CollapsibleTopes } from "@/components/CollapsibleTopes";
import { InteligenciaAlertas } from "@/components/InteligenciaAlertas";
import { AnalyticsPanel } from "@/components/AnalyticsPanel";
import { MovimientosRecent } from "@/components/MovimientosRecent";
import { SupabaseConnector } from "@/components/SupabaseConnector";
import { IAProactiva } from "@/components/IAProactiva";
import { FloatingChatbot } from "@/components/FloatingChatbot";
import { getSupabaseConfig, getSupabase } from "@/lib/supabase";
import { Transaccion } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

// Movimientos iniciales por defecto (Baseline) para pruebas rápidas
const baselineTransactions: Transaccion[] = [
  // Junio 2026 (Mes Actual)
  {
    id: "tx-nomina-1",
    fecha: "2026-06-01",
    monto: 2500,
    concepto: "Nómina Mensual de Ingeniería",
    tipo: "ingreso",
    categoria: "Salario",
    canal: "Sistema",
  },
  {
    id: "tx-alquiler-2",
    fecha: "2026-06-02",
    monto: -850,
    concepto: "Alquiler Piso Principal",
    tipo: "gasto fijo",
    categoria: "Hogar",
    canal: "Sistema",
  },
  {
    id: "tx-luz-3",
    fecha: "2026-06-03",
    monto: -120,
    concepto: "Suministro Luz + Fibra Wifi",
    tipo: "gasto fijo",
    categoria: "Hogar",
    canal: "Sistema",
  },
  {
    id: "tx-compra-4",
    fecha: "2026-06-04",
    monto: -180,
    concepto: "Supermercado Alimentación",
    tipo: "gasto variable",
    categoria: "Alimentación",
    canal: "Web",
  },
  {
    id: "tx-ahorro-5",
    fecha: "2026-06-05",
    monto: 300,
    concepto: "Traspaso Colchón de Emergencias",
    tipo: "ahorro",
    categoria: "Ahorro",
    canal: "Sistema",
  },
  {
    id: "tx-invertir-6",
    fecha: "2026-06-06",
    monto: 400,
    concepto: "Inversión ETF MSCI World Acc",
    tipo: "inversión",
    categoria: "Inversión",
    canal: "Telegram",
  },
  // Mayo 2026 (Mes Anterior - Comparativa)
  {
    id: "tx-nomina-may",
    fecha: "2026-05-01",
    monto: 2500,
    concepto: "Nómina Mensual de Ingeniería",
    tipo: "ingreso",
    categoria: "Salario",
    canal: "Sistema",
  },
  {
    id: "tx-alquiler-may",
    fecha: "2026-05-02",
    monto: -850,
    concepto: "Alquiler Piso Principal",
    tipo: "gasto fijo",
    categoria: "Hogar",
    canal: "Sistema",
  },
  {
    id: "tx-luz-may",
    fecha: "2026-05-03",
    monto: -110,
    concepto: "Suministro Luz Wifi (Mayo)",
    tipo: "gasto fijo",
    categoria: "Hogar",
    canal: "Sistema",
  },
  {
    id: "tx-compra-may",
    fecha: "2026-05-04",
    monto: -290,
    concepto: "Supermercado y Compras Mayo",
    tipo: "gasto variable",
    categoria: "Alimentación",
    canal: "Web",
  },
  {
    id: "tx-ahorro-may",
    fecha: "2026-05-05",
    monto: 150,
    concepto: "Traspaso Hucha Ahorro (Mayo)",
    tipo: "ahorro",
    categoria: "Ahorro",
    canal: "Sistema",
  },
  {
    id: "tx-invertir-may",
    fecha: "2026-05-06",
    monto: 250,
    concepto: "Aporte ETF MSCI (Mayo)",
    tipo: "inversión",
    categoria: "Inversión",
    canal: "Telegram",
  },
];

export default function Home() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [loading, setLoading] = useState(true);

  const [topeFijo, setTopeFijo] = useState<number>(1200);
  const [topeVariable, setTopeVariable] = useState<number>(600);
  const [supabaseConnected, setSupabaseConnected] = useState(false);
  const [showConnector, setShowConnector] = useState(false);

  // Form modal states
  const [modalMonto, setModalMonto] = useState("");
  const [modalConcepto, setModalConcepto] = useState("");
  const [modalTipo, setModalTipo] = useState<Transaccion["tipo"]>("gasto variable");
  const [modalCategoria, setModalCategoria] = useState("Ocio");
  const [showAddModal, setShowAddModal] = useState(false);

  // Search query state
  const [searchQuery, setSearchQuery] = useState("");

  const handleModalTipoChange = (newTipo: Transaccion["tipo"]) => {
    setModalTipo(newTipo);
    if (newTipo === "ingreso") setModalCategoria("Salario");
    else if (newTipo === "gasto fijo") setModalCategoria("Hogar");
    else if (newTipo === "gasto variable") setModalCategoria("Ocio");
    else if (newTipo === "ahorro") setModalCategoria("Ahorro");
    else if (newTipo === "inversión") setModalCategoria("Inversión");
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedMonto = parseFloat(modalMonto);
    if (isNaN(parsedMonto) || parsedMonto <= 0) {
      alert("Por favor, introduce un importe numérico válido mayor a 0.");
      return;
    }
    if (!modalConcepto.trim()) {
      alert("Por favor, introduce un concepto descriptivo.");
      return;
    }

    const finalMonto = (modalTipo === "gasto fijo" || modalTipo === "gasto variable")
      ? -Math.abs(parsedMonto)
      : Math.abs(parsedMonto);

    await handleAddTransaccion({
      monto: finalMonto,
      concepto: modalConcepto.trim(),
      tipo: modalTipo,
      categoria: modalCategoria,
      canal: "Web"
    });

    setModalMonto("");
    setModalConcepto("");
    setShowAddModal(false);
  };

  // 1. Verificar sesión de usuario, cargar datos y suscribirse a Supabase Realtime
  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;
    let channel: any = null;

    const checkUserAndSubscribe = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!isMounted) return;
      if (error || !user) {
        window.location.href = "/auth/login";
        return;
      }
      setCurrentUser(user);
      setSupabaseConnected(true);

      const savedTopeFijo = localStorage.getItem("billeteria_tope_fijo");
      if (savedTopeFijo) setTopeFijo(Number(savedTopeFijo));

      const savedTopeVariable = localStorage.getItem("billeteria_tope_variable");
      if (savedTopeVariable) setTopeVariable(Number(savedTopeVariable));

      try {
        let query = supabase.from("transacciones").select("*");
        
        // Si es Álvaro, cargar sus transacciones o las que no tengan user_id (Telegram)
        if (user.email === "alvaroortegagimenez@gmail.com") {
          query = query.or(`user_id.eq.${user.id},user_id.is.null`);
        } else {
          query = query.eq("user_id", user.id);
        }

        const { data, error: fetchError } = await query.order("fecha", { ascending: false });

        if (!isMounted) return;

        if (fetchError) {
          console.error("Error al cargar transacciones de Supabase:", fetchError.message);
        } else if (data) {
          const normalized = data.map((t: any) => ({
            ...t,
            monto: Number(t.monto)
          }));
          setTransacciones(normalized);
        }
      } catch (err) {
        console.error("Excepción en la carga de Supabase:", err);
      } finally {
        if (isMounted) setLoading(false);
      }

      // Suscripción Realtime a cambios en la tabla 'transacciones'
      // Usamos un ID único para el canal para evitar colisiones en Strict Mode
      const channelId = `realtime-billeteria-${user.id}-${Math.random().toString(36).substring(2, 9)}`;
      channel = supabase
        .channel(channelId)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "transacciones" },
          (payload: any) => {
            if (!isMounted) return;
            const targetUserId = payload.new?.user_id || payload.old?.user_id;
            const isAlvaro = user.email === "alvaroortegagimenez@gmail.com";
            
            // Acceso: Álvaro ve propios + nulos; otros solo propios
            const hasAccess = isAlvaro
              ? (!targetUserId || targetUserId === user.id)
              : (targetUserId === user.id);

            if (!hasAccess) return;

            if (payload.eventType === "INSERT") {
              const inserted: Transaccion = {
                ...payload.new,
                monto: Number(payload.new.monto)
              };
              setTransacciones((prev) => {
                if (prev.some((t) => t.id === inserted.id)) return prev;
                return [inserted, ...prev];
              });
            } else if (payload.eventType === "DELETE") {
              const deletedId = payload.old.id;
              setTransacciones((prev) => prev.filter((t) => t.id !== deletedId));
            } else if (payload.eventType === "UPDATE") {
              const updated: Transaccion = {
                ...payload.new,
                monto: Number(payload.new.monto)
              };
              setTransacciones((prev) =>
                prev.map((t) => (t.id === updated.id ? updated : t))
              );
            }
          }
        )
        .subscribe();
    };

    checkUserAndSubscribe();

    return () => {
      isMounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  // 2. Guardar cambios de límites locales
  useEffect(() => {
    localStorage.setItem("billeteria_tope_fijo", String(topeFijo));
  }, [topeFijo]);

  useEffect(() => {
    localStorage.setItem("billeteria_tope_variable", String(topeVariable));
  }, [topeVariable]);

  // 3. Motores de Cálculo Patrimonial
  const totalIngresos = transacciones
    .filter((t) => t.tipo === "ingreso")
    .reduce((sum, t) => sum + t.monto, 0);

  const totalGastosFijos = transacciones
    .filter((t) => t.tipo === "gasto fijo")
    .reduce((sum, t) => sum + t.monto, 0);

  const totalGastosVariables = transacciones
    .filter((t) => t.tipo === "gasto variable")
    .reduce((sum, t) => sum + t.monto, 0);

  const totalAhorros = transacciones
    .filter((t) => t.tipo === "ahorro")
    .reduce((sum, t) => sum + t.monto, 0);

  const totalInversiones = transacciones
    .filter((t) => t.tipo === "inversión")
    .reduce((sum, t) => sum + t.monto, 0);

  const dineroLiquido = totalIngresos + (totalGastosFijos + totalGastosVariables) - (totalAhorros + totalInversiones);
  const patrimonioTotal = dineroLiquido + totalAhorros + totalInversiones;

  // 4. Manejadores de Eventos
  const handleAddTransaccion = async (newTx: Omit<Transaccion, "id" | "fecha">) => {
    if (!currentUser) return;
    const fresh: any = {
      ...newTx,
      id: "tx-" + Date.now() + "-" + Math.floor(Math.random() * 100),
      fecha: new Date().toISOString().split("T")[0],
      user_id: currentUser.id
    };

    const supabase = createClient();
    try {
      const { error } = await supabase
        .from("transacciones")
        .insert([fresh]);
      if (error) {
        console.error("Error al escribir en Supabase, guardando en local:", error);
        setTransacciones((prev) => [fresh, ...prev]);
      }
    } catch (err) {
      console.error("Problema de red con Supabase, guardando en local:", err);
      setTransacciones((prev) => [fresh, ...prev]);
    }
  };

  const handleDeleteTransaccion = async (id: string) => {
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from("transacciones")
        .delete()
        .eq("id", id);
      if (error) {
        console.error("Error al borrar en Supabase:", error);
        setTransacciones((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (err) {
      console.error("Error de red al borrar en Supabase:", err);
      setTransacciones((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const handleResetToBaseline = async () => {
    const supabase = createClient();
    if (supabase && currentUser) {
      const confirmAction = window.confirm("¿Deseas restaurar la base de datos de Supabase con los movimientos baseline por defecto para tu usuario?");
      if (!confirmAction) return;

      try {
        // Borrar registros existentes del usuario (y nulos si es Álvaro)
        let deleteQuery = supabase.from("transacciones").delete();
        if (currentUser.email === "alvaroortegagimenez@gmail.com") {
          deleteQuery = deleteQuery.or(`user_id.eq.${currentUser.id},user_id.is.null`);
        } else {
          deleteQuery = deleteQuery.eq("user_id", currentUser.id);
        }
        await deleteQuery;
        
        // Insertar los baseline con su user_id
        const baselineWithUser = baselineTransactions.map(t => ({
          ...t,
          user_id: currentUser.id
        }));

        const { error } = await supabase
          .from("transacciones")
          .insert(baselineWithUser);

        if (error) {
          alert(`Error al resetear en Supabase: ${error.message}`);
        } else {
          setTransacciones(baselineWithUser);
        }
      } catch (err) {
        console.error("Excepción en el reset a baseline:", err);
      }
    }
  };

  const handleSupabaseSync = (refreshed: Transaccion[]) => {
    if (refreshed && refreshed.length > 0) {
      setTransacciones(refreshed);
      setSupabaseConnected(true);
    } else {
      setSupabaseConnected(false);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-mono">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
          <span>Iniciando BilleterIA...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1326] text-[#dae2fd] flex flex-col font-sans selection:bg-[#4edea3]/20 selection:text-[#4edea3]" id="applet-viewport-root">
      
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-[#131b2e]/60 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] flex justify-between items-center px-6 md:px-12 py-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-headline-md text-headline-md font-extrabold text-[#4edea3] tracking-tighter hover:opacity-80 transition-opacity">BilleterIA</Link>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="text-[#4edea3] font-bold font-label-md text-label-md transition-all duration-200 cursor-pointer bg-transparent border-none outline-none">Dashboard</button>
          <button onClick={() => document.getElementById("interes-calculadora-panel")?.scrollIntoView({ behavior: "smooth" })} className="text-[#bbcabf] hover:text-[#4edea3] transition-colors duration-300 font-label-md text-label-md cursor-pointer bg-transparent border-none outline-none">Analytics</button>
          <button onClick={() => document.getElementById("collapsible-topes-container")?.scrollIntoView({ behavior: "smooth" })} className="text-[#bbcabf] hover:text-[#4edea3] transition-colors duration-300 font-label-md text-label-md cursor-pointer bg-transparent border-none outline-none">Budgets</button>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowConnector(!showConnector)}
            className={`material-symbols-outlined relative transition-all active:scale-95 cursor-pointer bg-transparent border-none outline-none ${
              supabaseConnected ? "text-[#4edea3]" : "text-[#bbcabf] hover:text-[#4edea3]"
            }`}
            title={supabaseConnected ? "Supabase Online" : "Supabase Desconectado - Configurar"}
          >
            database
            {supabaseConnected && (
              <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse" />
            )}
          </button>
          <button onClick={() => document.getElementById("ia-proactiva-panel")?.scrollIntoView({ behavior: "smooth" })} className="material-symbols-outlined text-[#bbcabf] hover:text-[#4edea3] transition-all active:scale-95 cursor-pointer bg-transparent border-none outline-none">notifications</button>
          <button onClick={() => setShowConnector(!showConnector)} className="material-symbols-outlined text-[#bbcabf] hover:text-[#4edea3] transition-all active:scale-95 cursor-pointer bg-transparent border-none outline-none">settings</button>
          <div className="flex items-center gap-2.5">
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-xs text-white font-medium font-sans">
                {currentUser?.email === "alvaroortegagimenez@gmail.com" ? "Álvaro Ortega" : (currentUser?.email?.split('@')[0] || "Usuario")}
              </span>
              <span className="text-[9px] text-[#bbcabf] font-mono">{currentUser?.email}</span>
            </div>
            <div className="w-10 h-10 rounded-full overflow-hidden border border-[#4edea3]/20 p-0.5">
              <img alt="User Profile" className="w-full h-full object-cover rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3DGAD9Iik_89igSf_o3_6ygfJUWZKRSiDSxV98nnNWBouDDzuSOzZBVwonDTFv0DbMbNj_K-fEYImg4aCaAPRFQ0kxhQy_udDq8l-QKTL-anLma7oYuB9Y2K_F2krwV4cLjD8KzTZ6xCzz5o99tLIr2sGEqaCtrDH05WWxmn29AYKpgFQOHGx2R2nyCDjoOoBS4IiTaETK1_tvvyRtg7LWtAJmmi51-UHmbOdB6hOoVMrLejpw3seBrBcKlWIPPle4EDjDyYCbypD"/>
            </div>
          </div>
        </div>
      </nav>

      {/* SideNav */}
      <aside className="fixed left-0 h-full w-64 z-40 bg-[#0b1326]/40 backdrop-blur-2xl border-r border-violet-500/20 shadow-2xl hidden md:flex flex-col py-8 pt-24">
        <div className="px-6 mb-8">
          <h3 className="text-[#4edea3] font-bold text-xs uppercase tracking-widest opacity-60">Engine</h3>
        </div>
        <div className="flex-1 space-y-2 px-3">
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#4edea3] bg-[#4edea3]/10 border-r-2 border-[#4edea3] transition-all text-left cursor-pointer border-none outline-none">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-semibold text-label-md">Dashboard</span>
          </button>
          <button onClick={() => document.getElementById("interes-calculadora-panel")?.scrollIntoView({ behavior: "smooth" })} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#bbcabf]/70 hover:bg-white/5 hover:text-white transition-all text-left cursor-pointer border-none outline-none">
            <span className="material-symbols-outlined">leaderboard</span>
            <span className="font-medium text-label-md">Analytics</span>
          </button>
          <button onClick={() => document.getElementById("collapsible-topes-container")?.scrollIntoView({ behavior: "smooth" })} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#bbcabf]/70 hover:bg-white/5 hover:text-white transition-all text-left cursor-pointer border-none outline-none">
            <span className="material-symbols-outlined">account_balance_wallet</span>
            <span className="font-medium text-label-md">Budgets</span>
          </button>
          <button onClick={() => document.getElementById("movimientos-main-container")?.scrollIntoView({ behavior: "smooth" })} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#bbcabf]/70 hover:bg-white/5 hover:text-white transition-all text-left cursor-pointer border-none outline-none">
            <span className="material-symbols-outlined">receipt_long</span>
            <span className="font-medium text-label-md">Transactions</span>
          </button>
          <button onClick={() => document.getElementById("ia-proactiva-panel")?.scrollIntoView({ behavior: "smooth" })} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#bbcabf]/70 hover:bg-white/5 hover:text-white transition-all text-left cursor-pointer border-none outline-none">
            <span className="material-symbols-outlined">psychology</span>
            <span className="font-medium text-label-md">AI Insights</span>
          </button>
        </div>
        <div className="px-6 mt-auto">
          <Link href="/pricing" className="w-full bg-[#571bc1]/30 border border-[#d0bcff]/50 hover:bg-[#571bc1]/50 text-[#d0bcff] font-bold py-3 rounded-xl transition-all active:scale-95 text-sm mb-6 cursor-pointer outline-none block text-center no-underline">
            Upgrade to Pro
          </Link>
          <div className="space-y-1 mb-8">
            <button onClick={handleResetToBaseline} className="w-full flex items-center gap-3 px-4 py-2 text-[#bbcabf]/70 hover:text-white text-label-sm text-left cursor-pointer bg-transparent border-none outline-none">
              <span className="material-symbols-outlined text-sm">settings_backup_restore</span>
              Restaurar Baseline
            </button>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-[#bbcabf]/70 hover:text-error text-label-sm text-left cursor-pointer bg-transparent border-none outline-none">
              <span className="material-symbols-outlined text-sm">logout</span>
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:pl-64 pt-24 min-h-screen px-4 md:px-8 pb-24 flex flex-col gap-8">
        
        {/* Telegram IA Ingest Panel (Prominent) */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1b2640] via-[#132d46] to-[#0f3c5f] border border-emerald-500/30 p-6 sm:p-8 shadow-[0_0_50px_rgba(78,222,163,0.15)] flex flex-col md:flex-row items-center justify-between gap-6 hover:border-emerald-500/50 transition-all duration-300 group">
          {/* Glowing background light */}
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-[80px] group-hover:bg-emerald-500/15 transition-all duration-500 pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-blue-500/10 blur-[80px] group-hover:bg-blue-500/15 transition-all duration-500 pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-center gap-5 z-10 text-center sm:text-left">
            <div className="w-16 h-16 rounded-2xl bg-[#2481cc]/15 border border-[#2481cc]/30 flex items-center justify-center text-[#2481cc] shadow-inner shrink-0 animate-pulse">
              <svg className="w-9 h-9 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-1-.65-.35-1 .22-1.6.15-.15 2.7-2.48 2.75-2.7.01-.03.01-.15-.06-.21-.07-.06-.17-.04-.25-.02-.11.02-1.78 1.14-5.06 3.35-.48.33-.91.49-1.3.48-.43-.01-1.25-.24-1.86-.44-.75-.24-1.35-.37-1.3-.78.03-.22.33-.44.9-.68 3.5-1.52 5.84-2.52 7.02-3 .33-.14.65-.24.96-.24.23 0 .74.12 1.1.38.3.21.5.55.45.89z" />
              </svg>
            </div>
            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">Añadir Movimiento</h2>
                <span className="px-2 py-0.5 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-mono font-bold animate-pulse">
                  Telegram IA
                </span>
              </div>
              <p className="text-sm text-[#bbcabf] mt-1 max-w-xl">
                Dicta una nota de voz o escribe un mensaje rápido a tu bot <strong className="text-[#4edea3]">@BilleterIA2_bot</strong>. La IA procesará, analizará y registrará el movimiento automáticamente.
              </p>
              <div className="flex justify-center sm:justify-start gap-4 mt-2 text-xs text-[#bbcabf]/70 font-mono">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-emerald-400">mic</span> Notas de voz
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-emerald-400">chat</span> Texto natural
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-emerald-400">bolt</span> Sincronizado
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 z-10 shrink-0 w-full sm:w-auto">
            {/* The main "+" button linking to Telegram */}
            <a 
              href="https://t.me/BilleterIA2_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none cta-gradient hover:shadow-[0_0_30px_rgba(78,222,163,0.4)] text-[#003824] font-extrabold text-md px-8 py-4 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all duration-200 cursor-pointer no-underline group/btn border-none"
            >
              <span className="material-symbols-outlined text-2xl font-bold group-hover/btn:rotate-90 transition-transform duration-300">add</span>
              <span>Abrir Telegram</span>
            </a>

            {/* Secondary Action: Add manually */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex-1 sm:flex-none bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-[#bbcabf] hover:text-white font-semibold text-sm px-6 py-4 rounded-2xl transition-all cursor-pointer outline-none"
            >
              Registrar manualmente
            </button>
          </div>
        </div>

        {/* Gauges Section */}
        <GaugesPanel
          dineroLiquido={dineroLiquido}
          totalAhorros={totalAhorros}
          totalInversiones={totalInversiones}
          totalIngresos={totalIngresos}
          patrimonioTotal={patrimonioTotal}
        />

        {/* Conector Dinámico de Supabase */}
        {showConnector && (
          <div className="animate-fadeIn">
            <SupabaseConnector
              onSyncComplete={handleSupabaseSync}
              localTransacciones={transacciones}
            />
          </div>
        )}

        {/* AI Section / Alertas */}
        <InteligenciaAlertas
          topeVariable={topeVariable}
          setTopeVariable={setTopeVariable}
          dineroLiquido={dineroLiquido}
          totalGastosVariables={totalGastosVariables}
          transacciones={transacciones}
          onAddTransaccion={handleAddTransaccion}
        />

        {/* Analytics Section */}
        <AnalyticsPanel
          transacciones={transacciones}
          totalAhorros={totalAhorros}
          totalInversiones={totalInversiones}
        />

        {/* IA Proactiva */}
        <IAProactiva 
          transacciones={transacciones}
          dineroLiquido={dineroLiquido}
          totalAhorros={totalAhorros}
          totalInversiones={totalInversiones}
          totalGastosFijos={totalGastosFijos}
          totalGastosVariables={totalGastosVariables}
          topeFijo={topeFijo}
          topeVariable={topeVariable}
        />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Budgets Section */}
          <div className="xl:col-span-1" id="collapsible-topes-container">
            <CollapsibleTopes
              topeFijo={topeFijo}
              setTopeFijo={setTopeFijo}
              topeVariable={topeVariable}
              setTopeVariable={setTopeVariable}
              totalGastosFijos={totalGastosFijos}
              totalGastosVariables={totalGastosVariables}
            />
          </div>

          {/* Transactions Section */}
          <div className="xl:col-span-2">
            <MovimientosRecent
              transacciones={transacciones}
              onAddTransaccion={handleAddTransaccion}
              onDeleteTransaccion={handleDeleteTransaccion}
              onResetToBaseline={handleResetToBaseline}
              searchQuery={searchQuery}
              onAddClick={() => setShowAddModal(true)}
            />
          </div>
        </div>
      </main>

      {/* Bottom Nav for Mobile */}
      <nav className="md:hidden fixed bottom-0 w-full bg-[#131b2e]/80 backdrop-blur-xl border-t border-white/5 flex justify-around items-center py-4 z-50">
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex flex-col items-center gap-1 text-[#4edea3] bg-transparent border-none outline-none">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[10px] font-bold">Dashboard</span>
        </button>
        <button onClick={() => document.getElementById("interes-calculadora-panel")?.scrollIntoView({ behavior: "smooth" })} className="flex flex-col items-center gap-1 text-[#bbcabf] bg-transparent border-none outline-none">
          <span className="material-symbols-outlined">leaderboard</span>
          <span className="text-[10px] font-bold">Analytics</span>
        </button>
        <div 
          onClick={() => setShowAddModal(true)}
          className="-mt-12 cta-gradient w-14 h-14 rounded-full flex items-center justify-center border-4 border-[#0b1326] active:scale-95 transition-transform cursor-pointer"
        >
          <span className="material-symbols-outlined text-white font-bold">add</span>
        </div>
        <button onClick={() => document.getElementById("collapsible-topes-container")?.scrollIntoView({ behavior: "smooth" })} className="flex flex-col items-center gap-1 text-[#bbcabf] bg-transparent border-none outline-none">
          <span className="material-symbols-outlined">account_balance_wallet</span>
          <span className="text-[10px] font-bold">Budgets</span>
        </button>
        <button onClick={() => document.getElementById("ia-proactiva-panel")?.scrollIntoView({ behavior: "smooth" })} className="flex flex-col items-center gap-1 text-[#bbcabf] bg-transparent border-none outline-none">
          <span className="material-symbols-outlined">psychology</span>
          <span className="text-[10px] font-bold">AI</span>
        </button>
      </nav>

      {/* Modal Añadir Gasto */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-4 py-6">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 relative overflow-hidden animate-fadeIn">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-[#bbcabf] hover:text-[#4edea3] transition-colors material-symbols-outlined cursor-pointer bg-transparent border-none outline-none"
            >
              close
            </button>
            
            <div className="mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4edea3]">add_circle</span>
              <h3 className="font-headline-md text-headline-md text-white font-bold">Añadir Movimiento</h3>
            </div>

            <form onSubmit={handleModalSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] text-[#bbcabf] font-mono mb-1 uppercase tracking-wider">Monto (€)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={modalMonto}
                  onChange={(e) => setModalMonto(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#060e20]/60 border border-white/10 focus:border-[#4edea3] focus:ring-1 focus:ring-[#4edea3] rounded-xl py-2.5 px-4 text-sm text-[#dae2fd] placeholder:text-slate-600 font-mono font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#bbcabf] font-mono mb-1 uppercase tracking-wider">Concepto</label>
                <input
                  type="text"
                  required
                  value={modalConcepto}
                  onChange={(e) => setModalConcepto(e.target.value)}
                  placeholder="Nómina, Compra súper, Taxi, ETF..."
                  className="w-full bg-[#060e20]/60 border border-white/10 focus:border-[#4edea3] focus:ring-1 focus:ring-[#4edea3] rounded-xl py-2.5 px-4 text-sm text-[#dae2fd] placeholder:text-slate-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#bbcabf] font-mono mb-1 uppercase tracking-wider">Tipo de Movimiento</label>
                <select
                  value={modalTipo}
                  onChange={(e) => handleModalTipoChange(e.target.value as Transaccion["tipo"])}
                  className="w-full bg-[#060e20]/60 border border-white/10 focus:border-[#4edea3] focus:ring-1 focus:ring-[#4edea3] rounded-xl py-2.5 px-4 text-sm text-[#dae2fd] cursor-pointer outline-none"
                >
                  <option value="ingreso" className="bg-[#131b2e]">Ingreso</option>
                  <option value="gasto fijo" className="bg-[#131b2e]">Gasto Fijo</option>
                  <option value="gasto variable" className="bg-[#131b2e]">Gasto Variable</option>
                  <option value="ahorro" className="bg-[#131b2e]">Ahorro</option>
                  <option value="inversión" className="bg-[#131b2e]">Inversión</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-[#bbcabf] font-mono mb-1 uppercase tracking-wider">Categoría</label>
                <input
                  type="text"
                  required
                  value={modalCategoria}
                  onChange={(e) => setModalCategoria(e.target.value)}
                  placeholder="Ocio, Salario, Hogar, Inversión..."
                  className="w-full bg-[#060e20]/60 border border-white/10 focus:border-[#4edea3] focus:ring-1 focus:ring-[#4edea3] rounded-xl py-2.5 px-4 text-sm text-[#dae2fd] outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full cta-gradient text-[#003824] font-bold text-sm py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-2 border-none outline-none"
              >
                <span className="material-symbols-outlined">add_circle</span> Registrar Movimiento
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating AI Chatbot */}
      <FloatingChatbot
        transacciones={transacciones}
        dineroLiquido={dineroLiquido}
        totalAhorros={totalAhorros}
        totalInversiones={totalInversiones}
        totalGastosFijos={totalGastosFijos}
        totalGastosVariables={totalGastosVariables}
        topeFijo={topeFijo}
        topeVariable={topeVariable}
        onAddTransaccion={handleAddTransaccion}
      />
    </div>
  );
}
