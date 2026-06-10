"use client";

import React, { useState, useEffect } from "react";

interface ToolSaaS {
  name: string;
  category: string;
  desc: string;
  integrations: string;
  saveUrl: string;
}

const saasCatalog: Record<string, ToolSaaS[]> = {
  automatizacion: [
    {
      name: "n8n",
      category: "Automatización",
      desc: "Plataforma open-source autoalojable basada en nodos, orientada a desarrolladores. Soporta agentes de IA, nodos condicionales e integraciones avanzadas.",
      integrations: "LangChain, Vector DBs, APIs REST, Node HTTP Request",
      saveUrl: "https://n8n.io"
    },
    {
      name: "Make (Integromat)",
      category: "Automatización",
      desc: "Orquestador visual drag-and-drop en la nube muy potente. Cuenta con más de 3.000 aplicaciones listas para conectar mediante escenarios interactivos.",
      integrations: "Google Sheets, Slack, Telegram, Webhooks nativos",
      saveUrl: "https://make.com"
    },
    {
      name: "Activepieces",
      category: "Automatización",
      desc: "Alternativa open-source, autoalojable y enfocada en IA. Diseñada en TypeScript con soporte para funciones human-in-the-loop y piezas extensibles.",
      integrations: "Claude Desktop, Cursor, OpenAI, Telegram",
      saveUrl: "https://activepieces.com"
    }
  ],
  rag_ia: [
    {
      name: "Supabase pgvector",
      category: "Bases Vectoriales / RAG",
      desc: "Extensión vectorial nativa de Postgres integrada en tu backend. Permite almacenar embeddings y realizar búsquedas de similitud sin añadir bases externas.",
      integrations: "PostgreSQL estándar, SDK de Supabase, LangChain, LlamaIndex",
      saveUrl: "https://supabase.com/docs/guides/database/vector"
    },
    {
      name: "Pinecone",
      category: "Bases Vectoriales / RAG",
      desc: "Base de datos vectorial serverless y completamente gestionada. Garantiza latencias sub-100ms y escalado automático ideal para producción.",
      integrations: "Indexado HNSW, REST APIs, namespaces y filtros de metadatos",
      saveUrl: "https://pinecone.io"
    },
    {
      name: "Weaviate",
      category: "Bases Vectoriales / RAG",
      desc: "Base de datos vectorial open-source con esquema rico y APIs en GraphQL. Integra embeddings automáticos multimodales (texto, imagen, video).",
      integrations: "OpenAI, Cohere, LangChain, soporte híbrido BM25",
      saveUrl: "https://weaviate.io"
    }
  ],
  scraping: [
    {
      name: "Firecrawl",
      category: "Web Scraping / IA Context",
      desc: "API líder de extracción web para agentes de IA. Crawlea páginas complejas y devuelve contenido limpio en Markdown o JSON estructurado para LLMs.",
      integrations: "SDK oficial, n8n piece, Make scenarios, Lovable integration",
      saveUrl: "https://firecrawl.dev"
    },
    {
      name: "Apify",
      category: "Web Scraping / IA Context",
      desc: "Plataforma de scraping en la nube con un almacén de miles de scrapers prefabricados (Actors) para plataformas como Google Maps, Instagram o TikTok.",
      integrations: "S3 backups, loaders de LangChain, Qdrant/Pinecone sync",
      saveUrl: "https://apify.com"
    }
  ],
  backend: [
    {
      name: "Supabase",
      category: "Backend-as-a-Service",
      desc: "Tu backend open-source relacional por excelencia. Proporciona base relacional Postgres, Auth con RLS, Edge Functions, Storage y Realtime API.",
      integrations: "Postgres, Next.js templates, Realtime websockets, Make/n8n",
      saveUrl: "https://supabase.com"
    },
    {
      name: "Neon Postgres",
      category: "Bases de Datos",
      desc: "PostgreSQL serverless con escalado a cero (pausa tras inactividad) y branching de base de datos estilo ramas de Git. Ideal para entornos efímeros.",
      integrations: "Driver serverless, branching API, n8n Node, Zapier connector",
      saveUrl: "https://neon.tech"
    }
  ]
};

export function IAProactiva() {
  const [selectedObjective, setSelectedObjective] = useState<string>("automatizacion");
  const [myStack, setMyStack] = useState<string[]>([]);
  const [showSavingMessage, setShowSavingMessage] = useState(false);
  const [simulatedAhorro, setSimulatedAhorro] = useState(false);

  // Cargar "Mi Stack" desde localStorage al montar
  useEffect(() => {
    const savedStack = localStorage.getItem("billeteria_user_stack");
    if (savedStack) {
      try {
        setMyStack(JSON.parse(savedStack));
      } catch (e) {
        console.error("Error al cargar stack", e);
      }
    } else {
      const defaultStack = ["Supabase", "Make (Integromat)"];
      setMyStack(defaultStack);
      localStorage.setItem("billeteria_user_stack", JSON.stringify(defaultStack));
    }

    const savedAhorroStatus = localStorage.getItem("billeteria_ahorro_aplicado");
    if (savedAhorroStatus) {
      setSimulatedAhorro(savedAhorroStatus === "true");
    }
  }, []);

  const handleAddToStack = (toolName: string) => {
    if (myStack.includes(toolName)) return;
    const newStack = [...myStack, toolName];
    setMyStack(newStack);
    localStorage.setItem("billeteria_user_stack", JSON.stringify(newStack));
    
    setShowSavingMessage(true);
    setTimeout(() => setShowSavingMessage(false), 2000);
  };

  const handleRemoveFromStack = (toolName: string) => {
    const newStack = myStack.filter(item => item !== toolName);
    setMyStack(newStack);
    localStorage.setItem("billeteria_user_stack", JSON.stringify(newStack));
  };

  const handleApplyOptimization = () => {
    setSimulatedAhorro(true);
    localStorage.setItem("billeteria_ahorro_aplicado", "true");
    alert("¡Excelente! Has adoptado n8n autoalojado. Se ha simulado un ahorro de 120 € en tus Gastos Variables para este periodo de cálculo.");
  };

  const handleResetOptimization = () => {
    setSimulatedAhorro(false);
    localStorage.setItem("billeteria_ahorro_aplicado", "false");
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR"
    }).format(val);
  };

  const currentTools = saasCatalog[selectedObjective] || [];

  return (
    <div className="glass-panel rounded-3xl p-6 flex flex-col gap-6 relative overflow-hidden group animate-fadeIn w-full" id="ia-proactiva-panel">
      {/* Glow de fondo */}
      <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-[#d0bcff]/10 blur-[100px] rounded-full pointer-events-none"></div>
      
      {/* Cabecera del Panel */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#d0bcff]/10 border border-[#d0bcff]/20 rounded-2xl flex items-center justify-center text-[#d0bcff]">
            <span className="material-symbols-outlined text-md">psychology</span>
          </div>
          <div>
            <h3 className="font-headline-md text-headline-md text-white font-bold flex items-center gap-2">
              IA Proactiva
              <span className="text-[9px] bg-[#d0bcff]/10 text-[#d0bcff] border border-[#d0bcff]/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono">
                Pro
              </span>
            </h3>
            <p className="text-xs text-[#bbcabf]/70 mt-0.5">Análisis predictivo de flujo de caja y sugerencias del catálogo SaaS</p>
          </div>
        </div>
      </div>

      {/* Grid de Contenido */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Recomendador (Izquierda/Centro) */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] text-[#bbcabf]/60 font-mono uppercase tracking-wider font-semibold">¿Cuál es el objetivo de tu próximo desarrollo?</span>
            
            {/* Filtros de Selección de Objetivo */}
            <div className="flex flex-wrap gap-2 mt-1">
              <button
                type="button"
                onClick={() => setSelectedObjective("automatizacion")}
                className={`text-xs px-3.5 py-1.5 rounded-lg border transition-all cursor-pointer border-none outline-none ${
                  selectedObjective === "automatizacion"
                    ? "bg-[#4edea3] text-[#003824] border-none font-bold shadow-md shadow-[#4edea3]/10"
                    : "bg-[#060e20]/60 border border-white/5 text-[#bbcabf] hover:text-white"
                }`}
              >
                Automatización No-Code
              </button>
              <button
                type="button"
                onClick={() => setSelectedObjective("rag_ia")}
                className={`text-xs px-3.5 py-1.5 rounded-lg border transition-all cursor-pointer border-none outline-none ${
                  selectedObjective === "rag_ia"
                    ? "bg-[#4edea3] text-[#003824] border-none font-bold shadow-md shadow-[#4edea3]/10"
                    : "bg-[#060e20]/60 border border-white/5 text-[#bbcabf] hover:text-white"
                }`}
              >
                Agentes IA con RAG
              </button>
              <button
                type="button"
                onClick={() => setSelectedObjective("scraping")}
                className={`text-xs px-3.5 py-1.5 rounded-lg border transition-all cursor-pointer border-none outline-none ${
                  selectedObjective === "scraping"
                    ? "bg-[#4edea3] text-[#003824] border-none font-bold shadow-md shadow-[#4edea3]/10"
                    : "bg-[#060e20]/60 border border-white/5 text-[#bbcabf] hover:text-white"
                }`}
              >
                Web Scraping & Extracción
              </button>
              <button
                type="button"
                onClick={() => setSelectedObjective("backend")}
                className={`text-xs px-3.5 py-1.5 rounded-lg border transition-all cursor-pointer border-none outline-none ${
                  selectedObjective === "backend"
                    ? "bg-[#4edea3] text-[#003824] border-none font-bold shadow-md shadow-[#4edea3]/10"
                    : "bg-[#060e20]/60 border border-white/5 text-[#bbcabf] hover:text-white"
                }`}
              >
                Backend & Bases SQL
              </button>
            </div>
          </div>

          {/* Tarjetas de Herramientas Recomendadas */}
          <div className="flex flex-col gap-4">
            {currentTools.map((tool) => {
              const insideStack = myStack.includes(tool.name);
              return (
                <div
                  key={tool.name}
                  className="bg-[#060e20]/40 border border-white/5 hover:border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all group"
                >
                  <div className="flex flex-col gap-1.5 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-sans font-bold text-white group-hover:text-[#4edea3] transition-colors">
                        {tool.name}
                      </span>
                      <span className="text-[9px] bg-[#222a3d]/50 border border-white/5 text-[#bbcabf]/80 px-1.5 py-0.5 rounded uppercase font-mono">
                        {tool.category}
                      </span>
                    </div>
                    <p className="text-xs text-[#bbcabf]/70 leading-normal">
                      {tool.desc}
                    </p>
                    <div className="text-[10px] text-[#bbcabf]/50 font-mono mt-0.5">
                      <strong className="text-[#bbcabf]/70">Integraciones:</strong> {tool.integrations}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                    <a
                      href={tool.saveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] font-mono text-[#bbcabf] hover:text-white px-2.5 py-1.5 rounded-xl border border-white/10 hover:bg-white/5 flex items-center gap-1 cursor-pointer bg-transparent"
                    >
                      Docs <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                    </a>

                    {insideStack ? (
                      <span className="text-[10px] font-mono text-[#4edea3] bg-[#4edea3]/10 border border-[#4edea3]/20 px-3 py-1.5 rounded-xl flex items-center gap-1 select-none font-bold">
                        <span className="material-symbols-outlined text-xs">check</span> En Stack
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAddToStack(tool.name)}
                        className="bg-[#d0bcff] hover:bg-[#d0bcff]/90 text-[#3c0091] text-[10px] font-mono font-bold uppercase py-1.5 px-3 rounded-xl flex items-center gap-1 cursor-pointer border-none outline-none transition-colors"
                      >
                        <span className="material-symbols-outlined text-xs">add</span> Añadir
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pila personal del usuario - Mi Stack (Derecha) */}
        <div className="lg:col-span-4 flex flex-col gap-5 bg-[#060e20]/30 border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-xs font-sans font-bold text-white flex items-center gap-1.5">
              <span className="material-symbols-outlined text-md text-[#4edea3]">layers</span> Mi Stack Tecnológico
            </span>
            <span className="text-[10px] text-[#4edea3] font-mono font-bold bg-[#131b2e] px-2 py-0.5 rounded border border-[#4edea3]/20">
              {myStack.length}
            </span>
          </div>

          {myStack.length === 0 ? (
            <div className="text-center py-6 text-[#bbcabf]/40 text-[11px] leading-normal">
              Aún no has añadido herramientas a tu stack. Usa el recomendador para seleccionar tus favoritas.
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
              {myStack.map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between bg-[#131b2e]/80 border border-white/5 px-3 py-2 rounded-xl text-xs"
                >
                  <span className="text-[#dae2fd] font-medium font-sans">{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFromStack(item)}
                    className="text-[#bbcabf]/40 hover:text-[#ffb4ab] p-0.5 rounded hover:bg-white/5 transition-all cursor-pointer bg-transparent border-none outline-none"
                    title="Eliminar de mi stack"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Tarjeta de Diagnóstico y Oportunidad de Ahorro */}
          <div className="border-t border-white/5 pt-4 mt-2">
            <div className="glass-panel border-l-4 border-[#d0bcff] rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden group/opt">
              <div className="absolute top-0 right-0 w-20 h-20 bg-[#d0bcff]/5 rounded-full blur-xl pointer-events-none"></div>
              <div className="flex gap-2">
                <span className="material-symbols-outlined text-[#d0bcff] shrink-0 mt-0.5">payments</span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-sans font-bold text-white uppercase tracking-wider">IA Proactiva de Gastos</span>
                  <p className="text-[10px] text-[#bbcabf]/75 leading-normal">
                    {simulatedAhorro 
                      ? "¡Optimización Aplicada! Has adoptado n8n autoalojado para reemplazar Zapier y reducir costes."
                      : "Basado en tu presupuesto de Gastos Variables, migrar tus automatizaciones de Zapier a n8n autoalojado te ahorrará dinero."
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between bg-[#060e20]/50 p-2.5 rounded-xl border border-white/5 text-[10px] font-mono">
                <span className="text-[#bbcabf]/50 uppercase">Ahorro Estimado:</span>
                <span className="text-[#4cd7f6] font-bold text-xs">{formatCurrency(120)}/mes</span>
              </div>

              {simulatedAhorro ? (
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-[#4edea3] font-bold font-mono uppercase">✓ Optimización Activa</span>
                  <button
                    onClick={handleResetOptimization}
                    className="text-[9px] font-mono text-[#bbcabf]/60 hover:text-white underline cursor-pointer bg-transparent border-none outline-none"
                  >
                    Revertir
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleApplyOptimization}
                  className="w-full bg-[#d0bcff]/10 hover:bg-[#d0bcff]/20 text-[#d0bcff] text-[10px] font-mono font-bold uppercase py-2 px-3 rounded-xl flex items-center justify-center gap-0.5 transition-colors cursor-pointer border border-[#d0bcff]/30 outline-none"
                >
                  Optimizar Stack (-120 €)
                </button>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Mensaje de confirmación temporal flotante */}
      {showSavingMessage && (
        <div className="absolute bottom-4 right-4 bg-[#4edea3] text-[#003824] text-xs font-mono font-bold py-2 px-3 rounded-xl border border-[#4edea3]/20 shadow-lg animate-fadeIn flex items-center gap-1.5 select-none z-50">
          <span className="material-symbols-outlined text-xs font-bold">check</span> Herramienta añadida a tu stack
        </div>
      )}

    </div>
  );
}
