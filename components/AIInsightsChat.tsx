"use client";

import React, { useState, useEffect, useRef } from "react";
import { Transaccion } from "../lib/types";
import { 
  Brain, 
  Sparkles, 
  Send, 
  Loader2, 
  Mic, 
  MicOff, 
  AlertCircle, 
  Bot,
  User,
  Zap
} from "lucide-react";

interface AIInsightsChatProps {
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
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

export function AIInsightsChat({
  transacciones,
  dineroLiquido,
  totalAhorros,
  totalInversiones,
  totalGastosFijos,
  totalGastosVariables,
  topeFijo,
  topeVariable
}: AIInsightsChatProps) {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "👋 ¡Hola! Soy tu asistente independiente de **AI Insights**.\n\nEscribe cualquier pregunta o consulta aquí. La enviaré directamente a mi flujo de Make IA para ofrecerte análisis detallados de tu situación financiera.",
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Speech Recognition setup
  const [recognitionSupported, setRecognitionSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setRecognitionSupported(true);
      }
    }
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.lang = "es-ES";
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setError("");
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript && transcript.trim()) {
          setQuery(transcript);
          handleSendQuery(undefined, transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error("Error stopping recognition:", err);
      }
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const handleSendQuery = async (e?: React.FormEvent, textOverride?: string) => {
    if (e) e.preventDefault();
    const userText = textOverride ? textOverride.trim() : query.trim();
    if (!userText || isLoading) return;

    // Add user message
    const userMsgId = `user-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        sender: "user",
        text: userText,
        timestamp: new Date()
      }
    ]);
    setQuery("");
    setIsLoading(true);
    setError("");

    const financialContext = {
      pregunta: userText,
      dineroLiquido,
      totalAhorros,
      totalInversiones,
      totalGastosFijos,
      totalGastosVariables,
      topeFijo,
      topeVariable,
      ultimosMovimientos: (transacciones || []).slice(0, 10)
    };

    try {
      const response = await fetch("/api/ai-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(financialContext)
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      const botReply = data.response || "Sin respuesta del agente.";

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: botReply,
          timestamp: new Date()
        }
      ]);
    } catch (err: any) {
      console.error("AI Insights chatbot error:", err);
      setError("⚠️ Error al conectar con el flujo Make de IA. Por favor, inténtalo de nuevo.");
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: "bot",
          text: "⚠️ Disculpa, he tenido un problema al conectar con el flujo de Make de IA. Asegúrate de que el webhook esté activo.",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div 
      className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col gap-6 relative overflow-hidden group animate-fadeIn w-full border border-violet-500/20 shadow-2xl" 
      id="ai-insights-panel"
    >
      {/* Background glow effects for premium look */}
      <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full bg-violet-600/10 blur-[80px] pointer-events-none group-hover:bg-violet-600/15 transition-all duration-500" />
      <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-[#4edea3]/5 blur-[80px] pointer-events-none group-hover:bg-[#4edea3]/10 transition-all duration-500" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-500/20 to-purple-500/5 border border-violet-500/30 rounded-2xl flex items-center justify-center text-violet-400 shrink-0">
            <Zap className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="font-headline-md text-headline-md text-white font-bold flex items-center gap-2">
              Chatbot AI Insights
              <span className="text-[9px] bg-violet-500/20 text-violet-300 border border-violet-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono">
                Make Webhook 2
              </span>
            </h3>
            <p className="text-xs text-[#bbcabf]/70 mt-0.5">
              Consultas independientes conectadas directamente a tu flujo de automatización en Make.com
            </p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex flex-col gap-4">
        {/* Messages Log */}
        <div 
          className="h-[350px] overflow-y-auto bg-[#060e20]/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-4 custom-scrollbar scroll-smooth"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[85%] ${
                msg.sender === "user" ? "self-end items-end" : "self-start items-start"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1">
                {msg.sender === "user" ? (
                  <>
                    <span className="text-[9px] text-[#bbcabf]/40 font-mono">TÚ</span>
                    <User className="w-2.5 h-2.5 text-[#4edea3]" />
                  </>
                ) : (
                  <>
                    <Bot className="w-2.5 h-2.5 text-violet-400" />
                    <span className="text-[9px] text-[#bbcabf]/40 font-mono">MAKE AGENT</span>
                  </>
                )}
                {isMounted && (
                  <span className="text-[8px] text-[#bbcabf]/20 font-mono">• {formatTime(msg.timestamp)}</span>
                )}
              </div>
              
              <div
                className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed whitespace-pre-line shadow-sm border ${
                  msg.sender === "user"
                    ? "bg-gradient-to-tr from-violet-600 to-purple-500 text-white border-violet-500/20 rounded-tr-none"
                    : "bg-[#131b2e] border-white/5 text-[#dae2fd] rounded-tl-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="self-start flex items-center gap-2 bg-[#131b2e] border border-white/5 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-[#bbcabf]">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400" />
              <span>Conectando con Make AI Flow...</span>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3 text-xs font-semibold animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={(e) => handleSendQuery(e)} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isListening ? "Escuchando... habla ahora 🎙️" : "Pregúntale cualquier cosa a tu flujo de Make IA..."}
            disabled={isLoading || isListening}
            className="flex-1 bg-[#060e20]/60 border border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl py-3 px-4 text-xs text-[#dae2fd] placeholder:text-slate-600 outline-none transition-colors"
          />

          {/* Voice Input Button */}
          {recognitionSupported && (
            <button
              type="button"
              onClick={toggleListening}
              disabled={isLoading}
              className={`p-3 rounded-xl transition-all cursor-pointer flex items-center justify-center border outline-none ${
                isListening
                  ? "bg-red-500/20 border-red-500/40 text-red-400 animate-pulse hover:bg-red-500/30"
                  : "bg-[#060e20]/60 border-white/10 text-[#bbcabf] hover:text-violet-400 hover:border-violet-500/40"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={isListening ? "Escuchando... Haz clic para detener" : "Escuchar voz"}
            >
              {isListening ? (
                <MicOff className="w-4 h-4 text-red-400" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Send Button */}
          <button
            type="submit"
            disabled={isLoading || isListening || !query.trim()}
            className="bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-500 hover:to-purple-400 text-white font-semibold px-5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 border-none outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">Enviar</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
