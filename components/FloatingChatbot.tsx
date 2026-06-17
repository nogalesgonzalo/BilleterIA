"use client";

import React, { useState, useEffect, useRef } from "react";
import { Transaccion } from "../lib/types";
import { 
  MessageSquare, 
  X, 
  Send, 
  Loader2, 
  Sparkles, 
  Check, 
  Trash2, 
  PlusCircle, 
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Brain
} from "lucide-react";

interface FloatingChatbotProps {
  transacciones: Transaccion[];
  dineroLiquido: number;
  totalAhorros: number;
  totalInversiones: number;
  totalGastosFijos: number;
  totalGastosVariables: number;
  topeFijo: number;
  topeVariable: number;
  onAddTransaccion: (newTx: Omit<Transaccion, "id" | "fecha">) => Promise<void>;
}

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  isTransactionProposal?: boolean;
  proposedTransaction?: Omit<Transaccion, "id" | "fecha">;
  proposalStatus?: "pending" | "confirmed" | "cancelled";
}

export function FloatingChatbot({
  transacciones,
  dineroLiquido,
  totalAhorros,
  totalInversiones,
  totalGastosFijos,
  totalGastosVariables,
  topeFijo,
  topeVariable,
  onAddTransaccion
}: FloatingChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "👋 ¡Hola, Álvaro! Soy tu asistente financiero BilleterIA. \n\nPuedes dictarme o escribirme gastos (ej. *'He pagado 15€ en el super'*) y los registraré por ti, o bien preguntarme dudas sobre tu patrimonio."
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isLoading) return;

    const userText = chatInput.trim();
    const userMsgId = `user-${Date.now()}`;
    setMessages((prev) => [...prev, { id: userMsgId, sender: "user", text: userText }]);
    setChatInput("");
    setIsLoading(true);

    try {
      // Intentar primero parsear como transacción
      const parseResponse = await fetch("/api/parse-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userText })
      });

      if (!parseResponse.ok) throw new Error("Error calling parse API");
      const parseData = await parseResponse.json();

      if (parseData.transaction && parseData.transaction.monto !== 0) {
        // Encontró una transacción válida, proponer confirmación al usuario
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-proposal-${Date.now()}`,
            sender: "bot",
            text: parseData.responseMessage || `He detectado una transacción de **${Math.abs(parseData.transaction.monto)}€** en la categoría **${parseData.transaction.categoria}** para "${parseData.transaction.concepto}". ¿Deseas registrarla?`,
            isTransactionProposal: true,
            proposedTransaction: parseData.transaction,
            proposalStatus: "pending"
          }
        ]);
        setIsLoading(false);
        return;
      }

      // Si no es una transacción obvia, pedir asesoramiento financiero
      const adviceResponse = await fetch("/api/financial-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pregunta: userText,
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

      if (!adviceResponse.ok) throw new Error("Error calling advice API");
      const adviceData = await adviceResponse.json();

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-advice-${Date.now()}`,
          sender: "bot",
          text: adviceData.advice
        }
      ]);

    } catch (err) {
      console.error("Chatbot Error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: "bot",
          text: "⚠️ Disculpa, he tenido un pequeño problema al procesar tu mensaje. Vuelve a intentarlo en unos instantes."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmTransaction = async (msgId: string, tx: Omit<Transaccion, "id" | "fecha">) => {
    try {
      await onAddTransaccion(tx);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === msgId
            ? { ...msg, proposalStatus: "confirmed" }
            : msg
        )
      );
      // Añadir confirmación del bot
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-confirm-${Date.now()}`,
          sender: "bot",
          text: `✅ ¡Listo! He registrado el movimiento de **${Math.abs(tx.monto).toFixed(2)}€** en Supabase. Las agujas de tu dashboard se habrán actualizado.`
        }
      ]);
    } catch (err) {
      console.error(err);
      alert("Error al registrar la transacción en base de datos.");
    }
  };

  const handleCancelTransaction = (msgId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === msgId
          ? { ...msg, proposalStatus: "cancelled" }
          : msg
      )
    );
    setMessages((prev) => [
      ...prev,
      {
        id: `bot-cancel-${Date.now()}`,
        sender: "bot",
        text: "❌ Entendido, he cancelado el registro del movimiento."
      }
    ]);
  };

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-tr from-[#4edea3] to-emerald-400 hover:from-[#3ec48e] hover:to-emerald-500 text-[#002113] shadow-[0_8px_30px_rgba(78,222,163,0.4)] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 border-none outline-none cursor-pointer"
        title="Asistente Financiero IA"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <div className="relative">
            <MessageSquare className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-purple-500 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-purple-600 rounded-full" />
          </div>
        )}
      </button>

      {/* Ventana de Chat Flotante */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] h-[500px] rounded-3xl bg-[#0e172a]/95 border border-white/10 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden animate-fadeIn font-sans">
          
          {/* Cabecera del Chat */}
          <div className="bg-[#131b2e] px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#4edea3]/10 border border-[#4edea3]/20 flex items-center justify-center text-[#4edea3]">
                <Brain className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
                  BilleterIA Chatbot
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse" />
                </h4>
                <p className="text-[10px] text-[#bbcabf]/60">Asistente personal inteligente</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#bbcabf] hover:text-white transition-colors bg-transparent border-none outline-none cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Historial de Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5 custom-scrollbar bg-slate-950/20">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[85%] ${
                  msg.sender === "user" ? "self-end items-end" : "self-start items-start"
                }`}
              >
                <span className="text-[9px] text-[#bbcabf]/40 font-mono mb-0.5">
                  {msg.sender === "user" ? "TÚ" : "BILLETERIA IA"}
                </span>
                
                <div
                  className={`rounded-2xl px-3.5 py-2.5 text-[11px] leading-relaxed whitespace-pre-line ${
                    msg.sender === "user"
                      ? "bg-[#4edea3] text-[#002113] font-semibold rounded-tr-none"
                      : "bg-[#131b2e] border border-white/5 text-[#dae2fd] rounded-tl-none"
                  }`}
                >
                  {msg.text}

                  {/* Tarjeta de propuesta de transacción */}
                  {msg.isTransactionProposal && msg.proposalStatus === "pending" && msg.proposedTransaction && (
                    <div className="mt-3 bg-[#060e20]/80 border border-white/10 rounded-xl p-3 flex flex-col gap-2.5 text-xs text-white">
                      <div className="flex justify-between items-center border-b border-white/5 pb-1">
                        <span className="font-mono text-[9px] text-[#bbcabf] uppercase tracking-wider">Detalles de Ingesta</span>
                        <span className="text-[10px] font-bold text-[#4edea3] font-mono">
                          {msg.proposedTransaction.monto.toFixed(2)}€
                        </span>
                      </div>
                      <div className="space-y-1 text-[10px] text-[#bbcabf]">
                        <p>Concepto: <strong className="text-white">{msg.proposedTransaction.concepto}</strong></p>
                        <p>Categoría: <strong className="text-white">{msg.proposedTransaction.categoria}</strong></p>
                        <p>Tipo: <strong className="text-white uppercase font-mono text-[9px]">{msg.proposedTransaction.tipo}</strong></p>
                      </div>
                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={() => handleConfirmTransaction(msg.id, msg.proposedTransaction!)}
                          className="flex-1 bg-[#4edea3] hover:bg-[#3ec48e] text-[#002113] text-[10px] font-bold py-1.5 rounded-lg transition-colors cursor-pointer border-none outline-none"
                        >
                          Confirmar ✓
                        </button>
                        <button
                          onClick={() => handleCancelTransaction(msg.id)}
                          className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-[#bbcabf] hover:text-white text-[10px] font-semibold py-1.5 rounded-lg transition-colors cursor-pointer outline-none"
                        >
                          Descartar
                        </button>
                      </div>
                    </div>
                  )}

                  {msg.isTransactionProposal && msg.proposalStatus === "confirmed" && (
                    <div className="mt-2 text-[10px] text-[#4edea3] font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Transacción confirmada y guardada.
                    </div>
                  )}

                  {msg.isTransactionProposal && msg.proposalStatus === "cancelled" && (
                    <div className="mt-2 text-[10px] text-red-400 font-bold flex items-center gap-1">
                      <X className="w-3.5 h-3.5" /> Transacción descartada.
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="self-start flex items-center gap-2 bg-[#131b2e] border border-white/5 rounded-2xl rounded-tl-none px-3.5 py-2.5 text-[11px] text-[#bbcabf]">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#4edea3]" />
                <span>Procesando mensaje...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Formulario de Input */}
          <form onSubmit={handleSendMessage} className="p-3 bg-[#131b2e] border-t border-white/5 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Escribe 'gaste 15€ en cena' o haz una consulta..."
              disabled={isLoading}
              className="flex-1 bg-[#060e20]/60 border border-white/10 focus:border-[#4edea3] focus:ring-1 focus:ring-[#4edea3] rounded-xl py-2 px-3 text-xs text-[#dae2fd] placeholder:text-slate-600 outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !chatInput.trim()}
              className="bg-[#4edea3] hover:bg-[#3ec48e] text-[#002113] p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center border-none outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5 font-bold" />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
