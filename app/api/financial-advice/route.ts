import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

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

// Lógica de asesoramiento simulada si no hay API Key de Gemini
function getSimulatedAdvice(
  pregunta: string,
  stats: {
    dineroLiquido: number;
    totalAhorros: number;
    totalInversiones: number;
    totalGastosFijos: number;
    totalGastosVariables: number;
    topeFijo: number;
    topeVariable: number;
  }
) {
  const query = pregunta.toLowerCase().trim();
  const { dineroLiquido, totalAhorros, totalInversiones, totalGastosFijos, totalGastosVariables, topeFijo, topeVariable } = stats;

  const totalGastosFijosAbs = Math.abs(totalGastosFijos);
  const totalGastosVariablesAbs = Math.abs(totalGastosVariables);
  const totalGastosAbs = totalGastosFijosAbs + totalGastosVariablesAbs;
  const patrimonioTotal = dineroLiquido + totalAhorros + totalInversiones;

  let advice = "";

  if (query.includes("ahorr") || query.includes("emergencia") || query.includes("colchón") || query.includes("colchon") || query.includes("hucha")) {
    const coberturaMeses = totalGastosFijosAbs > 0 ? (totalAhorros / totalGastosFijosAbs).toFixed(1) : "0";
    advice = `### 🛡️ Diagnóstico de tu Hucha de Emergencias
Actualmente tienes **${totalAhorros.toFixed(2)}€** en ahorros. 

Tus gastos fijos mensuales son de **${totalGastosFijosAbs.toFixed(2)}€**. Esto significa que tu fondo de emergencia cubre aproximadamente **${coberturaMeses} meses** de gastos fijos de subsistencia. 

**Recomendaciones:**
- **Si es menor a 3 meses:** Te sugerimos pausar aportaciones a inversión temporalmente y desviar fondos para consolidar este colchón.
- **Si está entre 3 y 6 meses:** ¡Enhorabuena! Tienes un colchón sólido. Puedes enfocar tus excedentes en carteras de inversión.
- **Si es mayor a 6 meses:** Tu dinero podría estar perdiendo poder adquisitivo frente a la inflación. Evalúa transferir una parte a inversión indexada.`;
  } else if (query.includes("invert") || query.includes("etf") || query.includes("bolsa") || query.includes("acciones") || query.includes("interés") || query.includes("interes")) {
    const tasaInversion = patrimonioTotal > 0 ? ((totalInversiones / patrimonioTotal) * 100).toFixed(1) : "0";
    advice = `### 📈 Análisis de tu Cartera de Inversiones
Tu cartera de inversión actual asciende a **${totalInversiones.toFixed(2)}€**, representando un **${tasaInversion}%** de tu patrimonio neto total (${patrimonioTotal.toFixed(2)}€).

**Puntos Clave:**
1. **Regla del 15%:** Cada vez que tengas un ingreso (como tu nómina), te aconsejamos programar una transferencia inmediata del 15% directo a inversión. Así impides la inflación de estilo de vida.
2. **Interés Compuesto:** Si mantienes una aportación recurrente constante (ej. 150€/mes) durante 20 años a un 7% anual estimado, tus aportaciones crecerían de forma exponencial.
3. **Diversificación:** Prioriza ETFs globales de bajo coste (como MSCI World o S&P 500) antes que acciones individuales o activos altamente volátiles.`;
  } else if (query.includes("gast") || query.includes("límite") || query.includes("limite") || query.includes("presupuesto") || query.includes("fuga") || query.includes("tope")) {
    const porcentajeVariable = topeVariable > 0 ? ((totalGastosVariablesAbs / topeVariable) * 100).toFixed(1) : "0";
    const porcentajeFijo = topeFijo > 0 ? ((totalGastosFijosAbs / topeFijo) * 100).toFixed(1) : "0";
    advice = `### 💸 Auditoría de Presupuestos y Gastos
Analizando tus gastos reales frente a tus límites mensuales:
- **Gastos Fijos:** Has consumido **${totalGastosFijosAbs.toFixed(2)}€** de tu límite de **${topeFijo}€** (${porcentajeFijo}%).
- **Gastos Variables:** Has consumido **${totalGastosVariablesAbs.toFixed(2)}€** de tu límite de **${topeVariable}€** (${porcentajeVariable}%).

**Sugerencias de Optimización:**
- **Si estás cerca del límite variable (>80%):** Evita realizar comidas fuera de casa o compras discrecionales los próximos 7 días. La IA te aconseja registrar "Bizums rápidos" al instante para no perder visibilidad.
- **Suscripciones ocultas:** Revisa si tienes suscripciones fijas (Netflix, Spotify, gimnasio) inactivas. Cancelar una sola de 15€/mes libera capital para tu inversión a largo plazo.`;
  } else {
    // Respuesta genérica adaptada al patrimonio del usuario
    advice = `### 👋 ¡Hola! Soy tu Asesor Financiero BilleterIA

He analizado la foto actual de tus finanzas:
- **Dinero Neto Total (Patrimonio):** **${patrimonioTotal.toFixed(2)}€**
- **Liquidez Inmediata:** **${dineroLiquido.toFixed(2)}€**
- **Fondo de Ahorro:** **${totalAhorros.toFixed(2)}€**
- **Cartera de Inversión:** **${totalInversiones.toFixed(2)}€**

**Consejo Financiero del Día:**
Actualmente estás destinando **${(totalAhorros + totalInversiones).toFixed(2)}€** a tu futuro financiero (ahorro e inversión combinados). Mantener tu liquidez en un nivel óptimo te protege de imprevistos. 

*Pregúntame específicamente sobre:*
- *"¿Cómo voy de presupuesto de gastos?"*
- *"¿Mi fondo de ahorro es suficiente?"*
- *"¿Cómo puedo mejorar mis inversiones?"*`;
  }

  return advice;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      pregunta,
      transacciones,
      dineroLiquido = 0,
      totalAhorros = 0,
      totalInversiones = 0,
      totalGastosFijos = 0,
      totalGastosVariables = 0,
      topeFijo = 1200,
      topeVariable = 600,
    } = body;

    if (!pregunta || typeof pregunta !== "string") {
      return NextResponse.json(
        { error: "Debe proveer una pregunta válida." },
        { status: 400 }
      );
    }

    const ai = getAi();
    const stats = {
      dineroLiquido,
      totalAhorros,
      totalInversiones,
      totalGastosFijos,
      totalGastosVariables,
      topeFijo,
      topeVariable,
    };

    // Si no hay API Key de Gemini configurada, usamos el asesor simulado local
    if (!ai) {
      const simulatedAdvice = getSimulatedAdvice(pregunta, stats);
      return NextResponse.json({
        advice: simulatedAdvice,
        isSimulated: true,
      });
    }

    // Si hay API Key de Gemini, consultamos al LLM con el contexto financiero actual
    const prompt = `Actúas como "BilleterIA", un consultor y entrenador financiero proactivo, amigable y sumamente competente para el usuario Álvaro Ortega.
Tu objetivo es responder a su pregunta financiera de manera útil, motivadora y basada exclusivamente en sus datos económicos reales que te proporcionamos abajo.

CONTEXTO FINANCIERO DEL USUARIO:
- Dinero Líquido Disponible: ${dineroLiquido}€
- Hucha de Ahorros (Emergencias): ${totalAhorros}€
- Cartera de Inversiones: ${totalInversiones}€
- Gastos Fijos de este mes: ${totalGastosFijos}€ (valor negativo representa gasto)
- Gastos Variables de este mes: ${totalGastosVariables}€ (valor negativo representa gasto)
- Límite (Tope) mensual de Gastos Fijos establecido por el usuario: ${topeFijo}€
- Límite (Tope) mensual de Gastos Variables establecido por el usuario: ${topeVariable}€
- Últimos 10 movimientos registrados:
${JSON.stringify((transacciones || []).slice(0, 10), null, 2)}

PREGUNTA DEL USUARIO:
"${pregunta}"

INSTRUCCIONES DE RESPUESTA:
- Responde en español de España.
- Sé claro, motivador y directo. Usa formato Markdown con emojis y listas.
- Realiza cálculos matemáticos si la pregunta lo amerita para darle datos precisos (ej. cuánto representan sus gastos de su sueldo, o cuántos meses cubre su ahorro).
- Da consejos económicos reales (ej. la regla del 15%, reducir gastos hormiga, auditar suscripciones farragosas, el poder del interés compuesto a largo plazo, etc.).
- Mantén la respuesta concisa, de entre 3 a 5 párrafos o secciones máximo.`;

    const result = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
    });

    const advice = result.text;
    if (!advice) {
      throw new Error("Respuesta vacía de Gemini API");
    }

    return NextResponse.json({
      advice,
      isSimulated: false,
    });
  } catch (error: any) {
    console.error("Error en /api/financial-advice:", error);
    return NextResponse.json(
      { error: "Error interno al procesar el asesoramiento.", details: error.message },
      { status: 500 }
    );
  }
}
