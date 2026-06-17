import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Si no están configuradas las variables de Supabase, devolvemos un mock client
  // para permitir el modo demo y flujos fake sin crasear la app
  if (!url || !key) {
    console.warn("Supabase env variables missing. Running in mock client mode.");

    return {
      auth: {
        getUser: async () => {
          if (typeof window !== "undefined") {
            const fakeUser = localStorage.getItem("billeteria_fake_user");
            if (fakeUser) {
              return { data: { user: JSON.parse(fakeUser) }, error: null };
            }
          }
          return { data: { user: null }, error: null };
        },
        signInWithPassword: async ({ email }: { email: string }) => {
          const fakeUser = { id: "fake-uid-123", email };
          if (typeof window !== "undefined") {
            localStorage.setItem("billeteria_fake_user", JSON.stringify(fakeUser));
            document.cookie = `billeteria_fake_user=${encodeURIComponent(JSON.stringify(fakeUser))}; path=/; max-age=31536000`;
          }
          return { data: { user: fakeUser }, error: null };
        },
        signUp: async ({ email }: { email: string }) => {
          const fakeUser = { id: "fake-uid-123", email };
          if (typeof window !== "undefined") {
            localStorage.setItem("billeteria_fake_user", JSON.stringify(fakeUser));
            document.cookie = `billeteria_fake_user=${encodeURIComponent(JSON.stringify(fakeUser))}; path=/; max-age=31536000`;
          }
          return { data: { user: fakeUser }, error: null };
        },
        signOut: async () => {
          if (typeof window !== "undefined") {
            localStorage.removeItem("billeteria_fake_user");
            document.cookie = "billeteria_fake_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          }
          return { error: null };
        },
        onAuthStateChange: (callback: any) => {
          return { data: { subscription: { unsubscribe: () => {} } } };
        },
      },
      from: () => ({
        select: () => ({
          or: () => ({
            order: async () => ({ data: [], error: new Error("Supabase credentials not configured") }),
          }),
          eq: () => ({
            order: async () => ({ data: [], error: new Error("Supabase credentials not configured") }),
          }),
          order: async () => ({ data: [], error: new Error("Supabase credentials not configured") }),
        }),
        insert: async () => ({ error: new Error("Supabase credentials not configured") }),
        delete: async () => ({ error: new Error("Supabase credentials not configured") }),
      }),
      channel: () => ({
        on: () => ({
          subscribe: () => ({})
        })
      }),
      removeChannel: () => {},
    } as any;
  }

  return createBrowserClient(url, key);
}
