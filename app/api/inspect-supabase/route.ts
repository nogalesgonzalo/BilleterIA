import { NextResponse } from "next/server";

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const apiKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !apiKey) {
      return NextResponse.json({ error: "Credenciales de Supabase no configuradas en el entorno local." }, { status: 400 });
    }

    // Realizar la petición REST de introspección OpenAPI a la raíz de la API de Supabase
    const response = await fetch(`${url}/rest/v1/`, {
      headers: {
        "apikey": apiKey,
        "Authorization": `Bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: "Error en la petición a Supabase", status: response.status, details: errText }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
