import { createClient } from "@supabase/supabase-js";

// Helper para recuperar las credenciales de Supabase (priorizando variables de entorno y luego localStorage)
export function getSupabaseConfig() {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

  const storedUrl = typeof window !== "undefined" ? localStorage.getItem("billeteria_supabase_url") : null;
  const storedKey = typeof window !== "undefined" ? localStorage.getItem("billeteria_supabase_anon_key") : null;

  return {
    url: envUrl || storedUrl || "",
    key: envKey || storedKey || "",
    isConfigured: !!(envUrl || storedUrl) && !!(envKey || storedKey),
    source: envUrl && envKey ? "env" : (storedUrl && storedKey ? "local" : "none")
  };
}

// Inicializador diferido (lazy) para el cliente de Supabase
let cachedClient: any = null;
let lastUrl = "";
let lastKey = "";

export function getSupabase() {
  const { url, key, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;

  // Si las credenciales cambiaron, recreamos el cliente
  if (cachedClient && (url === lastUrl && key === lastKey)) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: false
      }
    });
    lastUrl = url;
    lastKey = key;
    return cachedClient;
  } catch (err) {
    console.error("Error al crear el cliente de Supabase:", err);
    return null;
  }
}
