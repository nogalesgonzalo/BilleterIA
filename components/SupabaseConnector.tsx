"use client";

import React, { useState, useEffect } from "react";
import { getSupabaseConfig, getSupabase } from "../lib/supabase";
import { Database, CheckCircle, XCircle, RefreshCw, Key, Link2, Copy, FileText, ChevronRight, HelpCircle } from "lucide-react";
import { Transaccion } from "../lib/types";

interface SupabaseConnectorProps {
  onSyncComplete?: (newTransacciones: Transaccion[]) => void;
  localTransacciones: Transaccion[];
}

export function SupabaseConnector({ onSyncComplete, localTransacciones }: SupabaseConnectorProps) {
  const [config, setConfig] = useState(getSupabaseConfig());
  const [urlInput, setUrlInput] = useState(config.url);
  const [keyInput, setKeyInput] = useState(config.key);
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [showSqlGuide, setShowSqlGuide] = useState(false);
  const [showTelegramGuide, setShowTelegramGuide] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCopied, setIsCopied] = useState<string | null>(null);

  // Probar la conexión al montar o cuando la configuración sea válida
  useEffect(() => {
    if (config.isConfigured) {
      const runAutoTest = async () => {
        setTestStatus("testing");
        const supabase = getSupabase();
        if (!supabase) {
          setTestStatus("error");
          setErrorMessage("No se pudo iniciar el cliente de Supabase.");
          return;
        }
        try {
          const { error } = await supabase
            .from("transacciones")
            .select("id")
            .limit(1);

          if (error) {
            if (error.code === "PGRST116" || error.message.includes("does not exist")) {
              setTestStatus("error");
              setErrorMessage(`Conexión establecida, pero la tabla 'transacciones' no existe en tu base de datos.`);
            } else {
              setTestStatus("error");
              setErrorMessage(`Falló la consulta SQL: ${error.message}`);
            }
          } else {
            setTestStatus("success");
          }
        } catch (err: any) {
          setTestStatus("error");
          setErrorMessage(`Error de red o CORS: ${err.message || err}`);
        }
      };
      runAutoTest();
    } else {
      setTestStatus("idle");
    }
  }, [config.isConfigured]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(id);
    setTimeout(() => setIsCopied(null), 2000);
  };

  const handleSaveAndTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestStatus("testing");
    setErrorMessage("");

    const trimmedUrl = urlInput.trim();
    const trimmedKey = keyInput.trim();

    if (!trimmedUrl || !trimmedKey) {
      setTestStatus("error");
      setErrorMessage("Por favor, introduce una URL y una clave válidas.");
      return;
    }

    localStorage.setItem("billeteria_supabase_url", trimmedUrl);
    localStorage.setItem("billeteria_supabase_anon_key", trimmedKey);
    
    const newConfig = getSupabaseConfig();
    setConfig(newConfig);

    // Esperar un momento a que se propague el cambio en el cliente diferido
    setTimeout(async () => {
      const supabase = getSupabase();
      if (!supabase) {
        setTestStatus("error");
        setErrorMessage("No se pudo iniciar el cliente de Supabase. Revisa las credenciales.");
        return;
      }

      try {
        const { error } = await supabase
          .from("transacciones")
          .select("id")
          .limit(1);

        if (error) {
          if (error.code === "PGRST116" || error.message.includes("does not exist")) {
            setTestStatus("error");
            setErrorMessage(`Conexión establecida, pero la tabla 'transacciones' no existe en tu base de datos. Ejecuta el script SQL para crearla.`);
          } else {
            setTestStatus("error");
            setErrorMessage(`Falló la consulta SQL: ${error.message}`);
          }
        } else {
          setTestStatus("success");
        }
      } catch (err: any) {
        setTestStatus("error");
        setErrorMessage(`Error de red o CORS: ${err.message || err}`);
      }
    }, 100);
  };

  const handleDisconnect = () => {
    localStorage.removeItem("billeteria_supabase_url");
    localStorage.removeItem("billeteria_supabase_anon_key");
    setUrlInput("");
    setKeyInput("");
    setTestStatus("idle");
    setConfig(getSupabaseConfig());
    if (onSyncComplete) {
      onSyncComplete([]);
    }
  };

  const handlePushLocalToSupabase = async () => {
    const supabase = getSupabase();
    if (!supabase) {
      alert("Configura e inicializa Supabase primero.");
      return;
    }

    setIsSyncing(true);
    try {
      const { data: existing, error: fetchError } = await supabase
        .from("transacciones")
        .select("id");

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      const existingIds = new Set(existing?.map((t: any) => t.id) || []);
      const toInsert = localTransacciones.filter(t => !existingIds.has(t.id));

      if (toInsert.length === 0) {
        alert("Todos los movimientos de la web ya están sincronizados en tu Supabase.");
        setIsSyncing(false);
        return;
      }

      const formatted = toInsert.map(t => ({
        id: t.id,
        fecha: t.fecha,
        monto: Number(t.monto),
        concepto: t.concepto,
        tipo: t.tipo,
        categoria: t.categoria,
        canal: t.canal || "Web"
      }));

      const { error: insertError } = await supabase
        .from("transacciones")
        .insert(formatted);

      if (insertError) {
        throw new Error(insertError.message);
      }

      alert(`¡Sincronización increíble! Se han copiado ${toInsert.length} movimientos nuevos a tu base de datos Supabase.`);
      
      const { data: refreshed, error: reloadError } = await supabase
        .from("transacciones")
        .select("*")
        .order("fecha", { ascending: false });

      if (!reloadError && refreshed && onSyncComplete) {
        onSyncComplete(refreshed);
      }

    } catch (err: any) {
      alert(`Error al sincronizar datos: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const sqlCode = `-- 1. Crea la tabla de movimientos financieros en Supabase SQL Editor
CREATE TABLE IF NOT EXISTS transacciones (
  id TEXT PRIMARY KEY,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  monto NUMERIC NOT NULL,
  concepto TEXT NOT NULL,
  tipo TEXT NOT NULL, -- 'ingreso', 'gasto fijo', 'gasto variable', 'ahorro', 'inversión'
  categoria TEXT NOT NULL,
  canal TEXT NOT NULL DEFAULT 'Web'
);

-- 2. DESACTIVAR RLS (Row Level Security) para permitir lecturas y escrituras públicas
ALTER TABLE transacciones DISABLE ROW LEVEL SECURITY;

-- 3. IMPORTANTE: Conceder todos los permisos a la API pública para evitar "permission denied"
GRANT ALL ON TABLE transacciones TO anon, authenticated, service_role, postgres;

-- 4. Habilita el Realtime en Supabase para actualizaciones instantáneas
ALTER TABLE transacciones REPLICA IDENTITY FULL;
`;

  const makeJsonData = `{
  "id": "tx-{{1.message.message_id}}",
  "fecha": "{{formatDate(now; "YYYY-MM-DD")}}",
  "monto": {{if(21.values.Importe; 21.values.Importe; 0)}},
  "concepto": "{{21.values.Concepto}}",
  "tipo": "{{21.values.Tipo_de_Movimiento}}",
  "categoria": "{{21.values.Categoria}}",
  "canal": "Telegram"
}`;

  return (
    <div className="glass-panel rounded-3xl p-6 flex flex-col gap-6 shadow-xl w-full" id="supabase-connector-panel">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#4edea3]/10 border border-[#4edea3]/20 rounded-xl flex items-center justify-center text-[#4edea3]">
            <span className="material-symbols-outlined text-md animate-pulse">database</span>
          </div>
          <div>
            <h3 className="text-sm font-sans font-semibold text-white tracking-tight flex items-center gap-2">
              Base de Datos Supabase 
              {config.isConfigured ? (
                <span className="text-[10px] bg-[#4edea3]/10 text-[#4edea3] border border-[#4edea3]/20 px-2 py-0.5 rounded-full font-bold">
                  Sincronizado
                </span>
              ) : (
                <span className="text-[10px] bg-[#222a3d]/50 text-[#bbcabf] border border-white/5 px-2 py-0.5 rounded-full">
                  Sin Conectar
                </span>
              )}
            </h3>
            <p className="text-xs text-[#bbcabf]/70 mt-0.5">Sincroniza y actualiza la web con datos del bot de Telegram en tiempo real</p>
          </div>
        </div>
        
        {config.isConfigured && (
          <button 
            type="button"
            onClick={handleDisconnect}
            className="text-xs font-mono text-[#ffb4ab] border border-[#ffb4ab]/20 hover:bg-[#ffb4ab]/10 px-3 py-1.5 rounded-xl transition-all cursor-pointer bg-transparent outline-none"
          >
            Desconectar
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="flex flex-col gap-4">
          <h4 className="text-xs uppercase tracking-wider font-semibold text-[#dae2fd] font-mono flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-[#4edea3]">key</span> Credenciales de Conexión
          </h4>
          
          <form onSubmit={handleSaveAndTest} className="flex flex-col gap-3.5">
            <div>
              <label className="block text-[11px] text-[#bbcabf]/70 font-mono mb-1">SUPABASE URL</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://your-project.supabase.co"
                  disabled={config.source === "env"}
                  className="w-full bg-[#060e20]/60 border border-white/10 focus:border-[#4edea3] focus:ring-1 focus:ring-[#4edea3] rounded-xl py-2.5 pl-3 pr-8 text-xs text-[#dae2fd] placeholder:text-slate-600 disabled:opacity-50 outline-none"
                />
                <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-[#bbcabf]/40 text-sm">link</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-[#bbcabf]/70 font-mono mb-1">SUPABASE ANON KEY</label>
              <div className="relative">
                <input 
                  type="password" 
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  disabled={config.source === "env"}
                  className="w-full bg-[#060e20]/60 border border-white/10 focus:border-[#4edea3] focus:ring-1 focus:ring-[#4edea3] rounded-xl py-2.5 pl-3 pr-8 text-xs text-[#dae2fd] placeholder:text-slate-600 disabled:opacity-50 outline-none"
                />
                <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-[#bbcabf]/40 text-sm">vpn_key</span>
              </div>
            </div>

            {config.source === "env" && (
              <p className="text-[10px] text-[#4edea3] font-mono">
                * Conectado a través de variables de entorno (<code className="bg-[#4edea3]/10 px-1 py-0.5 rounded border border-[#4edea3]/20">.env.local</code>).
              </p>
            )}

            <div className="flex gap-3 mt-1.5">
              <button
                type="submit"
                disabled={testStatus === "testing"}
                className={`flex-1 text-xs font-mono font-bold uppercase transition-all duration-300 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer border-none outline-none ${
                  testStatus === "testing" 
                    ? "bg-[#222a3d] text-[#bbcabf]/50" 
                    : "cta-gradient text-[#003824]"
                }`}
              >
                {testStatus === "testing" ? (
                  <>
                    <span className="material-symbols-outlined text-xs animate-spin">sync</span> Probando...
                  </>
                ) : (
                  "Probar y Guardar Conexión"
                )}
              </button>

              {config.isConfigured && (
                <button
                  type="button"
                  onClick={handlePushLocalToSupabase}
                  disabled={isSyncing}
                  className="bg-[#222a3d]/50 hover:bg-[#222a3d] text-white text-xs font-mono font-bold uppercase px-4 rounded-xl flex items-center gap-1.5 border border-white/10 cursor-pointer outline-none transition-all active:scale-95"
                >
                  {isSyncing ? (
                    <span className="material-symbols-outlined text-xs animate-spin">sync</span>
                  ) : (
                    "Volcar datos de Web"
                  )}
                </button>
              )}
            </div>
          </form>

          {testStatus === "success" && (
            <div className="bg-emerald-950/30 border border-emerald-900/40 rounded-xl p-3 flex items-start gap-2.5 text-xs text-slate-300 animate-fadeIn">
              <CheckCircle className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-400">¡Conexión Exitosa!</p>
                <p className="text-[11px] text-slate-400 mt-0.5">La tabla <code className="text-white font-bold bg-slate-900 px-1 py-0.5 rounded">transacciones</code> responde de manera óptima. La web se actualizará automáticamente si llega algún cambio.</p>
              </div>
            </div>
          )}

          {testStatus === "error" && (
            <div className="flex flex-col gap-3">
              <div className="bg-red-950/20 border border-red-900/40 rounded-xl p-3 flex items-start gap-2.5 text-xs text-slate-300">
                <XCircle className="w-4.5 h-4.5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-400">Problemas en la Conexión</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{errorMessage}</p>
                </div>
              </div>

              {errorMessage.toLowerCase().includes("permission denied") && (
                <div className="bg-amber-950/20 border border-amber-900/40 rounded-xl p-3 text-xs text-slate-300 flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                    <Database className="w-4 h-4 animate-pulse" />
                    <span>¿Cómo solucionar "permission denied"?</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Este error ocurre porque la tabla existe pero la clave API pública de Supabase (<code className="text-white font-mono bg-slate-900 px-1 rounded">anon</code>) no tiene permisos para leer o escribir datos.
                  </p>
                  <p className="text-[11px] text-amber-500 font-semibold font-mono">
                    Copia y ejecuta esto en el "SQL Editor" de tu panel de Supabase:
                  </p>
                  <div className="relative">
                    <pre className="bg-slate-950 text-[10px] text-slate-300 font-mono p-2.5 rounded-lg overflow-x-auto border border-slate-800 leading-normal">
{`-- 1. Desactivar RLS
ALTER TABLE transacciones DISABLE ROW LEVEL SECURITY;

-- 2. Conceder permisos de API
GRANT ALL ON TABLE transacciones TO anon, authenticated, service_role, postgres;`}
                    </pre>
                    <button
                      type="button"
                      onClick={() => handleCopy(`ALTER TABLE transacciones DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE transacciones TO anon, authenticated, service_role, postgres;`, "fix-permissions")}
                      className="absolute top-1.5 right-1.5 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 rounded border border-slate-700 transition"
                    >
                      {isCopied === "fix-permissions" ? "¡Copiado!" : "Copiar SQL"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-300 font-mono flex items-center gap-1.5">
            <ChevronRight className="w-3.5 h-3.5 text-emerald-400" /> Guía de Integración
          </h4>

          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/30 text-xs">
            <button
              onClick={() => setShowSqlGuide(!showSqlGuide)}
              className="w-full px-4 py-3 bg-slate-900/60 flex items-center justify-between text-left font-sans text-slate-200 hover:text-white transition-colors border-b border-slate-800"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span className="font-medium text-xs">1. Configurar Base de Datos en Supabase</span>
              </div>
              <span className="text-slate-500 font-bold">{showSqlGuide ? "Ocultar" : "Mostrar"}</span>
            </button>

            {showSqlGuide && (
              <div className="p-4 bg-slate-950/80 flex flex-col gap-3">
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Para que la applet y Telegram puedan guardar movimientos, ejecuta el siguiente script en la pestaña <strong className="text-white">SQL Editor</strong> de tu proyecto de Supabase. Esto creará la estructura correcta y habilitará la sincronización en tiempo real (Realtime).
                </p>
                <div className="relative">
                  <pre className="bg-slate-900 text-[10px] text-slate-300 font-mono px-3 py-2.5 rounded-lg overflow-x-auto max-h-52 border border-slate-800 leading-normal">
                    {sqlCode}
                  </pre>
                  <button
                    onClick={() => handleCopy(sqlCode, "sql")}
                    className="absolute top-2 right-2 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded border border-slate-700 transition"
                  >
                    {isCopied === "sql" ? "¡Copiado!" : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/30 text-xs">
            <button
              onClick={() => setShowTelegramGuide(!showTelegramGuide)}
              className="w-full px-4 py-3 bg-slate-900/60 flex items-center justify-between text-left font-sans text-slate-200 hover:text-white transition-colors border-b border-slate-800"
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span className="font-medium text-xs">2. Vincular con tu Bot de Telegram (Make.com)</span>
              </div>
              <span className="text-slate-500 font-bold">{showTelegramGuide ? "Ocultar" : "Mostrar"}</span>
            </button>

            {showTelegramGuide && (
              <div className="p-4 bg-slate-950/80 flex flex-col gap-3 leading-relaxed text-[11px] text-slate-400">
                <p>
                  En tu escenario de Make.com, sustituye el módulo de <strong className="text-white">Google Sheets: Add Row</strong> por el de <strong className="text-white">Supabase: Insert a Row</strong>.
                </p>
                
                <p className="font-mono text-[10px] text-slate-300 bg-slate-900/80 p-2 rounded border border-slate-800">
                  Modulo de Supabase: <strong className="text-emerald-400">Insert a Row</strong><br />
                  Tabla: <strong className="text-white">transacciones</strong><br />
                  Mapeo del JSON de campos a insertar:
                </p>

                <div className="relative">
                  <pre className="bg-slate-900 text-[10px] text-slate-300 font-mono px-3 py-2.5 rounded-lg overflow-x-auto border border-slate-800 leading-normal">
                    {makeJsonData}
                  </pre>
                  <button
                    onClick={() => handleCopy(makeJsonData, "make")}
                    className="absolute top-2 right-2 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded border border-slate-700 transition"
                  >
                    {isCopied === "make" ? "¡Copiado!" : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="border-t border-slate-800 pt-2.5 mt-1">
                  <span className="text-emerald-400 font-semibold text-xs block mb-1">✨ ¡Ventaja del Tiempo Real!</span>
                  Al tener Supabase como canal de almacenamiento centralizado, cuando tu bot de Telegram corra en Make.com, guardará al instante los datos en Supabase. Dado que la web tiene un canal de escucha activo, <strong className="text-white">la pantalla se actualizará automáticamente sin necesidad de recargar la página</strong>.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
