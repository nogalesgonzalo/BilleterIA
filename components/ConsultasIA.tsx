"use client";

import React, { useState, useEffect, useRef } from "react";
import { Transaccion } from "../lib/types";
import { Brain, Sparkles, Send, Loader2, Mic, MicOff, AlertCircle } from "lucide-react";

interface ConsultasIAProps {
  transacciones: Transaccion[];
  dineroLiquido: number;
  totalAhorros: number;
  totalInversiones: number;
  totalGastosFijos: number;
  totalGastosVariables: number;
  topeFijo: number;
  topeVariable: number;
}

export function ConsultasIA({
  transacciones,
  dineroLiquido,
  totalAhorros,
  totalInversiones,
  totalGastosFijos,
  totalGastosVariables,
  topeFijo,
  topeVariable
}: ConsultasIAProps) {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Speech Recognition states
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

  // Clean up speech recognition on unmount
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

    setIsLoading(true);
    setError("");
    setResponse("");

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
      let botReply = "";
      try {
        const makeResponse = await fetch("/api/make-webhook", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(financialContext)
        });

        if (makeResponse.ok) {
          const makeData = await makeResponse.json();
          botReply = makeData.response || makeData.answer || makeData.message || makeData.text || makeData.advice || JSON.stringify(makeData);
        } else {
          throw new Error(`Make webhook status ${makeResponse.status}`);
        }
      } catch (makeErr) {
        console.warn("Make webhook offline/error, fallback to local advice API:", makeErr);
        const adviceResponse = await fetch("/api/financial-advice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(financialContext)
        });
        if (!adviceResponse.ok) throw new Error("Error calling local advice API");
        const adviceData = await adviceResponse.json();
        botReply = adviceData.advice;
      }

      setResponse(botReply);
    } catch (err) {
      console.error("ConsultasIA Error:", err);
      setError("⚠️ Lo sentimos, ocurrió un error al procesar tu consulta con la IA. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col gap-6 relative overflow-hidden group animate-fadeIn w-full" id="consultas-ia-panel">
      {/* Background glow effects for premium look */}
      <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full bg-purple-500/10 blur-[80px] pointer-events-none group-hover:bg-purple-500/15 transition-all duration-500" />
      <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-[#4edea3]/5 blur-[80px] pointer-events-none group-hover:bg-[#4edea3]/10 transition-all duration-500" />

      {/* Header */}
      <div className="flex items-center gap-3.5 border-b border-white/5 pb-4">
        <div className="w-12 h-12 bg-purple-500/15 border border-purple-500/30 rounded-2xl flex items-center justify-center text-purple-400 shrink-0">
          <Brain className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h3 className="font-headline-md text-headline-md text-white font-bold flex items-center gap-2">
            Consultas Avanzadas con IA
            <span className="text-[9px] bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono">
              Make Webhook
            </span>
          </h3>
          <p className="text-xs text-[#bbcabf]/70 mt-0.5">
            Interactúa directamente con el Webhook de Make enviando todo tu contexto financiero actual
          </p>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={(e) => handleSendQuery(e)} className="flex flex-col gap-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isListening ? "Escuchando... habla ahora 🎙️" : "Pregunta sobre estrategias de inversión, optimización de gastos, planes de ahorro..."}
            disabled={isLoading || isListening}
            className="flex-1 bg-[#060e20]/60 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl py-3 px-4 text-xs text-[#dae2fd] placeholder:text-slate-600 outline-none transition-colors"
          />
          
          {/* Audio voice input button */}
          {recognitionSupported && (
            <button
              type="button"
              onClick={toggleListening}
              disabled={isLoading}
              className={`p-3 rounded-xl transition-all cursor-pointer flex items-center justify-center border outline-none ${
                isListening
                  ? "bg-red-500/20 border-red-500/40 text-red-400 animate-pulse hover:bg-red-500/30"
                  : "bg-[#060e20]/60 border-white/10 text-[#bbcabf] hover:text-purple-400 hover:border-purple-500/40"
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

          <button
            type="submit"
            disabled={isLoading || isListening || !query.trim()}
            className="bg-purple-500 hover:bg-purple-600 text-white font-semibold px-5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 border-none outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">Consultar</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Loading Status */}
      {isLoading && (
        <div className="flex items-center gap-3 bg-purple-500/5 border border-purple-500/10 rounded-2xl p-4 text-xs text-[#bbcabf] animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
          <span>Analizando contexto financiero y procesando consulta en Make Webhook...</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl p-4 text-xs font-semibold">
          <AlertCircle className="w-4.5 h-4.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Response Box */}
      {response && !isLoading && (
        <div className="bg-[#060e20]/40 border border-purple-500/20 rounded-2xl p-5 flex flex-col gap-3.5 animate-fadeIn">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <Sparkles className="w-4.5 h-4.5 text-purple-400 animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-300">
              Respuesta del Asesor IA
            </span>
          </div>
          <div className="text-xs leading-relaxed text-[#dae2fd] whitespace-pre-line font-normal">
            {response}
          </div>
        </div>
      )}
    </div>
  );
}
