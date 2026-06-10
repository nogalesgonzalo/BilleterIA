import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

function getAi() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// Lógica de respaldo (regex) en caso de no tener API Key de Gemini
function parseTransactionBackup(text: string) {
  const normalized = text.toLowerCase().trim();
  let monto = 0;

  // Extraer montos del tipo: "15.50€", "15 euros", "15eur", "15 e"
  const amountMatch = normalized.match(/(\d+(?:[.,]\d{1,2})?)\s*(?:€|euros?|eur|e)?/i);
  if (amountMatch) {
    monto = parseFloat(amountMatch[1].replace(",", "."));
  } else {
    // Buscar patrones alternativos: "gaste 10", "pague 15", etc.
    const backupMatch = normalized.match(/(?:gaste|cobrado|pague|ahorrado|invertido)\s+(\d+(?:[.,]\d{1,2})?)/i);
    if (backupMatch) {
      monto = parseFloat(backupMatch[1].replace(",", "."));
    }
  }

  let tipo: "ingreso" | "gasto fijo" | "gasto variable" | "ahorro" | "inversión" = "gasto variable";
  let categoria = "Ocio";
  let concepto = text;

  if (
    normalized.includes("nomina") ||
    normalized.includes("nómina") ||
    normalized.includes("cobrado") ||
    normalized.includes("ingreso") ||
    normalized.includes("sueldo") ||
    normalized.includes("sueldazo") ||
    normalized.includes("recibi") ||
    normalized.includes("recibí") ||
    normalized.includes("me pagaron") ||
    normalized.includes("salario") ||
    normalized.includes("gané") ||
    normalized.includes("gane")
  ) {
    tipo = "ingreso";
    categoria = "Salario";
    concepto = normalized.includes("nomina") ? "Nómina Mensual" : "Ingreso Recibido";
  } else if (
    normalized.includes("alquiler") ||
    normalized.includes("hipoteca") ||
    normalized.includes("luz") ||
    normalized.includes("agua") ||
    normalized.includes("gas") ||
    normalized.includes("electricidad") ||
    normalized.includes("internet") ||
    normalized.includes("fibra") ||
    normalized.includes("netflix") ||
    normalized.includes("spotify") ||
    normalized.includes("suscripcion") ||
    normalized.includes("suscripción") ||
    normalized.includes("seguro") ||
    normalized.includes("comunidad")
  ) {
    tipo = "gasto fijo";
    categoria = "Hogar";
    if (normalized.includes("alquiler")) concepto = "Alquiler Mensual";
    else if (normalized.includes("netflix") || normalized.includes("spotify")) concepto = "Suscripciones Digitales";
    else concepto = "Servicios Hogar";
  } else if (
    normalized.includes("ahorro") ||
    normalized.includes("apartar") ||
    normalized.includes("guardar") ||
    normalized.includes("colchon") ||
    normalized.includes("colchón") ||
    normalized.includes("hucha")
  ) {
    tipo = "ahorro";
    categoria = "Ahorro";
    concepto = "Transferencia Ahorro";
  } else if (
    normalized.includes("inversión") ||
    normalized.includes("inversion") ||
    normalized.includes("invertir") ||
    normalized.includes("acciones") ||
    normalized.includes("cripto") ||
    normalized.includes("bitcoin") ||
    normalized.includes("btc") ||
    normalized.includes("indexados") ||
    normalized.includes("bolsa") ||
    normalized.includes("etf")
  ) {
    tipo = "inversión";
    categoria = "Inversión";
    concepto = "Aporte a Inversión";
  } else {
    tipo = "gasto variable";
    categoria = "Ocio";
    if (normalized.includes("cena") || normalized.includes("comida") || normalized.includes("restaurante") || normalized.includes("supermercado") || normalized.includes("compra")) {
      categoria = "Alimentación";
      concepto = normalized.includes("supermercado") || normalized.includes("compra") ? "Supermercado Alimentación" : "Restauración / Almuerzo";
    } else if (normalized.includes("cine") || normalized.includes("concierto") || normalized.includes("fiesta") || normalized.includes("copa")) {
      concepto = "Ocio y Eventos";
    } else if (normalized.includes("taxi") || normalized.includes("gasolina") || normalized.includes("bus") || normalized.includes("metro")) {
      categoria = "Transporte";
      concepto = "Gasto Transporte";
    } else {
      concepto = text.length < 35 ? text : "Gasto Libre Ocasional";
    }
  }

  if (monto === 0) monto = 15; // Importe por defecto en caso de no detectarlo
  concepto = concepto.charAt(0).toUpperCase() + concepto.slice(1);

  return { concepto, monto, tipo, categoria, canal: "Telegram" };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Debe proveer un campo 'text' válido." },
        { status: 400 }
      );
    }

    const normalizedText = text.trim();
    const ai = getAi();

    // Si no hay API Key de Gemini configurada, usamos el parseador de Regex local (Simulador)
    if (!ai) {
      const mockTx = parseTransactionBackup(normalizedText);
      const friendlyEmojis: Record<string, string> = {
        ingreso: "📈",
        "gasto fijo": "🏠",
        "gasto variable": "☕",
        ahorro: "🛡️",
        inversión: "👑",
      };

      let responseMessage = "";
      if (mockTx.tipo === "ingreso") {
        responseMessage = `¡Excelente noticia! He anotado un ingreso de *${mockTx.monto.toFixed(2)}€* por "${mockTx.concepto}" en la categoría *${mockTx.categoria}* ${friendlyEmojis[mockTx.tipo] || "💰"}.`;
      } else if (mockTx.tipo === "gasto fijo" || mockTx.tipo === "gasto variable") {
        responseMessage = `Registrado un gasto de *${Math.abs(mockTx.monto).toFixed(2)}€* en "${mockTx.concepto}" (Categoría: ${mockTx.categoria}) ${friendlyEmojis[mockTx.tipo]}.`;
      } else if (mockTx.tipo === "ahorro") {
        responseMessage = `¡Buen trabajo asegurando tu futuro! Guardados *${mockTx.monto.toFixed(2)}€* en tu hucha de *${mockTx.categoria}* ${friendlyEmojis[mockTx.tipo]}.`;
      } else if (mockTx.tipo === "inversión") {
        responseMessage = `¡Dinero trabajando para ti! Asignados *${mockTx.monto.toFixed(2)}€* a tu cartera de *${mockTx.categoria}* ${friendlyEmojis[mockTx.tipo]}.`;
      }

      return NextResponse.json({
        transaction: mockTx,
        responseMessage,
        isSimulated: true
      });
    }

    // Si hay API Key de Gemini, llamamos al LLM con esquema estructurado
    const prompt = `Analiza semánticamente esta frase o transcripción de audio relacionada con finanzas personales del usuario: "${normalizedText}".
Extrae los datos en formato JSON estructurado con las siguientes propiedades:
concepto: string (Un concepto breve y refinado en español del gasto o ingreso)
monto: number (El importe entero o decimal de la transacción)
tipo: string (Estrictamente uno de estos: 'ingreso', 'gasto fijo', 'gasto variable', 'ahorro', 'inversión')
categoria: string (Categoría corta en una palabra como: 'Salario', 'Hogar', 'Ocio', 'Salud', 'Transporte', 'Alimentación', 'Ahorro', 'Inversión')
canal: string (Por defecto 'Telegram')

Si no es una transacción financiera obvia, devuélvelo todo vacío o nulo para la transacción, pero siempre debes responder de manera amigable en 'responseMessage'.`;

    const result = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            concepto: { type: Type.STRING },
            monto: { type: Type.NUMBER },
            tipo: { type: Type.STRING },
            categoria: { type: Type.STRING },
            canal: { type: Type.STRING },
            responseMessage: {
              type: Type.STRING,
              description: "Un mensaje amigable y personalizado de confirmación en español como un bot de Telegram."
            }
          },
          required: ["responseMessage"]
        }
      }
    });

    const textResponse = result.text;
    if (!textResponse) {
      throw new Error("Respuesta vacía de Gemini API");
    }

    const data = JSON.parse(textResponse);
    
    // Si el LLM no pudo mapear la transacción, creamos un fallback
    if (!data.concepto || !data.monto) {
      return NextResponse.json({
        transaction: null,
        responseMessage: data.responseMessage || "Entendido. No he podido registrar ninguna transacción financiera clara a partir de tu mensaje."
      });
    }

    // Validar tipo correcto del ENUM
    const tipoValido = ["ingreso", "gasto fijo", "gasto variable", "ahorro", "inversión"].includes(data.tipo)
      ? data.tipo
      : "gasto variable";

    // Si es gasto en el JSON de Gemini pero viene en positivo, lo cambiamos a negativo para guardar la coherencia del dashboard
    let finalMonto = data.monto;
    if ((tipoValido === "gasto fijo" || tipoValido === "gasto variable") && finalMonto > 0) {
      finalMonto = -finalMonto;
    }

    const transaction = {
      concepto: data.concepto,
      monto: finalMonto,
      tipo: tipoValido,
      categoria: data.categoria || "Otros",
      canal: "Telegram"
    };

    return NextResponse.json({
      transaction,
      responseMessage: data.responseMessage,
      isSimulated: false
    });

  } catch (error: any) {
    console.error("Error en /api/parse-transaction:", error);
    return NextResponse.json(
      { error: "Error interno al procesar el mensaje.", details: error.message },
      { status: 500 }
    );
  }
}
