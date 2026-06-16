"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, HelpCircle, ArrowLeft, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "¿Cómo funciona el bot de Telegram?",
      a: "Al suscribirte al Plan Pro, te damos acceso a @BilleterIA2_bot. Puedes enviarle notas de voz explicando tu gasto (ej. 'He pagado 12 euros por una hamburguesa') o texto plano. Nuestra IA procesa tu voz mediante Whisper de OpenAI, interpreta el concepto e importe y lo guarda directamente en tu base de datos de Supabase en milisegundos."
    },
    {
      q: "¿Qué es el escenario de Make.com?",
      a: "Make.com es la plataforma que conecta tu chatbot de Telegram con tu base de datos de Supabase. Te proporcionamos la plantilla JSON del escenario. Solo tienes que importarlo en Make, conectar tu token de Telegram y tus credenciales de Supabase, ¡y listo! Todo el procesamiento se realiza en la nube."
    },
    {
      q: "¿Es seguro almacenar mis datos en Supabase?",
      a: "Totalmente. Supabase es una plataforma de base de datos segura de nivel empresarial construida sobre PostgreSQL. Con el Plan Pro, tú eres el dueño absoluto de tu base de datos y tus datos nunca se comparten con terceros."
    },
    {
      q: "¿Puedo usar la aplicación de forma gratuita?",
      a: "Sí. El Plan Free permite usar la aplicación web de manera 100% gratuita utilizando el almacenamiento local de tu navegador (localStorage). Podrás usar todos los gráficos, presupuestos y calculadora, pero tus datos no se sincronizarán en la nube ni podrás usar el Bot de Telegram."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0b1326] text-[#dae2fd] flex flex-col font-sans selection:bg-[#4edea3]/20 selection:text-[#4edea3] overflow-x-hidden">
      
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-purple-500/10 via-[#4edea3]/5 to-transparent blur-[120px] pointer-events-none z-0" />

      {/* Header Sticky Navigation */}
      <header className="fixed top-0 w-full z-50 bg-[#0b1326]/60 backdrop-blur-xl border-b border-white/10 px-6 md:px-12 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 hover:opacity-85 transition-opacity">
          <Logo size={36} />
          <span className="font-sans font-bold text-lg tracking-tight text-white flex items-center select-none">
            Billeter<span className="text-[#4edea3]">IA</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-[#bbcabf] hover:text-white transition-colors text-sm font-medium">Plataforma</Link>
          <span className="text-white transition-colors text-sm font-bold border-b-2 border-[#4edea3] pb-1">Precios</span>
          <Link href="/#vision" className="text-[#bbcabf] hover:text-white transition-colors text-sm font-medium">Visión IA</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-xs font-mono text-[#bbcabf] hover:text-white flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Volver al App
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative pt-32 pb-24 px-6 md:px-12 max-w-5xl mx-auto w-full flex-1 flex flex-col gap-16 z-10">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto flex flex-col gap-4">
          <div className="inline-flex self-center items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[#d0bcff] text-xs font-mono font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>PLANES SENCILLOS Y TRANSPARENTES</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">Elige tu plan de control financiero</h1>
          <p className="text-[#bbcabf] text-sm md:text-md">
            Automatiza tu contabilidad con IA o lleva un control local gratuito. Cancela en cualquier momento sin penalizaciones.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          
          {/* Plan Free */}
          <div className="glass-panel p-8 rounded-3xl border border-white/10 hover:border-white/20 transition-all flex flex-col gap-8 relative overflow-hidden bg-[#131b2e]/20">
            <div>
              <h2 className="text-xl font-bold text-white">Plan Local (Free)</h2>
              <p className="text-xs text-[#bbcabf]/60 mt-1">Perfecto para control personal básico offline</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-extrabold text-white">0€</span>
                <span className="text-md text-[#bbcabf]/60 font-mono">/mes</span>
              </div>
            </div>
            
            <ul className="space-y-4 text-sm text-[#bbcabf] border-t border-white/5 pt-8 flex-1">
              <li className="flex items-start gap-3">
                <Check className="w-4.5 h-4.5 text-[#4edea3] shrink-0 mt-0.5" />
                <span>Base de datos en navegador (localStorage)</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-4.5 h-4.5 text-[#4edea3] shrink-0 mt-0.5" />
                <span>Dashboard con indicadores de Dinero Líquido</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-4.5 h-4.5 text-[#4edea3] shrink-0 mt-0.5" />
                <span>Configuración de límites fijos y variables</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-4.5 h-4.5 text-[#4edea3] shrink-0 mt-0.5" />
                <span>Calculadora de proyección de interés compuesto</span>
              </li>
              <li className="flex items-start gap-3 text-slate-600 line-through">
                <Check className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <span>Integración en tiempo real con Supabase</span>
              </li>
              <li className="flex items-start gap-3 text-slate-600 line-through">
                <Check className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <span>Bot de Telegram para registrar por voz/texto</span>
              </li>
              <li className="flex items-start gap-3 text-slate-600 line-through">
                <Check className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <span>Escenario de automatizaciones en Make.com</span>
              </li>
            </ul>

            <Link href="/dashboard" className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 text-center text-sm border border-white/10">
              Comenzar Gratis Offline
            </Link>
          </div>

          {/* Plan Pro */}
          <div className="glass-panel p-8 rounded-3xl border border-emerald-500/40 bg-gradient-to-b from-[#1b2640]/60 to-[#0b1326]/60 shadow-[0_0_50px_rgba(78,222,163,0.15)] hover:border-emerald-500/60 transition-all flex flex-col gap-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 bg-emerald-500/20 text-[#4edea3] border-b border-l border-emerald-500/30 text-[10px] font-mono font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-widest animate-pulse">
              RECOMENDADO
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">Plan Pro (Conectado)</h2>
                <span className="px-2 py-0.5 text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-mono font-bold">IA</span>
              </div>
              <p className="text-xs text-[#bbcabf]/60 mt-1">Sincronización total en la nube y comandos por voz</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-extrabold text-white">9.99€</span>
                <span className="text-md text-[#bbcabf]/60 font-mono">/mes</span>
              </div>
            </div>
            
            <ul className="space-y-4 text-sm text-[#bbcabf] border-t border-white/5 pt-8 flex-1">
              <li className="flex items-start gap-3">
                <Check className="w-4.5 h-4.5 text-[#4edea3] shrink-0 mt-0.5" />
                <span>Base de datos en la nube (Supabase)</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-4.5 h-4.5 text-[#4edea3] shrink-0 mt-0.5" />
                <span>Canales Realtime activos en la web</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-4.5 h-4.5 text-[#4edea3] shrink-0 mt-0.5" />
                <span>Acceso exclusivo a @BilleterIA2_bot de Telegram</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-4.5 h-4.5 text-[#4edea3] shrink-0 mt-0.5" />
                <span>Soporte para Ingesta por Notas de Voz (IA Whisper)</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-4.5 h-4.5 text-[#4edea3] shrink-0 mt-0.5" />
                <span>Acceso a plantillas JSON para Make.com</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-4.5 h-4.5 text-[#4edea3] shrink-0 mt-0.5" />
                <span>Alertas inteligentes proactivas automáticas</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-4.5 h-4.5 text-[#4edea3] shrink-0 mt-0.5" />
                <span>Soporte técnico prioritario 24/7</span>
              </li>
            </ul>

            <Link href="/auth/sign-up" className="w-full cta-gradient text-[#003824] font-extrabold py-4 rounded-2xl hover:shadow-[0_0_30px_rgba(78,222,163,0.4)] transition-all active:scale-95 text-center text-sm">
              Registrarme y Obtener Pro
            </Link>
          </div>

        </div>

        {/* Detailed Comparison Table */}
        <div className="flex flex-col gap-6 mt-8">
          <h3 className="text-xl font-bold text-white text-center">Comparativa de Características</h3>
          <div className="border border-white/10 rounded-2xl overflow-hidden bg-slate-950/20 text-sm">
            <div className="grid grid-cols-3 bg-white/5 p-4 font-bold text-white border-b border-white/10 font-mono text-xs uppercase tracking-wider">
              <div>Característica</div>
              <div className="text-center">Local (Free)</div>
              <div className="text-center">Pro</div>
            </div>
            <div className="grid grid-cols-3 p-4 border-b border-white/5 items-center">
              <div className="font-semibold text-white">Almacenamiento</div>
              <div className="text-center text-[#bbcabf]/70">Navegador local</div>
              <div className="text-center text-emerald-400 font-bold">Supabase Cloud</div>
            </div>
            <div className="grid grid-cols-3 p-4 border-b border-white/5 items-center">
              <div className="font-semibold text-white">Canal Telegram</div>
              <div className="text-center text-red-500/70">—</div>
              <div className="text-center text-emerald-400 font-bold">Sí (@BilleterIA2_bot)</div>
            </div>
            <div className="grid grid-cols-3 p-4 border-b border-white/5 items-center">
              <div className="font-semibold text-white">Notas de Voz</div>
              <div className="text-center text-red-500/70">—</div>
              <div className="text-center text-emerald-400 font-bold">Sí (Whisper AI)</div>
            </div>
            <div className="grid grid-cols-3 p-4 border-b border-white/5 items-center">
              <div className="font-semibold text-white">Sincronización en tiempo real</div>
              <div className="text-center text-red-500/70">—</div>
              <div className="text-center text-emerald-400 font-bold">Sí (WebSockets)</div>
            </div>
            <div className="grid grid-cols-3 p-4 items-center">
              <div className="font-semibold text-white">Soporte técnico</div>
              <div className="text-center text-[#bbcabf]/70">Comunidad</div>
              <div className="text-center text-emerald-400 font-bold">Prioritario (Chat/Email)</div>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="flex flex-col gap-6 mt-8">
          <h3 className="text-2xl font-bold text-white text-center flex items-center justify-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#4edea3]" /> Preguntas Frecuentes
          </h3>
          <div className="space-y-4 max-w-3xl mx-auto w-full">
            {faqs.map((faq, idx) => (
              <div key={idx} className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
                <button 
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left font-bold text-white flex justify-between items-center hover:bg-white/5 transition-colors cursor-pointer bg-transparent border-none outline-none"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? <ChevronUp className="w-4 h-4 text-[#4edea3]" /> : <ChevronDown className="w-4 h-4 text-[#bbcabf]" />}
                </button>
                {openFaq === idx && (
                  <div className="p-5 pt-0 text-sm text-[#bbcabf] border-t border-white/5 leading-relaxed bg-[#0b1326]/20">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 bg-[#060e20]/60 text-xs">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[#bbcabf]/60">
          <div className="flex items-center gap-2">
            <Logo size={24} />
            <span className="text-white font-bold">BilleterIA</span>
          </div>
          <span className="text-center">© 2026 BilleterIA. Diseñado para automatizar tu control financiero.</span>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
