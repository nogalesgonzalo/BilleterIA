import { NextResponse } from "next/server";

/**
 * Proxy para el webhook de Make AI (AI Insights).
 * Redirige las consultas del chatbot independiente de AI Insights
 * hacia el nuevo webhook de Make, aportando el contexto financiero.
 */
const MAKE_WEBHOOK_URL = "https://hook.eu1.make.com/fg7jmrujl4o3verrv62ioae6x3jwchko";

export async function POST(request: Request) {
  try {
    const body = await request.json();

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

    // Crear un contexto financiero descriptivo para el flujo de Make
    const contextText = `
Contexto financiero del usuario (AI Insights):
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
      text: contextText,          // Mensaje de texto principal
      pregunta,                   // Pregunta limpia por si el flujo la requiere por separado
      dineroLiquido,
      totalAhorros,
      totalInversiones,
      totalGastosFijos,
      totalGastosVariables,
      topeFijo,
      topeVariable,
      timestamp: new Date().toISOString(),
    };

    console.log("Enviando a Make AI Insights Webhook:", { pregunta, url: MAKE_WEBHOOK_URL });

    const makeResponse = await fetch(MAKE_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json, text/plain, */*",
      },
      body: JSON.stringify(makePayload),
      // Límite de tiempo razonable
      signal: AbortSignal.timeout(30000),
    });

    const rawText = await makeResponse.text();
    console.log("Respuesta de Make (Insights):", makeResponse.status, rawText.substring(0, 200));

    if (!makeResponse.ok) {
      console.error("Make Webhook Error (Insights):", makeResponse.status, rawText);
      return NextResponse.json(
        { error: `Make respondió con estado ${makeResponse.status}`, details: rawText },
        { status: makeResponse.status }
      );
    }

    // Intentar interpretar la respuesta como JSON
    try {
      const jsonData = JSON.parse(rawText);
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
      // Si la respuesta es texto plano directo, devolverla así
      return NextResponse.json({ response: rawText || "Sin respuesta del agente." });
    }
  } catch (error: any) {
    console.error("Error en proxy /api/ai-insights:", error);

    if (error.name === "TimeoutError" || error.name === "AbortError") {
      return NextResponse.json(
        { error: "El agente de Make tardó demasiado en responder (>30s). Intenta de nuevo." },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: "Error al contactar con el Webhook de Make", details: error.message },
      { status: 500 }
    );
  }
}
