import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/Logo";

export const dynamic = "force-dynamic";

import {
  Sparkles,
  ArrowRight,
  Mic,
  Bot,
  Zap,
  Shield,
  HelpCircle,
  Check,
  ChevronDown,
  Layers,
  TrendingUp,
  Percent,
  Coins,
  MessageSquare
} from "lucide-react";

export default async function Home() {
  let user: any = null;
  try {
    const supabase = await createClient();
    // Timeout de 1s para no bloquear la landing si Supabase no es accesible
    const result = await Promise.race([
      supabase.auth.getUser(),
      new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error("Supabase timeout")), 1000)
      ),
    ]);
    if (result && typeof result === "object" && "data" in result) {
      user = (result as any).data?.user ?? null;
    }
  } catch (error) {
    // Si Supabase no responde o no está configurado, se muestra la landing sin sesión
    console.warn("Supabase no disponible en la Landing Page:", (error as Error).message);
  }

  return (
    <div className="min-h-screen bg-[#0b1326] text-[#dae2fd] flex flex-col font-sans selection:bg-[#4edea3]/20 selection:text-[#4edea3] overflow-x-hidden relative">
      
      {/* Glow radial de fondo (Fondo Cósmico) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-purple-500/10 via-[#4edea3]/5 to-transparent blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[800px] -left-40 w-96 h-96 bg-purple-500/5 blur-[100px] pointer-events-none z-0" />
      <div className="absolute top-[1600px] -right-40 w-96 h-96 bg-emerald-500/5 blur-[100px] pointer-events-none z-0" />

      {/* Header Fijo con Desvanecimiento de Cristal */}
      <header className="fixed top-0 w-full z-50 bg-[#0b1326]/60 backdrop-blur-xl border-b border-white/10 px-6 md:px-12 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Logo size={36} />
          <span className="font-sans font-bold text-lg tracking-tight text-white flex items-center select-none">
            Billeter<span className="text-[#4edea3]">IA</span>
          </span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#bbcabf]">
          <a href="#features" className="hover:text-white transition-colors">Características</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">Cómo Funciona</a>
          <a href="#pricing" className="hover:text-white transition-colors">Precios</a>
          <a href="#faq" className="hover:text-white transition-colors">Preguntas Frecuentes</a>
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-xs text-[#bbcabf] font-mono">
                {user.email}
              </span>
              <Link 
                href="/dashboard" 
                className="bg-[#4edea3]/10 hover:bg-[#4edea3]/20 border border-[#4edea3]/30 text-[#4edea3] text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5"
              >
                Ir al Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <>
              <Link 
                href="/auth/login" 
                className="text-[#bbcabf] hover:text-white text-xs font-bold transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link 
                href="/auth/sign-up" 
                className="bg-[#4edea3] hover:bg-[#3ec48e] text-[#002113] text-xs font-bold px-4 py-2.5 rounded-xl transition-all hover:scale-[1.02] shadow-[0_0_15px_rgba(78,222,163,0.2)]"
              >
                Crear Cuenta
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col pt-28">
        
        {/* HERO SECTION */}
        <section className="relative px-6 md:px-12 max-w-6xl mx-auto w-full pt-12 pb-20 flex flex-col lg:flex-row items-center gap-12 z-10">
          
          {/* Copy y llamadas a la acción */}
          <div className="flex-1 flex flex-col gap-6 text-center lg:text-left">
            <div className="inline-flex self-center lg:self-start items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[#d0bcff] text-xs font-mono font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Wealth Intelligence v1.2-beta</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
              Tus finanzas inteligentes, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4edea3] to-[#d0bcff]">
                simplificadas por IA.
              </span>
            </h1>

            <p className="text-[#bbcabf] text-base md:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Controla tu dinero líquido, ahorros e inversiones sin fricciones. Registra movimientos en segundos por voz con Telegram y visualiza tu patrimonio neto en tiempo real.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mt-2">
              {user ? (
                <Link 
                  href="/dashboard" 
                  className="cta-gradient text-[#003824] font-extrabold px-8 py-4 rounded-2xl hover:shadow-[0_0_30px_rgba(78,222,163,0.4)] transition-all active:scale-95 text-md flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                  Acceder a mi Dashboard <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <>
                  <Link 
                    href="/auth/sign-up" 
                    className="cta-gradient text-[#003824] font-extrabold px-8 py-4 rounded-2xl hover:shadow-[0_0_30px_rgba(78,222,163,0.4)] transition-all active:scale-95 text-md flex items-center gap-2 w-full sm:w-auto justify-center"
                  >
                    Empezar Gratis <ArrowRight className="w-5 h-5" />
                  </Link>
                  <a 
                    href="#pricing" 
                    className="bg-white/5 hover:bg-white/10 text-white font-bold px-8 py-4 rounded-2xl border border-white/10 hover:border-white/20 transition-all text-md w-full sm:w-auto text-center"
                  >
                    Ver Planes
                  </a>
                </>
              )}
            </div>

            {/* Microstats de confianza */}
            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-6 mt-6 pt-6 border-t border-white/5 text-xs text-[#bbcabf]/70 font-mono">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#4edea3]" /> Sin conectar tus bancos
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#4edea3]" /> Datos 100% tuyos en Supabase
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#4edea3]" /> Procesamiento local y cloud
              </span>
            </div>
          </div>

          {/* Interactive CSS Dashboard Mockup (WOW Factor) */}
          <div className="flex-1 w-full max-w-lg lg:max-w-none relative animate-fadeIn">
            {/* Glowing background behind mockup */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#4edea3] to-purple-500 rounded-[32px] opacity-10 blur-xl group-hover:opacity-20 transition duration-1000" />
            
            {/* Main Mockup container */}
            <div className="glass-panel border border-white/10 rounded-[32px] p-6 bg-[#0f172a]/80 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
              
              {/* Mockup Header Bar */}
              <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-[#4edea3]/60" />
                  <span className="text-[10px] text-[#bbcabf]/50 font-mono ml-2">billeteria.app/dashboard</span>
                </div>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono font-bold animate-pulse">
                  Supabase Conectado
                </span>
              </div>

              {/* Mockup Gauges Preview */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                
                {/* Gauge 1 */}
                <div className="bg-[#172138]/50 border border-white/5 rounded-2xl p-3 flex flex-col items-center text-center">
                  <span className="text-[9px] text-[#bbcabf] font-mono uppercase tracking-wider">Liquidez</span>
                  <div className="relative w-16 h-12 flex items-center justify-center mt-2">
                    <svg className="w-16 h-16 absolute -top-2" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="36" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="none" strokeDasharray="180 360" strokeLinecap="round" transform="rotate(-180 50 50)" />
                      <circle cx="50" cy="50" r="36" stroke="#4edea3" strokeWidth="8" fill="none" strokeDasharray="130 360" strokeLinecap="round" transform="rotate(-180 50 50)" />
                    </svg>
                    <span className="text-xs font-extrabold text-white mt-1">1.250€</span>
                  </div>
                </div>

                {/* Gauge 2 */}
                <div className="bg-[#172138]/50 border border-white/5 rounded-2xl p-3 flex flex-col items-center text-center">
                  <span className="text-[9px] text-[#bbcabf] font-mono uppercase tracking-wider">Ahorros</span>
                  <div className="relative w-16 h-12 flex items-center justify-center mt-2">
                    <svg className="w-16 h-16 absolute -top-2" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="36" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="none" strokeDasharray="180 360" strokeLinecap="round" transform="rotate(-180 50 50)" />
                      <circle cx="50" cy="50" r="36" stroke="#4cd7f6" strokeWidth="8" fill="none" strokeDasharray="90 360" strokeLinecap="round" transform="rotate(-180 50 50)" />
                    </svg>
                    <span className="text-xs font-extrabold text-white mt-1">3.400€</span>
                  </div>
                </div>

                {/* Gauge 3 */}
                <div className="bg-[#172138]/50 border border-white/5 rounded-2xl p-3 flex flex-col items-center text-center">
                  <span className="text-[9px] text-[#bbcabf] font-mono uppercase tracking-wider">Inversión</span>
                  <div className="relative w-16 h-12 flex items-center justify-center mt-2">
                    <svg className="w-16 h-16 absolute -top-2" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="36" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="none" strokeDasharray="180 360" strokeLinecap="round" transform="rotate(-180 50 50)" />
                      <circle cx="50" cy="50" r="36" stroke="#d0bcff" strokeWidth="8" fill="none" strokeDasharray="110 360" strokeLinecap="round" transform="rotate(-180 50 50)" />
                    </svg>
                    <span className="text-xs font-extrabold text-white mt-1">7.800€</span>
                  </div>
                </div>

              </div>

              {/* Collapsible Budget limits mockup */}
              <div className="bg-[#172138]/30 border border-white/5 rounded-2xl p-4 mb-6">
                <div className="flex justify-between items-center text-[10px] text-[#bbcabf] font-mono mb-2">
                  <span>CONTROL DE LÍMITE MENSUAL (Gastos Variables)</span>
                  <span className="text-yellow-400">75% Consumido</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-[#4edea3] to-yellow-500 h-full rounded-full" style={{ width: "75%" }} />
                </div>
              </div>

              {/* Floating Telegram Audio Box (Demonstrating Audio Ingestion) */}
              <div className="absolute right-4 bottom-4 left-4 bg-gradient-to-r from-[#1e293b] to-[#1e3a5f] border border-blue-500/30 rounded-2xl p-3.5 shadow-2xl flex items-center gap-3 animate-bounce" style={{ animationDuration: "3s" }}>
                <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Mic className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center text-[9px] font-mono text-blue-300">
                    <span>@BilleterIA2_bot</span>
                    <span>HACE UN MOMENTO</span>
                  </div>
                  <p className="text-[11px] text-white font-medium mt-0.5">
                    "He invertido 250 euros en ETF de bolsa mundial"
                  </p>
                </div>
                <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[9px] font-mono px-2 py-0.5 rounded">
                  Confirmado
                </div>
              </div>

              {/* Background Mockup Details */}
              <div className="h-24 overflow-hidden opacity-30 flex flex-col gap-2 pointer-events-none mt-2">
                <div className="flex justify-between items-center text-[10px] bg-white/5 px-3 py-1.5 rounded-lg">
                  <span>Nómina Mensual Recibida</span>
                  <span className="text-[#4edea3]">+2.500€</span>
                </div>
                <div className="flex justify-between items-center text-[10px] bg-white/5 px-3 py-1.5 rounded-lg">
                  <span>Alquiler Piso</span>
                  <span className="text-red-400">-850€</span>
                </div>
              </div>

            </div>
          </div>

        </section>

        {/* FEATURES / VALUE PROPOSITION SECTION */}
        <section id="features" className="py-24 px-6 md:px-12 bg-[#060e20]/60 relative border-t border-white/5">
          <div className="max-w-6xl mx-auto w-full flex flex-col gap-16">
            
            {/* Title */}
            <div className="text-center max-w-2xl mx-auto flex flex-col gap-3">
              <span className="text-[#4edea3] font-mono text-xs uppercase tracking-widest font-bold">Tecnología de Vanguardia</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Diseñado para la simplicidad absoluta</h2>
              <p className="text-[#bbcabf] text-sm md:text-md">
                Evita la sobrecarga cognitiva de las apps tradicionales. BilleterIA se adapta a tu día a día con automatizaciones nativas.
              </p>
            </div>

            {/* Grid of features */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              
              {/* Feature 1 */}
              <div className="glass-panel p-6 rounded-3xl border border-white/10 hover:border-[#4edea3]/40 transition-all flex flex-col gap-4 relative overflow-hidden bg-slate-950/20">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-[#4cd7f6] flex items-center justify-center">
                  <Mic className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Ingesta por Notas de Voz</h3>
                <p className="text-sm text-[#bbcabf] leading-relaxed">
                  Envía una nota de voz rápida a tu bot privado de Telegram. La IA de Whisper y Gemini interpretará el concepto e importe en menos de 2.5 segundos.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="glass-panel p-6 rounded-3xl border border-white/10 hover:border-purple-500/40 transition-all flex flex-col gap-4 relative overflow-hidden bg-slate-950/20">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-[#d0bcff] flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Motor Gemini 3.5 Flash</h3>
                <p className="text-sm text-[#bbcabf] leading-relaxed">
                  Estructuración inteligente JSON que clasifica automáticamente cada movimiento en 5 macrocategorías rígidas, evitando la parálisis de categorización.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="glass-panel p-6 rounded-3xl border border-white/10 hover:border-[#4edea3]/40 transition-all flex flex-col gap-4 relative overflow-hidden bg-slate-950/20">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[#4edea3] flex items-center justify-center">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Dashboard en Tiempo Real</h3>
                <p className="text-sm text-[#bbcabf] leading-relaxed">
                  Gracias a Supabase Realtime, el panel web se actualiza al instante con transiciones fluidas en cuanto pulsas "Confirmar" en Telegram, sin refrescar pantalla.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="glass-panel p-6 rounded-3xl border border-white/10 hover:border-purple-500/40 transition-all flex flex-col gap-4 relative overflow-hidden bg-slate-950/20">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-[#d0bcff] flex items-center justify-center">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Indicadores Visuales No Tradicionales</h3>
                <p className="text-sm text-[#bbcabf] leading-relaxed">
                  Visualiza tu salud financiera mediante 3 indicadores radiales dinámicos que muestran el balance actual de Liquidez, Ahorro e Inversión al instante.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="glass-panel p-6 rounded-3xl border border-white/10 hover:border-[#4edea3]/40 transition-all flex flex-col gap-4 relative overflow-hidden bg-slate-950/20">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[#4edea3] flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">IA Proactiva y Límites</h3>
                <p className="text-sm text-[#bbcabf] leading-relaxed">
                  Regla del 15% interceptora de ingresos que te sugiere desviar ahorros a inversión, alertas ante desvíos de liquidez y barras de progreso colapsables para topes de gastos.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="glass-panel p-6 rounded-3xl border border-white/10 hover:border-blue-500/40 transition-all flex flex-col gap-4 relative overflow-hidden bg-slate-950/20">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-[#4cd7f6] flex items-center justify-center">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Privacidad y Soberanía</h3>
                <p className="text-sm text-[#bbcabf] leading-relaxed">
                  Tus datos financieros son completamente tuyos. No almacenamos credenciales bancarias. Conectas tu propio Supabase y Make.com para un control absoluto.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section id="how-it-works" className="py-24 px-6 md:px-12 relative max-w-6xl mx-auto w-full">
          <div className="flex flex-col gap-16">
            
            {/* Title */}
            <div className="text-center max-w-2xl mx-auto flex flex-col gap-3">
              <span className="text-[#d0bcff] font-mono text-xs uppercase tracking-widest font-bold">Flujo de Trabajo</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">El Hábito Financiero en 3 Pasos</h2>
              <p className="text-[#bbcabf] text-sm md:text-md">
                Hemos destruido por completo la fricción al registrar gastos. Tan simple que olvidarás que estás haciendo contabilidad.
              </p>
            </div>

            {/* Stepper Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Step 1 */}
              <div className="flex flex-col gap-4 relative">
                <div className="text-5xl font-extrabold text-[#4edea3]/20 font-mono absolute -top-8 -left-4 select-none">01</div>
                <h3 className="text-xl font-bold text-white mt-4">Habla con tu bot</h3>
                <p className="text-sm text-[#bbcabf] leading-relaxed">
                  Envía una nota de voz o escribe un mensaje en lenguaje natural por Telegram (ej: *"he pagado 45 euros en la cena de hoy"* o *"ingreso de nómina por 2500 euros"*).
                </p>
                <div className="bg-[#172138]/50 border border-white/5 rounded-2xl p-4 mt-2 font-mono text-xs text-blue-300">
                  🎙️ "He gastado 12.5€ en café y tostada"
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col gap-4 relative">
                <div className="text-5xl font-extrabold text-[#4edea3]/20 font-mono absolute -top-8 -left-4 select-none">02</div>
                <h3 className="text-xl font-bold text-white mt-4">Confirma en un toque</h3>
                <p className="text-sm text-[#bbcabf] leading-relaxed">
                  El bot procesa la frase y te devuelve botones interactivos en Telegram con el concepto e importe extraído. Solo tienes que pulsar **"Confirmar"**.
                </p>
                <div className="bg-[#172138]/50 border border-white/5 rounded-2xl p-3 mt-2 flex justify-between items-center text-xs">
                  <span className="text-[#bbcabf]">¿Gasto Variable de 12.50€?</span>
                  <span className="bg-emerald-500/20 text-[#4edea3] px-2 py-0.5 rounded font-bold font-mono">Confirmar ✓</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col gap-4 relative">
                <div className="text-5xl font-extrabold text-[#4edea3]/20 font-mono absolute -top-8 -left-4 select-none">03</div>
                <h3 className="text-xl font-bold text-white mt-4">Visualización instantánea</h3>
                <p className="text-sm text-[#bbcabf] leading-relaxed">
                  El registro se inserta en tu base de datos de Supabase. A través de WebSockets, el dashboard web actualiza las agujas de dinero líquido, ahorro e inversión al instante.
                </p>
                <div className="bg-[#172138]/50 border border-white/5 rounded-2xl p-3 mt-2 flex justify-between items-center text-xs">
                  <span className="text-white font-bold">Liquidez Actualizada</span>
                  <span className="text-[#4edea3] font-mono font-bold">+12.50€</span>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* PRICING SECTION */}
        <section id="pricing" className="py-24 px-6 md:px-12 bg-[#060e20]/60 relative border-t border-white/5">
          <div className="max-w-5xl mx-auto w-full flex flex-col gap-16">
            
            {/* Title */}
            <div className="text-center max-w-2xl mx-auto flex flex-col gap-3">
              <span className="text-[#4edea3] font-mono text-xs uppercase tracking-widest font-bold">Suscripción y Conectividad</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Elige tu nivel de control</h2>
              <p className="text-[#bbcabf] text-sm md:text-md">
                Lleva un control local 100% gratuito en tu navegador o conecta tu base de datos Supabase para habilitar la potencia de la IA.
              </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Plan Free */}
              <div className="glass-panel p-8 rounded-3xl border border-white/10 hover:border-white/20 transition-all flex flex-col gap-8 relative overflow-hidden bg-slate-950/20">
                <div>
                  <h3 className="text-xl font-bold text-white">Plan Local (Free)</h3>
                  <p className="text-xs text-[#bbcabf]/60 mt-1">Perfecto para control personal offline y básico</p>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-5xl font-extrabold text-white">0€</span>
                    <span className="text-md text-[#bbcabf]/60 font-mono">/mes</span>
                  </div>
                </div>
                
                <ul className="space-y-4 text-sm text-[#bbcabf] border-t border-white/5 pt-8 flex-1">
                  <li className="flex items-start gap-3">
                    <Check className="w-4.5 h-4.5 text-[#4edea3] shrink-0 mt-0.5" />
                    <span>Base de datos local (localStorage)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-4.5 h-4.5 text-[#4edea3] shrink-0 mt-0.5" />
                    <span>Indicadores de Liquidez, Ahorro e Inversión</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-4.5 h-4.5 text-[#4edea3] shrink-0 mt-0.5" />
                    <span>Calculadora de Interés Compuesto</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-600 line-through">
                    <Check className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                    <span>Sincronización en la nube con Supabase</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-600 line-through">
                    <Check className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                    <span>Bot de Telegram para notas de voz e IA</span>
                  </li>
                </ul>

                <Link href="/dashboard" className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 text-center text-sm border border-white/10 block">
                  Empezar Gratis Offline
                </Link>
              </div>

              {/* Plan Pro */}
              <div className="glass-panel p-8 rounded-3xl border border-[#4edea3]/40 bg-gradient-to-b from-[#1b2640]/60 to-[#0b1326]/60 shadow-[0_0_50px_rgba(78,222,163,0.15)] hover:border-[#4edea3]/60 transition-all flex flex-col gap-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 bg-[#4edea3]/20 text-[#4edea3] border-b border-l border-[#4edea3]/30 text-[9px] font-mono font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-widest animate-pulse">
                  RECOMENDADO
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white">Plan Pro (Conectado)</h3>
                    <span className="px-2 py-0.5 text-[9px] bg-[#4edea3]/10 text-[#4edea3] border border-[#4edea3]/20 rounded font-mono font-bold">IA</span>
                  </div>
                  <p className="text-xs text-[#bbcabf]/60 mt-1">Conexión total en la nube, bot de voz y automatización</p>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-5xl font-extrabold text-white">9,99€</span>
                    <span className="text-md text-[#bbcabf]/60 font-mono">/mes</span>
                  </div>
                </div>
                
                <ul className="space-y-4 text-sm text-[#bbcabf] border-t border-white/5 pt-8 flex-1">
                  <li className="flex items-start gap-3">
                    <Check className="w-4.5 h-4.5 text-[#4edea3] shrink-0 mt-0.5" />
                    <span>Base de datos en la nube (Supabase Cloud)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-4.5 h-4.5 text-[#4edea3] shrink-0 mt-0.5" />
                    <span>Acceso exclusivo al Bot @BilleterIA2_bot de Telegram</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-4.5 h-4.5 text-[#4edea3] shrink-0 mt-0.5" />
                    <span>Procesamiento de Notas de Voz (Whisper + Gemini)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-4.5 h-4.5 text-[#4edea3] shrink-0 mt-0.5" />
                    <span>Sincronización en tiempo real con WebSockets</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-4.5 h-4.5 text-[#4edea3] shrink-0 mt-0.5" />
                    <span>Acceso a plantilla de Make.com e IA Proactiva</span>
                  </li>
                </ul>

                <Link 
                  href={user ? "/dashboard" : "/auth/sign-up"} 
                  className="w-full cta-gradient text-[#003824] font-extrabold py-4 rounded-2xl hover:shadow-[0_0_30px_rgba(78,222,163,0.4)] transition-all active:scale-95 text-center text-sm block"
                >
                  {user ? "Acceder a mi Cuenta Pro" : "Registrarme y Obtener Pro"}
                </Link>
              </div>

            </div>

            <div className="text-center">
              <Link href="/pricing" className="text-xs font-mono text-[#bbcabf] hover:text-[#4edea3] transition-colors underline">
                Ver tabla comparativa detallada de características →
              </Link>
            </div>

          </div>
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="py-24 px-6 md:px-12 relative max-w-4xl mx-auto w-full">
          <div className="flex flex-col gap-12">
            
            {/* Title */}
            <div className="text-center max-w-2xl mx-auto flex flex-col gap-3">
              <span className="text-[#4edea3] font-mono text-xs uppercase tracking-widest font-bold">Soporte</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Preguntas Frecuentes</h2>
              <p className="text-[#bbcabf] text-sm md:text-md">
                Resolvemos tus dudas rápidas sobre el funcionamiento de BilleterIA.
              </p>
            </div>

            {/* Accordeon (Using details elements styled beautifully) */}
            <div className="space-y-4">
              
              <details className="glass-panel rounded-2xl border border-white/10 overflow-hidden group cursor-pointer">
                <summary className="p-6 font-bold text-white flex justify-between items-center hover:bg-white/5 transition-colors select-none list-none outline-none">
                  <span>¿Cómo funciona exactamente el chatbot de Telegram?</span>
                  <ChevronDown className="w-4 h-4 text-[#bbcabf] group-open:rotate-180 transition-transform" />
                </summary>
                <div className="p-6 pt-0 text-sm text-[#bbcabf] border-t border-white/5 leading-relaxed bg-[#0b1326]/20">
                  Al configurar tu cuenta Pro, te conectas a @BilleterIA2_bot. Le envías un audio o texto plano (ej: "he cenado por 15 euros"). Nuestra integración procesa tu mensaje con la API de Gemini, estructurando los campos de Concepto, Monto, Tipo y Categoría. Luego te envía un mensaje con botones interactivos para que confirmes y se guarde en Supabase al instante.
                </div>
              </details>

              <details className="glass-panel rounded-2xl border border-white/10 overflow-hidden group cursor-pointer">
                <summary className="p-6 font-bold text-white flex justify-between items-center hover:bg-white/5 transition-colors select-none list-none outline-none">
                  <span>¿Por qué es más seguro que el Open Banking tradicional?</span>
                  <ChevronDown className="w-4 h-4 text-[#bbcabf] group-open:rotate-180 transition-transform" />
                </summary>
                <div className="p-6 pt-0 text-sm text-[#bbcabf] border-t border-white/5 leading-relaxed bg-[#0b1326]/20">
                  Las plataformas tradicionales te exigen que les entregues las claves de lectura y acceso de tus cuentas bancarias principales. BilleterIA no te pide ningún dato bancario. Tú mantienes el registro de forma manual asistida por IA por voz. Eres el dueño del servidor Supabase donde se guardan tus datos.
                </div>
              </details>

              <details className="glass-panel rounded-2xl border border-white/10 overflow-hidden group cursor-pointer">
                <summary className="p-6 font-bold text-white flex justify-between items-center hover:bg-white/5 transition-colors select-none list-none outline-none">
                  <span>¿Qué necesito para usar el Plan Pro?</span>
                  <ChevronDown className="w-4 h-4 text-[#bbcabf] group-open:rotate-180 transition-transform" />
                </summary>
                <div className="p-6 pt-0 text-sm text-[#bbcabf] border-t border-white/5 leading-relaxed bg-[#0b1326]/20">
                  Solo necesitas una cuenta en Supabase (gratuita) y opcionalmente una cuenta en Make.com (si deseas usar las plantillas de automatización prediseñadas). Te proporcionamos toda la documentación paso a paso para conectarlos en menos de 5 minutos directamente desde tu configuración.
                </div>
              </details>

              <details className="glass-panel rounded-2xl border border-white/10 overflow-hidden group cursor-pointer">
                <summary className="p-6 font-bold text-white flex justify-between items-center hover:bg-white/5 transition-colors select-none list-none outline-none">
                  <span>¿Puedo cancelar mi suscripción en cualquier momento?</span>
                  <ChevronDown className="w-4 h-4 text-[#bbcabf] group-open:rotate-180 transition-transform" />
                </summary>
                <div className="p-6 pt-0 text-sm text-[#bbcabf] border-t border-white/5 leading-relaxed bg-[#0b1326]/20">
                  Sí, la suscripción no tiene permanencia de ningún tipo. Puedes cancelar tu plan Pro directamente desde tu perfil de usuario y seguirás teniendo acceso completo en modo local (Free) sin perder tus datos de transacciones.
                </div>
              </details>

            </div>

          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-12 bg-[#060e20]/60 text-xs mt-12">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[#bbcabf]/60">
          <div className="flex items-center gap-2">
            <Logo size={24} />
            <span className="text-white font-bold">BilleterIA</span>
          </div>
          <span className="text-center">© 2026 BilleterIA. El control patrimonial sin fricciones, diseñado para Álvaro Ortega.</span>
          <div className="flex gap-4">
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Precios</Link>
            <Link href="/auth/login" className="hover:text-white transition-colors">Acceso</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
