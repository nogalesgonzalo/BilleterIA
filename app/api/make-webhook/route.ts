import { NextResponse } from "next/server";

/**
 * Proxy para el webhook de Make AI Agents.
 * Adapta el payload de BilleterIA al formato que Make AI Agents espera,
 * y normaliza la respuesta de vuelta al chatbot.
 */
const MAKE_WEBHOOK_URL = "https://hook.eu1.make.com/vk9e36gl4mrk5rztbkb4f5su6em5qlga";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Make AI Agents espera el campo "text" como mensaje principal.
    // Construimos un prompt rico con todo el contexto financiero del usuario.
    const {
      pregunta,
      dineroLiquido = 0,
      totalAhorros = 0,
      totalInversiones = 0,
      totalGastosFijos = 0,
      totalGastosVariables = 0,
      topeFijo = 1200,
      topeVariable = 600,
      ultimosMovimientos = [],
    } = body;

    const contextText = `
Contexto financiero del usuario:
- Dinero líquido disponible: ${dineroLiquido.toFixed(2)}€
- Hucha de ahorros: ${totalAhorros.toFixed(2)}€
- Cartera de inversiones: ${totalInversiones.toFixed(2)}€
- Gastos fijos este mes: ${Math.abs(totalGastosFijos).toFixed(2)}€ (límite: ${topeFijo}€)
- Gastos variables este mes: ${Math.abs(totalGastosVariables).toFixed(2)}€ (límite: ${topeVariable}€)
- Patrimonio total: ${(dineroLiquido + totalAhorros + totalInversiones).toFixed(2)}€
- Últimos movimientos: ${JSON.stringify(ultimosMovimientos.slice(0, 5))}

Pregunta del usuario: ${pregunta}
`.trim();

    const makePayload = {
      text: contextText,          // Campo que usa Make AI Agents
      pregunta,                   // Campo original por si el agente lo necesita
      dineroLiquido,
      totalAhorros,
      totalInversiones,
      totalGastosFijos,
      totalGastosVariables,
      topeFijo,
      topeVariable,
    };

    console.log("Enviando a Make AI Agents:", { pregunta, url: MAKE_WEBHOOK_URL });

    const makeResponse = await fetch(MAKE_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json, text/plain, */*",
      },
      body: JSON.stringify(makePayload),
      // Make AI Agents puede tardar hasta 30s
      signal: AbortSignal.timeout(30000),
    });

    const rawText = await makeResponse.text();
    console.log("Respuesta de Make:", makeResponse.status, rawText.substring(0, 200));

    if (!makeResponse.ok) {
      console.error("Make webhook error:", makeResponse.status, rawText);
      return NextResponse.json(
        { error: `Make respondió con ${makeResponse.status}`, details: rawText },
        { status: makeResponse.status }
      );
    }

    // Intentar parsear la respuesta como JSON
    try {
      const jsonData = JSON.parse(rawText);
      // Normalizar la respuesta: buscar el campo de texto en múltiples posibles nombres
      const responseText =
        jsonData.response ||
        jsonData.answer ||
        jsonData.message ||
        jsonData.text ||
        jsonData.output ||
        jsonData.result ||
        jsonData.content ||
        (typeof jsonData === "string" ? jsonData : JSON.stringify(jsonData));

      return NextResponse.json({ response: responseText });
    } catch {
      // Si no es JSON, devolver el texto plano directamente
      return NextResponse.json({ response: rawText || "Sin respuesta del agente." });
    }
  } catch (error: any) {
    console.error("Error en proxy /api/make-webhook:", error);

    // Timeout específico
    if (error.name === "TimeoutError" || error.name === "AbortError") {
      return NextResponse.json(
        { error: "Make AI Agent tardó demasiado en responder (>30s). Intenta de nuevo." },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: "Error al contactar con Make", details: error.message },
      { status: 500 }
    );
  }
}
